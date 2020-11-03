const antlr4 = require('antlr4');
const JavaScriptLexer = require('../lib/ECMAScriptLexer');
const JavaScriptParser = require('../lib/ECMAScriptParser');
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
        const lexer = new JavaScriptLexer.ECMAScriptLexer(chars);
        lexer.strictMode = false;

        const tokens = new antlr4.CommonTokenStream(lexer);
        const parser = new JavaScriptParser.ECMAScriptParser(tokens);
        const tree = parser.program();
        this.stringTree = tree.toStringTree(parser.ruleNames);
        return tree;
    }

    getAst(tree) {
        return new AstVisitor().visit(tree);
    }

    getStringTree(tree) {
        return this.stringTree;
    }
}

module.exports.Parser = Parser;