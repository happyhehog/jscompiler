const ECMAScriptVisitor = require('../../lib/ECMAScriptVisitor').ECMAScriptVisitor;
const {BinaryOperator, UnaryOperator, OtherOperators} = require('./Operators');
const {
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
} = require('./AstNodes');


class AstVisitor extends ECMAScriptVisitor {
    visitProgram(ctx) {
        const node = new ProgramNode(ctx);
        if (ctx.sourceElements()) {
            ctx.sourceElements().children.forEach((child) => {
                node.body.push(this.visit(child));
            });
        }

        return node;
    }


    // ==========================
    // General nodes
    // ==========================

    visitBlock(ctx) {
        const node = new BlockStatementNode(ctx);
        if (ctx.statementList()) {
            ctx.statementList().children.forEach((child) => {
                node.body.push(this.visit(child));
            });
        }
        return node;
    }

    visitReservedWord(ctx) {
        if (ctx.keyword()) {
            return this.visit(ctx.keyword());
        }

        if (ctx.futureReservedWord()) {
            return this.visit(ctx.futureReservedWord());
        }

        if (ctx.NullLiteral()) {
            return new LiteralNode(ctx, null);
        }

        return new LiteralNode(ctx, ctx.BooleanLiteral());
    }

    visitIdentifierName(ctx) {
        if (ctx.reservedWord()) {
            return ctx.visit(ctx.reservedWord());
        }

        return new IdentifierNode(ctx, ctx.Identifier().symbol.text);
    }

    visitIdentifierExpression(ctx) {
        return new IdentifierNode(ctx, ctx.Identifier().symbol.text);
    }

    visitEmptyStatement(ctx) {
        return new EmptyStatementNode(ctx);
    }

    visitKeyword(ctx) {
        return new IdentifierNode(ctx, ctx.getChild(0).symbol.text);
    }

    visitExpressionStatement(ctx) {
        return new ExpressionStatementNode(ctx, this.visit(ctx.expressionSequence()));
    }

    visitExpressionSequence(ctx) {
        const node = new SequenceExpressionNode(ctx);

        if (ctx.singleExpression()) {
            ctx.singleExpression().forEach((expr) => {
                node.expressions.push(this.visit(expr));
            });
        }

        return node;
    }

    visitParenthesizedExpression(ctx) {
        return this.visit(ctx.expressionSequence());
    }


    // ==========================
    // Literal nodes
    // ==========================

    visitLiteral(ctx) {
        if (ctx.NullLiteral()) {
            return new LiteralNode(ctx, null);
        }

        if (ctx.StringLiteral()) {
            return new LiteralNode(ctx, ctx.StringLiteral().symbol.text);
        }

        if (ctx.BooleanLiteral()) {
            return new LiteralNode(ctx, ctx.BooleanLiteral());
        }

        return this.visit(ctx.numericLiteral());
    }

    visitNumericLiteral(ctx) {
        return new LiteralNode(ctx, ctx.DecimalLiteral().symbol.text);
    }

    visitLiteralExpression(ctx) {
        return this.visit(ctx.literal());
    }

    visitArrayLiteralExpression(ctx) {
        return this.visit(ctx.arrayLiteral());
    }

    visitArrayLiteral(ctx) {
        const node = new ArrayExpressionNode(ctx);
        if (ctx.elementList()) {
            ctx.elementList().children.forEach((item) => {
                node.elements.push(this.visit(item));
            });
        }

        return node;
    }

    visitObjectLiteralExpression(ctx) {
        return this.visit(ctx.objectLiteral());
    }


    // ==========================
    // Control flow statements
    // ==========================

    visitBreakStatement(ctx) {
        return new BreakStatementNode(ctx);
    }

    visitContinueStatement(ctx) {
        return new ContinueStatementNode(ctx);
    }

    visitIfStatement(ctx) {
        const node = new IfStatementNode(ctx,
            this.visit(ctx.expressionSequence()),
            this.visit(ctx.statement(0))
        );

        if (ctx.Else()) {
            node.alternate = this.visit(ctx.statement(1));
        }

        return node;
    }

    visitWhileStatement(ctx) {
        return new WhileStatementNode(ctx,
            this.visit(ctx.expressionSequence()),
            this.visit(ctx.statement())
        );
    }

    visitReturnStatement(ctx) {
        const node = new ReturnStatementNode(ctx);
        if (ctx.expressionSequence()) {
            node.value = this.visit(ctx.expressionSequence());
        }
        return node;
    }


    // ==========================
    // Variables
    // ==========================

    visitVariableStatement(ctx) {
        return this.visit(ctx.variableDeclarationList());
    }

    visitVariableDeclarationList(ctx) {
        const node = new VariableDeclarationListNode(ctx);
        if (ctx.variableDeclaration()) {
            ctx.variableDeclaration().forEach((declaration) => {
                node.declarations.push(this.visit(declaration));
            });
        }
        return node;
    }

    visitVariableDeclaration(ctx) {
        const node = new VariableDeclarationNode(ctx, new IdentifierNode(ctx, ctx.Identifier().symbol.text));
        if (ctx.initialiser()) {
            node.initValue = this.visit(ctx.initialiser().singleExpression());
        }
        return node;
    }


    // ==========================
    // Functions
    // ==========================

    visitFunctionDeclaration(ctx) {
        const node = new FunctionDeclarationNode(ctx,
            this.visit(ctx.functionBody()),
            new IdentifierNode(ctx, ctx.Identifier().symbol.text)
        );

        if (ctx.formalParameterList()) {
            ctx.formalParameterList().Identifier().forEach((parameter) => {
                node.parameters.push(new IdentifierNode(ctx, parameter.symbol.text));
            });
        }

        return node;
    }

    visitFunctionBody(ctx) {
        const node = new FunctionBodyNode(ctx);
        if (ctx.sourceElements()) {
            ctx.sourceElements().children.forEach((child) => {
                node.body.push(this.visit(child));
            });
        }
        return node;
    }

    visitFunctionExpression(ctx) {
        const node = new FunctionExpressionNode(ctx, this.visit(ctx.functionBody()));
        if (ctx.Identifier()) {
            node.id = new IdentifierNode(ctx, ctx.Identifier().symbol.text);
        }

        if (ctx.formalParameterList()) {
            ctx.formalParameterList().Identifier().forEach((param) => {
                node.params.push(new IdentifierNode(ctx, param.symbol.text));
            });
        }

        return node;
    }

    visitArgumentsExpression(ctx) {
        const node = new CallExpressionNode(ctx, this.visit(ctx.singleExpression()));
        if (ctx.arguments().argumentList()) {
            ctx.arguments().argumentList().singleExpression().forEach((arg) => {
                node.arguments.push(this.visit(arg));
            });
        }

        return node;
    }


    // ==========================
    // Binary Expressions
    // ==========================

    visitRelationalExpression(ctx) {
        const RelationOperatorMapper = {
            '<': BinaryOperator.LESS,
            '<=': BinaryOperator.LESS_OR_EQUAL,
            '>': BinaryOperator.GREATER,
            '>=': BinaryOperator.GREATER_OR_EQUAL,
        };

        const operator = RelationOperatorMapper[ctx.children[1].getText()] ?? null;
        return new BinaryExpressionNode(ctx, operator,
            this.visit(ctx.singleExpression(0)),
            this.visit(ctx.singleExpression(1))
        );
    }

    visitAssignmentExpression(ctx) {
        return new AssignmentExpressionNode(ctx, OtherOperators.ASSIGN,
            this.visit(ctx.singleExpression(0)),
            this.visit(ctx.singleExpression(1))
        );
    }

    visitEqualityExpression(ctx) {
        const OP_MAPPER = {
            '===': BinaryOperator.EQUAL,
            '!==': BinaryOperator.UNEQUAL,
        };

        const operator = OP_MAPPER[ctx.children[1].getText()] ?? null;
        return new BinaryExpressionNode(ctx, operator,
            this.visit(ctx.singleExpression(0)),
            this.visit(ctx.singleExpression(1)));
    }

    visitMultiplicativeExpression(ctx) {
        const OP_MAPPER = {
            '/': BinaryOperator.DIVISION,
            '*': BinaryOperator.MULTIPLICATION,
            '%': BinaryOperator.REMAINDER
        };

        const operator = OP_MAPPER[ctx.children[1].getText()] ?? null;

        return new BinaryExpressionNode(ctx, operator,
            this.visit(ctx.singleExpression(0)),
            this.visit(ctx.singleExpression(1))
        );
    }

    visitAdditiveExpression(ctx) {
        const OP_MAPPER = {
            '+': BinaryOperator.ADDITION,
            '-': BinaryOperator.SUBTRACTION
        };

        const operator = OP_MAPPER[ctx.children[1].getText()] ?? null;

        return new BinaryExpressionNode(ctx, operator,
            this.visit(ctx.singleExpression(0)),
            this.visit(ctx.singleExpression(1))
        );
    }

    visitBitShiftExpression(ctx) {
        const OP_MAPPER = {
            '<<': BinaryOperator.LEFT_SHIFT,
            '>>': BinaryOperator.RIGHT_SHIFT,
            '>>>': BinaryOperator.ARITHMETIC_RIGHT_SHIFT,
        };

        const operator = OP_MAPPER[ctx.children[1].getText()] ?? null;
        return new BinaryExpressionNode(ctx, operator,
            this.visit(ctx.singleExpression(0)),
            this.visit(ctx.singleExpression(1))
        );
    }

    visitLogicalAndExpression(ctx) {
        return new LogicalExpressionNode(ctx, OtherOperators.LOGICAL_AND,
            this.visit(ctx.singleExpression(0)),
            this.visit(ctx.singleExpression(1))
        );
    }

    visitLogicalOrExpression(ctx) {
        return new LogicalExpressionNode(ctx, OtherOperators.LOGICAL_OR,
            this.visit(ctx.singleExpression(0)),
            this.visit(ctx.singleExpression(1))
        );
    }

    visitBitXOrExpression(ctx) {
        return new BinaryExpressionNode(ctx, BinaryOperator.BIT_XOR,
            this.visit(ctx.singleExpression(0)),
            this.visit(ctx.singleExpression(1))
        );
    }


    // ==========================
    // Unary Expressions
    // ==========================

    visitUnaryMinusExpression(ctx) {
        return new UnaryExpressionNode(ctx, UnaryOperator.MINUS, this.visit(ctx.singleExpression()));
    }

    visitUnaryPlusExpression(ctx) {
        return new UnaryExpressionNode(ctx, UnaryOperator.PLUS, this.visit(ctx.singleExpression()));
    }

    visitDeleteExpression(ctx) {
        return new UnaryExpressionNode(ctx, UnaryOperator.DELETE, this.visit(ctx.singleExpression()));
    }

    visitBitNotExpression(ctx) {
        return new UnaryExpressionNode(ctx, UnaryOperator.BIT_NOT, this.visit(ctx.singleExpression()));
    }

    visitNotExpression(ctx) {
        return new UnaryExpressionNode(ctx, UnaryOperator.LOGIC_NOT , this.visit(ctx.singleExpression()));
    }

    visitBitAndExpression(ctx) {
        return new BinaryExpressionNode(ctx, BinaryOperator.BIT_AND,
            this.visit(ctx.singleExpression(0)),
            this.visit(ctx.singleExpression(1))
        );
    }

    visitBitOrExpression(ctx) {
        return new BinaryExpressionNode(ctx, BinaryOperator.BIT_OR,
            this.visit(ctx.singleExpression(0)),
            this.visit(ctx.singleExpression(1))
        );
    }


    // ==========================
    // Objects
    // ==========================

    visitObjectLiteral(ctx) {
        const node = new ObjectExpressionNode(ctx);
        if (node.propertyNameAndValueList()) {
            node.propertyNameAndValueList().propertyAssignment().forEach((prop) => {
                node.props.push(this.visit(prop));
            });
        }
        return node;
    }

    visitPropertyExpressionAssignment(ctx) {
        return new PropertyNode(ctx,
            this.visit(ctx.propertyName()),
            this.visit(ctx.singleExpression())
        );
    }

    visitPropertyName(ctx) {
        if (ctx.numericLiteral()) {
            return this.visit(ctx.numericLiteral());
        }

        if (ctx.identifierName()) {
            return this.visit(ctx.identifierName());
        }

        return new LiteralNode(ctx, ctx.StringLiteral().symbol.text);
    }

    visitMemberDotExpression(ctx) {
        return new MemberExpressionNode(ctx,
            this.visit(ctx.singleExpression()),
            this.visit(ctx.identifierName()),
            false
        );
    }

    visitMemberIndexExpression(ctx) {
        return new MemberExpressionNode(ctx,
            this.visit(ctx.singleExpression()),
            this.visit(ctx.expressionSequence()),
            true
        );
    }

}

module.exports.AstVisitor = AstVisitor;