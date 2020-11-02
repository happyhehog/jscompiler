const fs = require('fs');
const assert = require('assert');
const {Parser} = require("../src/Parser");

const testFolder = './test/ast';
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
            for (let i = 2; i < f.length - 1; i++) {
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
                const result = new Parser(files[file]).parse().print().trim();
                const expected = fs.readFileSync(files[file].replace('.in', '.out')).toString().replaceAll('\r\n', '\n').trim();
                if (result === expected) {
                    done();
                } else {
                    done('Result != expected');
                }

            });
        }
    });
}

// describe('Array', function() {
//     for (let i in a) {
//         console.log(i);
//         describe(i, function() {
//             it('should return -1 when the value is not present', function() {
//                 assert.equal([1, 2, 3].indexOf(4), -1);
//             });
//         });
//     }
// });