// loader is essentially a function that accepts the original content and returns the transformed content.
function loader1(sourceCode) {
    return sourceCode + '\n console.log(\'loader1\')';
}

module.exports = loader1;
