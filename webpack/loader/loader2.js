// loader本质上就是一个函数，接受原始内容，返回转换后的内容。
function loader2(sourceCode) {
    console.log('join loader2');
    return sourceCode + '\n console.log(\'loader2\')';
}

module.exports = loader2;
