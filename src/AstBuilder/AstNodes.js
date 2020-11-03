class BaseAstNode {
    constructor(ctx) {
        this.ctx = ctx;
        this.location = {
            startLine: ctx.start.line,
            startColumn: ctx.start.column,
            stopLine: ctx.stop.line,
            stopColumn: ctx.stop.column
        };
    }

    print(deepLevel = 0, suffix = '') {
        return ' '.repeat(deepLevel * 4) + `${this.constructor.name} (${this.location.startLine}:${this.location.startColumn}, ${this.location.stopLine}:${this.location.stopColumn})` + suffix + '\n';
    }
}


// ==========================
// Base nodes
// ==========================

class ExpressionNode extends BaseAstNode {
}

class StatementNode extends BaseAstNode {
}

class DeclarationNode extends BaseAstNode {
}

class ProgramNode extends BaseAstNode {
    constructor(ctx) {
        super(ctx);
        this.body = [];
    }

    print(deepLevel = 0, suffix = '') {
        let resultStr = super.print(deepLevel);
        this.body.forEach((item) => {
            resultStr += item.print(deepLevel + 1);
        });
        return resultStr;
    }
}


// ==========================
// General nodes
// ==========================

class LiteralNode extends ExpressionNode {
    constructor(ctx, value) {
        super(ctx);
        this.value = value;
    }

    print(deepLevel = 0, suffix = '') {
        return super.print(deepLevel, ` : { value: ${this.value} }`);
    }
}

class IdentifierNode extends ExpressionNode {
    constructor(ctx, name) {
        super(ctx);
        this.name = name;
    }

    print(deepLevel = 0, suffix = '') {
        return super.print(deepLevel, ` : { name: ${this.name} }`);
    }
}

class BlockStatementNode extends StatementNode {
    constructor(ctx) {
        super(ctx);
        this.body = [];
    }

    print(deepLevel = 0, suffix = '') {
        let resultStr = super.print(deepLevel);
        this.body.forEach((item) => {
            resultStr += item.print(deepLevel + 1);
        });
        return resultStr;
    }
}

class EmptyStatementNode extends StatementNode {
    print(deepLevel = 0, suffix = '') {
        return '';
    }
}

class SequenceExpressionNode extends ExpressionNode {
    constructor(ctx) {
        super(ctx);
        this.expressions = [];
    }

    print(deepLevel = 0, suffix = '') {
        let resultStr = '';
        this.expressions.forEach((item) => {
            resultStr += item.print(deepLevel);
        });
        return resultStr;
    }
}

class UndefinedLiteralNode extends LiteralNode {
    constructor(ctx) {
        super(ctx);
        this.value = 'undefined';
    }
}


// ==========================
// Functions
// ==========================

class FunctionBodyNode extends BlockStatementNode {
    print(deepLevel = 0, suffix = '') {
        let resultStr = '';

        if (this.body.length) {
            this.body.forEach((item) => {
                resultStr += item.print(deepLevel);
            });
        }

        return resultStr;
    }
}

/**
 * function functionId(params);
 */
class FunctionDeclarationNode extends DeclarationNode {
    constructor(ctx, body, id) {
        super(ctx);
        this.body = body;
        this.id = id;
        this.params = [];
    }

    print(deepLevel = 0, suffix = '') {
        let resultStr = super.print(deepLevel);

        if (this.id !== null) {
            resultStr += ' '.repeat(deepLevel * 4) + '--> name:\n' + this.id.print(deepLevel + 1);
        }

        if (this.params.length) {
            resultStr += ' '.repeat(deepLevel * 4) + '--> parameters:\n';
            this.params.forEach((item) => {
                resultStr += item.print(deepLevel + 1);
            });
        }

        resultStr += ' '.repeat(deepLevel * 4) + `--> body:${!this.body.body.length ? ' empty\n' : '\n'}` + this.body.print(deepLevel + 1);
        return resultStr;
    }
}

/**
 * var f = function(params) { body };
 */
class FunctionExpressionNode extends ExpressionNode {
    constructor(ctx, body) {
        super(ctx);
        this.body = body;
        this.id = null;
        this.params = [];
    }

    print(deepLevel = 0, suffix = '') {
        let resultStr = super.print(deepLevel);

        if (this.id !== null) {
            resultStr += ' '.repeat(deepLevel * 4) + '--> name:\n' + this.id.print(deepLevel + 1);
        }

        if (this.params.length) {
            resultStr += ' '.repeat(deepLevel * 4) + '--> parameters:\n';
            this.params.forEach((item) => {
                resultStr += item.print(deepLevel + 1);
            });
        }

        resultStr += ' '.repeat(deepLevel * 4) + `--> body:${!this.body.body.length ? ' empty\n' : '\n'}` + this.body.print(deepLevel + 1);
        return resultStr;
    }
}

class CallExpressionNode extends ExpressionNode {
    constructor(ctx, callExpr) {
        super(ctx);
        this.callExpr = callExpr;
        this.arguments = [];
    }

    print(deepLevel = 0, suffix = '') {
        let resultStr = super.print(deepLevel);

        resultStr += ' '.repeat(deepLevel * 4) + '--> callable:\n' + this.callExpr.print(deepLevel + 1);

        if (this.arguments.length) {
            resultStr += ' '.repeat(deepLevel * 4) + '--> arguments:\n';
            this.arguments.forEach((item) => {
                resultStr += item.print(deepLevel + 1);
            });
        }

        return resultStr;
    }
}


// ==========================
// Control flow loops
// ==========================

class BreakStatementNode extends StatementNode {
}

class ContinueStatementNode extends StatementNode {
}

class IfStatementNode extends StatementNode {
    constructor(ctx, testExpr, consequent) {
        super(ctx);
        this.testExpr = testExpr;
        this.consequent = consequent;
        this.alternate = null;
    }

    print(deepLevel = 0, suffix = '') {
        let resultStr = super.print(deepLevel);
        resultStr += ' '.repeat(deepLevel * 4) + '--> test expression:\n' + this.testExpr.print(deepLevel + 1);
        resultStr += ' '.repeat(deepLevel * 4) + '--> consequent:\n' + this.consequent.print(deepLevel + 1);
        if (this.alternate) {
            resultStr += ' '.repeat(deepLevel * 4) + '--> alternate:\n' + this.alternate.print(deepLevel + 1);
        }
        return resultStr;
    }
}

class BaseLoopStatementNode extends StatementNode {
    constructor(ctx, expr, body, varExpr) {
        super(ctx);
        this.expr = expr;
        this.body = body;
        this.varExpr = varExpr;
    }

    print(deepLevel = 0, suffix = '') {
        let resultStr = super.print(deepLevel);
        if (Array.isArray(this.expr)) {
            resultStr += ' '.repeat(deepLevel * 4) + '--> test expressions:\n';

            if (typeof this.varExpr !== 'undefined') {
                resultStr += this.varExpr.print(deepLevel + 1);
            }

            this.expr.forEach((item) => {
                resultStr += item.print(deepLevel + 1);
            });
        } else {
            resultStr += ' '.repeat(deepLevel * 4) + '--> test expression:\n' + this.expr.print(deepLevel + 1);
        }

        resultStr += ' '.repeat(deepLevel * 4) + '--> loop body:\n' + this.body.print(deepLevel + 1);
        return resultStr;
    }
}

class WhileStatementNode extends BaseLoopStatementNode {
}

class DoWhileStatementNode extends WhileStatementNode {
    
}

class ForStatementNode extends BaseLoopStatementNode {
}

class ForVarStatementNode extends BaseLoopStatementNode {

}

class ReturnStatementNode extends StatementNode {
    constructor(ctx, value) {
        super(ctx);
        this.value = value;
    }

    print(deepLevel = 0, suffix = '') {
        let resultStr = super.print(deepLevel);
        resultStr += ' '.repeat(deepLevel * 4) + '--> value:\n' + this.value.print(deepLevel + 1);
        return resultStr;
    }
}

// ==========================
// Variables
// ==========================

class VariableDeclarationListNode extends StatementNode {
    constructor(ctx) {
        super(ctx);
        this.declarations = [];
    }

    print(deepLevel = 0, suffix = '') {
        let resultStr = super.print(deepLevel);

        if (this.declarations.length) {
            resultStr += ' '.repeat(deepLevel * 4) + '--> declarations:\n';

            this.declarations.forEach((decl) => {
                resultStr += decl.print(deepLevel + 1);
            });
        }
        return resultStr;
    }
}

class VariableDeclarationNode extends StatementNode {
    constructor(ctx, identifier) {
        super(ctx);
        this.identifier = identifier;
        this.initValue = null;
    }

    print(deepLevel = 0, suffix = '') {
        let resultStr = super.print(deepLevel);
        resultStr += ' '.repeat(deepLevel * 4) + '--> identifier:\n' + this.identifier.print(deepLevel + 1);
        if (this.initValue !== null) {
            resultStr += ' '.repeat(deepLevel * 4) + '--> initValue:\n' + this.initValue.print(deepLevel + 1);
        }
        return resultStr;
    }
}


// ==========================
// Expressions
// ==========================

class BinaryExpressionNode extends ExpressionNode {
    constructor(ctx, operator, leftOperand, rightOperand) {
        super(ctx);
        this.operator = operator;
        this.leftOperand = leftOperand;
        this.rightOperand = rightOperand;
    }

    print(deepLevel = 0, suffix = '') {
        let resultStr = super.print(deepLevel, ` { operator: ${this.operator} }`);
        resultStr += ' '.repeat(deepLevel * 4) + '--> left operand:\n' + this.leftOperand.print(deepLevel + 1);
        resultStr += ' '.repeat(deepLevel * 4) + '--> right operand:\n' + this.rightOperand.print(deepLevel + 1);
        return resultStr;
    }
}

class UnaryExpressionNode extends ExpressionNode {
    constructor(ctx, operator, operand) {
        super(ctx);
        this.operator = operator;
        this.operand = operand;
    }

    print(deepLevel = 0, suffix = '') {
        let resultStr = super.print(deepLevel, ` { operator: ${this.operator} }`);
        resultStr += ' '.repeat(deepLevel * 4) + '--> operand:\n' + this.operand.print(deepLevel + 1);
        return resultStr;
    }
}

class ExpressionStatementNode extends StatementNode {
    constructor(ctx, statement) {
        super(ctx);
        this.statement = statement;
    }

    print(deepLevel = 0, suffix = '') {
        return this.statement.print(deepLevel, suffix);
    }
}

class AssignmentExpressionNode extends BinaryExpressionNode {
}

class LogicalExpressionNode extends BinaryExpressionNode {
}

class ArrayExpressionNode extends ExpressionNode {
    constructor(ctx) {
        super(ctx);
        this.elements = [];
    }

    print(deepLevel = 0, suffix = '') {
        let resultStr = super.print(deepLevel, suffix);

        if (this.elements.length) {
            resultStr += ' '.repeat(deepLevel * 4) + '--> elements:\n';
            this.elements.forEach((element) => {
                resultStr += element.print(deepLevel + 1);
            });
        } else {
            resultStr += ' '.repeat(deepLevel * 4) + '--> elements: empty\n';
        }

        return resultStr;
    }
}


// ==========================
// Objects
// ==========================

class ObjectExpressionNode extends ExpressionNode {
    constructor(ctx) {
        super(ctx);
        this.props = [];
    }

    print(deepLevel = 0, suffix = '') {
        let resultStr = super.print(deepLevel);

        if (this.props.length) {
            resultStr += ' '.repeat(deepLevel * 4) + '--> properties:\n';
            this.props.forEach((prop) => {
                resultStr += prop.print(deepLevel + 1);
            });
        }

        return resultStr;
    }
}

class PropertyNode extends BaseAstNode {
    constructor(ctx, key, value) {
        super(ctx);
        this.key = key;
        this.value = value;
    }

    print(deepLevel = 0, suffix = '') {
        let resultStr = super.print(deepLevel);
        resultStr += ' '.repeat(deepLevel * 4) + '--> key:\n' + this.key.print(deepLevel + 1);
        resultStr += ' '.repeat(deepLevel * 4) + '--> value:\n' + this.value.print(deepLevel + 1);
        return resultStr;
    }
}

class MemberExpressionNode extends ExpressionNode {
    constructor(ctx, object, property, computed) {
        super(ctx);
        this.object = object;
        this.property = property;
        this.computed = computed;
    }

    print(deepLevel = 0, suffix = '') {
        let resultStr = super.print(deepLevel, ` { computed: ${this.computed} }`);
        resultStr += ' '.repeat(deepLevel * 4) + '--> object:\n' + this.object.print(deepLevel + 1);
        resultStr += ' '.repeat(deepLevel * 4) + '--> property:\n' + this.property.print(deepLevel + 1);
        return resultStr;
    }
}


// ==========================
// Increment and decrement
// ==========================

class IncOrDecExpression extends ExpressionNode {
    constructor(ctx, type, identifier) {
        super(ctx);
        this.type = type;
        this.identifier = identifier;
    }

    print(deepLevel = 0, suffix = '') {
        let resultStr = super.print(deepLevel, ` { type: ${this.type} }`);
        resultStr += ' '.repeat(deepLevel * 4) + '--> identifier:\n' + this.identifier.print(deepLevel + 1);
        return resultStr;
    }
}

class IncrementExpression extends IncOrDecExpression {
}

class DecrementExpression extends IncOrDecExpression {
}


module.exports = {
    // Base nodes
    ProgramNode,

    // General nodes
    LiteralNode,
    IdentifierNode,
    BlockStatementNode,
    EmptyStatementNode,
    SequenceExpressionNode,
    UndefinedLiteralNode,

    // Functions
    FunctionBodyNode,
    FunctionDeclarationNode,
    FunctionExpressionNode,
    CallExpressionNode,

    // Control flow loops
    BreakStatementNode,
    ContinueStatementNode,
    IfStatementNode,
    WhileStatementNode,
    DoWhileStatementNode,
    ForStatementNode,
    ForVarStatementNode,
    ReturnStatementNode,

    // Variables
    VariableDeclarationListNode,
    VariableDeclarationNode,

    // Expressions
    BinaryExpressionNode,
    UnaryExpressionNode,
    ExpressionStatementNode,
    AssignmentExpressionNode,
    LogicalExpressionNode,
    ArrayExpressionNode,

    // Objects
    ObjectExpressionNode,
    PropertyNode,
    MemberExpressionNode,

    // Increment and decrement
    IncrementExpression,
    DecrementExpression,
};