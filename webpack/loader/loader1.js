// loader本质上就是一个函数，接受原始内容，返回转换后的内容。
function loader1(sourceCode) {
    console.log('join loader1');
    return sourceCode + '\n console.log(\'loader1\')';
}

module.exports = loader1;
