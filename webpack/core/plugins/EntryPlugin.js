const path = require('path');
const { toUnixPath } = require('../../utils')
class EntryPlugin {
    apply(compiler) {
        compiler.compilation.hooks.addEntry.tap('EntryPlugin', (entry, optionsEntry) => {
            // check whether it is single entry or multiple entry
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
                    entry[key] = toUnixPath(path.join(compiler.rootPath, value));
                }
            });
            compiler.compilation.entry = entry;
            console.log(entry);
        });
    }
}

module.exports = EntryPlugin;
