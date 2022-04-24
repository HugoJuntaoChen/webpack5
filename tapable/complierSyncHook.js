const { SyncHook } = require('tapable');

const webpackSomeHook = new SyncHook(['complier', 'compilation']);

webpackSomeHook.tap('plugin1', (compiler, compilation) => {
    console.log('here is plugin1,', compiler, compilation);
})
webpackSomeHook.tap('plugin2', (compiler, compilation, arg3) => {
    console.log('here is plugin2,', compiler, compilation, arg3);
})

const compilerObj = { name: 'compiler!!' };
const compilationObj = { name: 'compilation!!' };

webpackSomeHook.call(compilerObj, compilationObj)
// here is plugin1, { name: 'compiler!!' } { name: 'compilation!!' }
// here is plugin2, { name: 'compiler!!' } { name: 'compilation!!' } undefined