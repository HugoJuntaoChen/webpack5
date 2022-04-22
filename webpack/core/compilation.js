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
            addEntry: new SyncHook(["entry", "options"]),

            buildModule: new SyncHook(["module"]),

            succeedModule: new SyncHook(["module"]),

            finishModules: new AsyncSeriesHook(["modules"]),

            seal: new SyncHook([]),

            beforeChunks: new SyncHook([]),

            afterChunks: new SyncHook(["chunks"]),
            // ...
            // optimize
            // ...
            // assets
            // ...
        };
        //
        this.entries = new Set();
        //
        this.modules = new Set();
        // 
        this.chunks = new Set();
        // 
        this.assets = new Set();
        // 
        this.files = new Set();
    }

    start(callback) {
        this.getEntry();
        // ...
        // ...
        callback();
    }

    // Entry Plugin
    getEntry() {
        let entry = Object.create(null);
        const { entry: optionsEntry } = this.options;
        if (typeof optionsEntry === 'string') {
            entry['main'] = optionsEntry;
        } else {
            entry = optionsEntry;
        }
        // 将entry变成绝对路径
        Object.keys(entry).forEach((key) => {
            const value = entry[key];
            if (!path.isAbsolute(value)) {
                // 转化为绝对路径的同时统一路径分隔符为 /
                entry[key] = toUnixPath(path.join(this.rootPath, value));
            }
        });
        this.hooks.addEntry.call(entry, this.options);
        this.addModuleTree(entry);
    }

    addModuleTree(entry) {
        Object.keys(entry).forEach((entryName) => {
            const entryPath = entry[entryName];
            // 调用buildModule实现真正的模块编译逻辑
            const entryObj = this.buildModule(entryName, entryPath);
            entryObj['entryName'] = entryName;
            this.entries.add(entryObj);
        });
    }
    // 模块编译方法
    buildModule(moduleName, modulePath) {
        // 1. 读取文件原始代码
        const originSourceCode = this.originSourceCode = fs.readFileSync(modulePath, 'utf-8');
        // 创建模块对象
        const module = {
            // 将当前模块相对于项目启动根目录计算出相对路径 作为模块ID
            id: './' + path.posix.relative(this.rootPath, modulePath),
            dependencies: new Set(), // 该模块所依赖模块绝对路径地址
            name: [moduleName], // 该模块所属的入口文件
            _source: null //源代码
            // ...
        };
        // moduleCode为修改后的代码
        this.moduleCode = originSourceCode;

        this.hooks.buildModule.call(module);
        //  2. 调用loader进行处理
        this.handleLoader(modulePath);
        // 3. 调用webpack 进行模块编译 获得最终的module对象
        const newModule = this.handleWebpackCompiler(moduleName, modulePath, module);

        this.hooks.succeedModule.call(newModule);
        // 4. 返回对应module
        return newModule;
    }

    // 匹配loader处理
    handleLoader(modulePath) {
        const matchLoaders = [];
        // 1. 获取所有传入的loader规则
        const rules = this.options.module.rules;
        rules.forEach((loader) => {
            const testRule = loader.test;
            if (testRule.test(modulePath)) {
                if (loader.loader) {
                    // 仅考虑loader { test:/\.js$/g, use:['babel-loader'] }, { test:/\.js$/, loader:'babel-loader' }
                    matchLoaders.push(loader.loader);
                } else {
                    matchLoaders.push(...loader.use);
                }
            }
            // 2. 倒序执行loader传入源代码
            for (let i = matchLoaders.length - 1; i >= 0; i--) {
                // 目前我们外部仅支持传入绝对路径的loader模式
                // require引入对应loader
                const loaderFn = require(matchLoaders[i]);
                // 通过loader同步处理我的每一次编译的moduleCode
                this.moduleCode = loaderFn(this.moduleCode);
            }
        });
    }
    // 调用babel进行模块编译
    handleWebpackCompiler(moduleName, modulePath, module) {
        // 调用babel分析我们的代码
        const ast = parser.parse(this.moduleCode, {
            sourceType: 'module',
        });
        // 深度优先 遍历语法Tree
        traverse(ast, {
            // 当遇到require语句时
            CallExpression: (nodePath) => {
                const node = nodePath.node;
                if (node.callee.name === 'require') {
                    // 获得源代码中引入模块相对路径
                    const requirePath = node.arguments[0].value;
                    // 寻找模块绝对路径 当前模块路径+require()对应相对路径
                    const moduleDirName = path.posix.dirname(modulePath);
                    const absolutePath = tryExtensions(
                        path.posix.join(moduleDirName, requirePath),
                        this.options.resolve.extensions,
                        requirePath,
                        moduleDirName
                    );
                    // 生成moduleId - 针对于跟路径的模块ID 添加进入新的依赖模块路径
                    const moduleId =
                        './' + path.posix.relative(this.rootPath, absolutePath);
                    // 通过babel修改源代码中的require变成__webpack_require__语句
                    node.callee = t.identifier('__webpack_require__');
                    // 修改源代码中require语句引入的模块 全部修改变为相对于跟路径来处理
                    node.arguments = [t.stringLiteral(moduleId)];
                    // 转化为ids的数组 好处理
                    const alreadyModules = Array.from(this.modules).map((i) => i.id);
                    if (!alreadyModules.includes(moduleId)) {
                        // 为当前模块添加require语句造成的依赖(内容为相对于根路径的模块ID)
                        module.dependencies.add(moduleId);
                    } else {
                        // 已经存在的话 虽然不进行添加进入模块编译 但是仍要更新这个模块依赖的入口
                        this.modules.forEach((value) => {
                            if (value.id === moduleId) {
                                // 可以加上去重，value.name是入口
                                value.name.push(moduleName);
                            }
                        });
                    }
                }
            },
        });
        // 遍历结束根据AST生成新的代码
        const { code } = generator(ast);
        // 为当前模块挂载新的生成的代码
        module._source = code;
        // 递归依赖深度遍历 存在依赖模块则加入
        module.dependencies.forEach((dependency) => {
            const depModule = this.buildModule(moduleName, dependency);
            // 将编译后的任何依赖模块对象加入到modules对象中去
            this.modules.add(depModule);
        });
        // 返回当前模块对象
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
        // 根据当前入口文件和模块的相互依赖关系，组装成为一个个包含当前入口所有依赖模块的chunk
        this.buildUpChunk(callback);
    }
    // 根据入口文件和依赖模块组装chunks
    buildUpChunk() {
        this.entries.forEach(entry => {
            const { entryName } = entry;
            const chunk = {
                name: entryName, // 每一个入口文件作为一个chunk
                entryModule: entry, // entry编译后的对象
                modules: Array.from(this.modules).filter((i) =>
                    i.name.includes(entryName)
                ), // 寻找与当前entry有关的所有module
            };
            // 将chunk添加到this.chunks中去
            this.chunks.add(chunk);
        })
        this.hooks.afterChunks.call(this.chunks)
    }
    // 将chunk加入输出列表中去
    emitFile() {
        const output = this.options.output;
        // 根据chunks生成assets内容
        this.chunks.forEach((chunk) => {
            const parseFileName = output.filename.replace('[name]', chunk.name);
            // assets中 { 'main.js': '生成的字符串代码...' }
            this.assets[parseFileName] = getSourceCode(chunk);
        });
        // 先判断目录是否存在 存在直接fs.write 不存在则首先创建
        if (!fs.existsSync(output.path)) {
            fs.mkdirSync(output.path);
        }
        // files中保存所有的生成文件名
        this.files = Object.keys(this.assets);
        // 将assets中的内容生成打包文件 写入文件系统中
        Object.keys(this.assets).forEach((fileName) => {
            const filePath = path.join(output.path, fileName);
            fs.writeFileSync(filePath, this.assets[fileName]);
        });
    }
}

module.exports = Compilation;