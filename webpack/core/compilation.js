const path = require('path');
const fs = require('fs');
const { SyncHook, AsyncSeriesHook } = require('tapable');

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;
const t = require('@babel/types');
const { getSourceCode, tryExtensions, toUnixPath } = require('../utils')
class Compilation {

    constructor(compiler) {
        // root path
        this.rootPath = compiler.options.context;
        this.compiler = compiler;
        this.hash = compiler.compilationHash++;
        this.options = compiler.options;
        this.hooks = {
            // Triggered before a module build has started, can be used to modify the module
            buildModule: new SyncHook(["module"]),
            // Executed when a module has been built successfully
            succeedModule: new SyncHook(["module"]),
            // Called when all modules have been built without errors.
            finishModules: new AsyncSeriesHook(["modules"]),
            // Fired when the compilation stops accepting new modules.
            seal: new SyncHook([]),
            // before build chunks
            beforeChunks: new SyncHook([]),
            // Executed when chunks has been built successfully
            afterChunks: new SyncHook(["chunks"]),
            // ...
            // optimize
            // ...
            // assets
            // ...
        };

        this.entries = new Set();

        this.modules = new Set();

        this.chunks = new Set();

        this.assets = new Set();
    }

    start(callback) {
        this.getEntry();
        // ...
        // ...
        // after complied
        callback();
    }

    getEntry() {
        let entry = Object.create(null);
        const { entry: optionsEntry } = this.options;
        if (typeof optionsEntry === 'string') {
            entry['main'] = optionsEntry;
        } else {
            entry = optionsEntry;
        }
        // Turn entry into an absolute path
        Object.keys(entry).forEach((key) => {
            const value = entry[key];
            if (!path.isAbsolute(value)) {
                // When converting to an absolute path, the unified path separator is /
                entry[key] = toUnixPath(path.join(this.rootPath, value));
            }
        });
        this.addModuleTree(entry);
    }

    // Collect modules from every single entry
    addModuleTree(entry) {
        Object.keys(entry).forEach((entryName) => {
            const entryPath = entry[entryName];
            // implement the real module compilation logic
            const entryObj = this.buildModule(entryName, entryPath);
            entryObj['entryName'] = entryName;
            this.entries.add(entryObj);
        });
    }
    // module compilation
    buildModule(moduleName, modulePath) {
        // 1. read source code
        const originSourceCode = this.originSourceCode = fs.readFileSync(modulePath, 'utf-8');
        // create module
        const module = {
            // use the absolute path as the module ID
            id: './' + path.posix.relative(this.rootPath, modulePath),
            // The absolute path address of the module that this module depends on
            dependencies: new Set(),
            // The entry file to which the module belongs
            name: [moduleName],
            // file code
            _source: null
            // ...
        };
        // moduleCode is the modified code
        this.moduleCode = originSourceCode;

        this.hooks.buildModule.call(module);
        //  2. use loader to deal with source code
        this.handleLoader(modulePath);
        // 3. Call babel for module compilation to get the final module object
        const newModule = this.handleWebpackCompilation(moduleName, modulePath, module);

        this.hooks.succeedModule.call(newModule);
        // 4. return module
        return newModule;
    }

    handleLoader(modulePath) {
        const matchLoaders = [];
        // 1. Get all loader rules
        const rules = this.options.module.rules;
        rules.forEach((loader) => {
            const testRule = loader.test;
            if (testRule.test(modulePath)) {
                if (loader.loader) {
                    // { test: /\.js$/, loader: 'babel-loader' }
                    matchLoaders.push(loader.loader);
                } else {
                    // { test: /\.js$/g, use: ['babel-loader'] }
                    matchLoaders.push(...loader.use);
                }
            }
            // 2. Execute the loader in reverse order to pass in the source code
            for (let i = matchLoaders.length - 1; i >= 0; i--) {

                const loaderFn = require(matchLoaders[i]);
                // Synchronously process source code for each compilation through the loader
                this.moduleCode = loaderFn(this.moduleCode);
            }
        });
    }
    // Invoke babel for module compilation
    handleWebpackCompilation(moduleName, modulePath, module) {
        // Call babel to analyze our code
        const ast = parser.parse(this.moduleCode, {
            sourceType: 'module',
        });
        // DFS Tree
        traverse(ast, {
            // When encountering a require statement
            CallExpression: (nodePath) => {
                const node = nodePath.node;
                if (node.callee.name === 'require') {
                    // Get the relative path of the imported module in the source code
                    const requirePath = node.arguments[0].value;
                    // Find the absolute path of the module, The current module path + require() corresponds to the relative path
                    const moduleDirName = path.posix.dirname(modulePath);
                    const absolutePath = tryExtensions(
                        path.posix.join(moduleDirName, requirePath),
                        this.options.resolve.extensions,
                        requirePath,
                        moduleDirName
                    );
                    // Generate moduleId - add into a new dependency path for the module ID followed by the path
                    const moduleId =
                        './' + path.posix.relative(this.rootPath, absolutePath);
                    node.callee = t.identifier('__webpack_require__');
                    // Modify all modules required to be imported in the source code to be processed relative to the path
                    node.arguments = [t.stringLiteral(moduleId)];

                    const alreadyModules = Array.from(this.modules).map((i) => i.id);
                    if (!alreadyModules.includes(moduleId)) {
                        // Add the dependency caused by the require statement to the current module 
                        // (the content is the module ID relative to the root path)
                        module.dependencies.add(moduleId);
                    } else {
                        // If it already exists, although it is not added into the module compilation
                        // it is still necessary to update the entry that this module depends on.
                        this.modules.forEach((value) => {
                            if (value.id === moduleId) {
                                value.name.push(moduleName);
                            }
                        });
                    }
                }
            },
        });
        // At the end of the traversal, generate new code according to the AST
        const { code } = generator(ast);

        module._source = code;
        // traversal If there is a dependency module, add it
        module.dependencies.forEach((dependency) => {
            const depModule = this.buildModule(moduleName, dependency);
            // Add any compiled dependent module objects to the modules object
            this.modules.add(depModule);
        });
        return module;
    }

    finish(callback) {
        // ...
        this.hooks.finishModules.callAsync(this.modules, err => {
            if (err) return callback(err);
        })
        this.seal(callback);
        // ...
    }

    seal(callback) {
        // ...
        this.hooks.seal.call(this.modules);
        // ...
        this.hooks.beforeChunks.call();

        this.buildUpChunk(callback);
    }
    // Assemble chunks from entry files and dependent modules
    buildUpChunk() {
        this.entries.forEach(entry => {
            const { entryName } = entry;
            const chunk = {
                name: entryName,
                entryModule: entry,
                modules: Array.from(this.modules).filter((i) =>
                    i.name.includes(entryName)
                ), // Find all modules related to the current entry
            };
            this.chunks.add(chunk);
        })
        this.hooks.afterChunks.call(this.chunks)
    }
    // emit this.chunks
    emitFile() {
        const output = this.options.output;
        // Generate assets content based on chunks
        this.chunks.forEach((chunk) => {
            const parseFileName = output.filename.replace('[name]', chunk.name);
            this.assets[parseFileName] = getSourceCode(chunk);
        });

        if (!fs.existsSync(output.path)) {
            fs.mkdirSync(output.path);
        }
        // Generate a file from the contents of assets and write it to the file system
        Object.keys(this.assets).forEach((fileName) => {
            const filePath = path.join(output.path, fileName);
            fs.writeFileSync(filePath, this.assets[fileName]);
        });
    }
}

module.exports = Compilation;