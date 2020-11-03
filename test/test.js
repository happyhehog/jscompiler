const fs = require('fs');
const {Parser} = require("../src/Parser");

const testFolder = process.argv[3];
const testsList = {};

function getTestsFromFolder(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            getTestsFromFolder(file);
        } else {
            if (file.split('.').pop() !== 'in') {
                return;
            }

            const f = file.split('\/');
            let fileCategory = '';
            for (let i = 1; i < f.length - 1; i++) {
                fileCategory += f[i] + '/';
            }

            if (typeof testsList[fileCategory] === 'undefined') {
                testsList[fileCategory] = [file];
            } else {
                testsList[fileCategory].push(file);
            }
        }
    });
}

getTestsFromFolder(testFolder);

for (const key in testsList) {
    describe(key, function() {
        const files = testsList[key];
        for (const file in files) {
            const filename = files[file].split('/').pop();
            it(filename, function (done) {
                const parser = new Parser(files[file]);
                const tree = parser.parse();
                const result = key.startsWith('parser') ?
                    parser.getStringTree(tree) :
                    parser.getAst(tree).print().trim();
                const expected = fs.readFileSync(files[file].replace('.in', '.out')).toString().replaceAll('\r\n', '\n').trim();
                done(result === expected ? null : new Error('Result != expected'));
            });
        }
    });
}
