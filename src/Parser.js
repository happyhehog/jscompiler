const antlr4 = require('antlr4');
const ECMAScriptLexer = require('../lib/ECMAScriptLexer.js');
const ECMAScriptParser = require('../lib/ECMAScriptParser.js');
const {FileNotExistsError} = require("./Errors");
const fs = require('fs');
const AstVisitor = require('./AstBuilder/AstVisitor').AstVisitor;

class Parser {
    constructor(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new FileNotExistsError();
        }

        this.input = fs.readFileSync(filePath).toString("utf-8");
    }

    parse() {
        const chars = new antlr4.InputStream(this.input);
        const lexer = new ECMAScriptLexer.ECMAScriptLexer(chars);
        lexer.strictMode = false;

        const tokens = new antlr4.CommonTokenStream(lexer);
        const parser = new ECMAScriptParser.ECMAScriptParser(tokens);
        const tree = parser.program();
        const astTree = new AstVisitor().visit(tree);

        return tree.toStringTree(parser.ruleNames);
    }
}

module.exports.Parser = Parser;