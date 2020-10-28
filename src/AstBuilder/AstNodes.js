class BaseAstNode {
    constructor(ctx) {
        this.location = {
            startLine: ctx.start.line,
            startColumn: ctx.start.column,
            stopLine: ctx.stop.line,
            stopColumn: ctx.stop.column
        };
    }
}


// ==========================
// Base nodes
// ==========================

class ExpressionNode extends BaseAstNode {}

class StatementNode extends BaseAstNode {}

class DeclarationNode extends BaseAstNode {}

class ProgramNode extends BaseAstNode {
    constructor(ctx) {
        super(ctx);
        this.body = [];
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
}

class IdentifierNode extends ExpressionNode {
    constructor(ctx, name) {
        super(ctx);
        this.name = name;
    }
}

class BlockStatementNode extends StatementNode {
    constructor(ctx) {
        super(ctx);
        this.body = [];
    }
}

class EmptyStatementNode extends StatementNode {}

class SequenceExpressionNode extends ExpressionNode {
    constructor(ctx) {
        super(ctx);
        this.expressions = [];
    }
}


// ==========================
// Functions
// ==========================

class FunctionBodyNode extends BlockStatementNode {}

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
}

/**
 * let f = function(params) { body };
 */
class FunctionExpressionNode extends ExpressionNode {
    constructor(ctx, body) {
        super(ctx);
        this.body = body;
        this.id = null;
        this.params = [];
    }
}

class CallExpressionNode extends ExpressionNode {
    constructor(ctx, callExpr) {
        super(ctx);
        this.callExpr = callExpr;
        this.arguments = [];
    }
}


// ==========================
// Control flow statements
// ==========================

class BreakStatementNode extends StatementNode {}

class ContinueStatementNode extends StatementNode {}

class IfStatementNode extends StatementNode {
    constructor(ctx, testExpr, consequent) {
        super(ctx);
        this.testExpr = testExpr;
        this.consequent = consequent;
        this.alternate = null;
    }
}

class WhileStatementNode extends StatementNode {
    constructor(ctx, testExpr, body) {
        super(ctx);
        this.testExpr = testExpr;
        this.body = body;
    }
}

class ReturnStatementNode extends StatementNode {
    constructor(ctx, value) {
        super(ctx);
        this.value = value;
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
}

class VariableDeclarationNode extends StatementNode {
    constructor(ctx, identifier) {
        super(ctx);
        this.identifier = identifier;
        this.initValue = null;
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
}

class UnaryExpressionNode extends ExpressionNode {
    constructor(ctx, operator, operand) {
        super(ctx);
        this.operator = operator;
        this.operand = operand;
    }
}

class ExpressionStatementNode extends StatementNode {
    constructor(ctx, statement) {
        super(ctx);
        this.statement = statement;
    }
}

class AssignmentExpressionNode extends BinaryExpressionNode {
}

class LogicalExpressionNode extends BinaryExpressionNode {}

class ArrayExpressionNode extends ExpressionNode {
    constructor(ctx) {
        super(ctx);
        this.elements = [];
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
}

class PropertyNode extends BaseAstNode {
    constructor(ctx, key, value) {
        super(ctx);
        this.key = key;
        this.value = value;
    }
}

class MemberExpressionNode extends ExpressionNode {
    constructor(ctx, object, property, computed) {
        super(ctx);
        this.object = object;
        this.property = property;
        this.computed = computed;
    }
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

    // Functions
    FunctionBodyNode,
    FunctionDeclarationNode,
    FunctionExpressionNode,
    CallExpressionNode,

    // Control flow statements
    BreakStatementNode,
    ContinueStatementNode,
    IfStatementNode,
    WhileStatementNode,
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
};