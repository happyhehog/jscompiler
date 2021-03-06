const NoSourceFileError = require('./Errors').NoSourceFileError;
const Parser = require('./parser').Parser;

const DELIMITER = '====================================================';

function parseFile(filePath) {
    console.log(`\n${DELIMITER}`);
    console.log('Found source file: ' + filePath);
    console.log(DELIMITER);

    const parser = new Parser(filePath);
    console.log('-------------------------');
    console.log('/// Generated AstTree ///');
    console.log('-------------------------');
    console.log(parser.getAst(parser.parse()).print());
}

if (process.argv.length === 2) {
    console.error('Error: ' + new NoSourceFileError().message);
    return 0;
}

process.argv.forEach(function (val, index) {
    if (index <= 1) {
        return;
    }

    try {
        parseFile(val);
    } catch (e) {
        console.error(`Error: ${e.message}`);
    }
});

console.log("\nProgram finished");
