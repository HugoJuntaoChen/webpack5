const path = require('path');
const { SyncHook, AsyncSeriesHook } = require('tapable');
const Compilation = require('./compilation');

class Compiler {
    constructor(options) {
        this.options = options;
        // root path
        this.rootPath = this.options.context || toUnixPath(process.cwd());
        // create plugins hooks
        this.hooks = {
            // Adds a hook right before running the compiler.
            beforeRun: new AsyncSeriesHook(["compiler"]),
            // Hook into the compiler before it begins reading
            run: new AsyncSeriesHook(["compiler"]),
            // new Compilation
            compilation: new SyncHook(["compilation", "params"]),
            // after compilation finish and seal
            afterCompile: new AsyncSeriesHook(['compilation']),
            // executed right before emitting assets to output dir
            emit: new AsyncSeriesHook(['compilation']),
            // Executed when the compilation has completed
            done: new AsyncSeriesHook(['stats']),
            // not show in the webpack document, but appears in the source code
            afterDone: new SyncHook(["stats"]),
            // 
            failed: new SyncHook(['reason'])
        };
        // init compilation hash 
        this.compilationHash = 1;
    }
    // config watch mode
    watch(watchOptions) {
        // handle watchOptions
    }
    // run start compile
    run(callback) {
        // handle error | handle afterDone
        const finalCallback = (err, stats) => {
            if (err) {
                this.hooks.failed.call(err);
            }
            if (callback !== undefined) callback(err, stats);
            this.hooks.afterDone.call(stats);
        };

        this.hooks.beforeRun.callAsync(this, err => {
            if (err) finalCallback(err);
            // this.hooks.run.callAsync(this);
        });
        this.onCompile(finalCallback);
    }
    onCompile(callback) {
        // new Compilation
        const params = {};
        const compilation = this.newCompilation(params);
        const onCompiled = () => {
            //  ...
            this.compilation.finish(callback);
            // ...
            this.hooks.afterCompile.callAsync(compilation, err => {
                if (err) return callback(err);
            });
            // emitAssets
            this.emitAssets(compilation, err => {
                if (err) return callback(err);
            });
        }
        compilation.start(onCompiled);
    }
    newCompilation(params) {
        // ... do something before new Compilation
        //...createModuleFactory, createContextFactory
        const compilation = new Compilation(this);
        // create compilation
        this.hooks.compilation.call(compilation, params);
        this.compilation = compilation;
        return compilation;
    }
    emitAssets(compilation, callback) {
        // ...
        this.hooks.emit.callAsync(compilation, err => {
            if (err) return callback(err);
            return callback();
        });
        // ... 
        compilation.emitFile();
        // ...
        const stats = new Stats(compilation);
        this.hooks.done.callAsync(stats, err => {
            if (err) return callback(err);
            return callback();
        });
    }
}

// Record the status of the current compilation
class Stats {
    constructor(compilation) {
        this.compilation = compilation;
    }
    get hash() {
        return this.compilation.hash;
    }
    get startTime() {
        return this.compilation.startTime;
    }
    get endTime() {
        return this.compilation.endTime;
    }
    // ...
}

module.exports = Compiler;
