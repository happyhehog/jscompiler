const ECMAScriptVisitor = require('../../lib/ECMAScriptVisitor').ECMAScriptVisitor;
const ECMAScriptParser = require('../../lib/ECMAScriptParser').ECMAScriptParser;
const {
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
    ForStatementNode,
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
                if ('ElisionContext' === item.constructor.name) {
                    item.children.forEach((i) => {
                        if ('TerminalNodeImpl' === i.constructor.name) {
                            node.elements.push(new UndefinedLiteralNode(i.parentCtx));
                        }
                    });
                    return;
                }

                const element = this.visit(item);
                if (typeof element !== 'undefined') {
                    node.elements.push(element);
                }
            });
        }

        return node;
    }

    visitObjectLiteralExpression(ctx) {
        return this.visit(ctx.objectLiteral());
    }


    // ==========================
    // Control flow loops
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

    visitForStatement(ctx) {
        return new ForStatementNode(ctx,
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
                node.parameters.push(new IdentifierNode(parameter, parameter.symbol.text));
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
                node.params.push(new IdentifierNode(param, param.symbol.text));
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
        const operator = typeof ctx.children !== 'undefined' ? ctx.children[1].getText() : '';
        return new BinaryExpressionNode(ctx, operator,
            this.visit(ctx.singleExpression(0)),
            this.visit(ctx.singleExpression(1))
        );
    }

    visitAssignmentExpression(ctx) {
        return new AssignmentExpressionNode(ctx, '=',
            this.visit(ctx.children[0]),
            this.visit(ctx.children[2])
        );
    }

    visitEqualityExpression(ctx) {
        const operator = typeof ctx.children !== 'undefined' ? ctx.children[1].getText() : '';
        return new BinaryExpressionNode(ctx, operator,
            this.visit(ctx.singleExpression(0)),
            this.visit(ctx.singleExpression(1)));
    }

    visitMultiplicativeExpression(ctx) {
        const operator = typeof ctx.children !== 'undefined' ? ctx.children[1].getText() : '';
        return new BinaryExpressionNode(ctx, operator,
            this.visit(ctx.singleExpression(0)),
            this.visit(ctx.singleExpression(1))
        );
    }

    visitAdditiveExpression(ctx) {
        const operator = typeof ctx.children !== 'undefined' ? ctx.children[1].getText() : '';
        return new BinaryExpressionNode(ctx, operator,
            this.visit(ctx.singleExpression(0)),
            this.visit(ctx.singleExpression(1))
        );
    }

    visitBitShiftExpression(ctx) {
        const operator = typeof ctx.children !== 'undefined' ? ctx.children[1].getText() : '';
        return new BinaryExpressionNode(ctx, operator,
            this.visit(ctx.singleExpression(0)),
            this.visit(ctx.singleExpression(1))
        );
    }

    visitLogicalAndExpression(ctx) {
        return new LogicalExpressionNode(ctx, '&&',
            this.visit(ctx.singleExpression(0)),
            this.visit(ctx.singleExpression(1))
        );
    }

    visitLogicalOrExpression(ctx) {
        return new LogicalExpressionNode(ctx, '||',
            this.visit(ctx.singleExpression(0)),
            this.visit(ctx.singleExpression(1))
        );
    }

    visitBitXOrExpression(ctx) {
        return new BinaryExpressionNode(ctx, '^',
            this.visit(ctx.singleExpression(0)),
            this.visit(ctx.singleExpression(1))
        );
    }


    // ==========================
    // Unary Expressions
    // ==========================

    visitUnaryMinusExpression(ctx) {
        return new UnaryExpressionNode(ctx, '-', this.visit(ctx.singleExpression()));
    }

    visitUnaryPlusExpression(ctx) {
        return new UnaryExpressionNode(ctx, '+', this.visit(ctx.singleExpression()));
    }

    visitDeleteExpression(ctx) {
        return new UnaryExpressionNode(ctx, 'delete', this.visit(ctx.singleExpression()));
    }

    visitBitNotExpression(ctx) {
        return new UnaryExpressionNode(ctx, '~', this.visit(ctx.singleExpression()));
    }

    visitNotExpression(ctx) {
        return new UnaryExpressionNode(ctx, '!' , this.visit(ctx.singleExpression()));
    }

    visitBitAndExpression(ctx) {
        return new BinaryExpressionNode(ctx, '&',
            this.visit(ctx.singleExpression(0)),
            this.visit(ctx.singleExpression(1))
        );
    }

    visitBitOrExpression(ctx) {
        return new BinaryExpressionNode(ctx, '|',
            this.visit(ctx.singleExpression(0)),
            this.visit(ctx.singleExpression(1))
        );
    }


    // ==========================
    // Objects
    // ==========================

    visitObjectLiteral(ctx) {
        const node = new ObjectExpressionNode(ctx);
        if (ctx.propertyNameAndValueList()) {
            ctx.propertyNameAndValueList().propertyAssignment().forEach((prop) => {
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


    // ==========================
    // Increment and decrement
    // ==========================

    visitPreIncrementExpression(ctx) {
        return new IncrementExpression(ctx, 'pre', this.visit(ctx.getChild(1)));
    };

    visitPostIncrementExpression(ctx) {
        return new IncrementExpression(ctx, 'post', this.visit(ctx.getChild(0)));
    }

    visitPreDecreaseExpression(ctx) {
        return new DecrementExpression(ctx, 'pre', this.visit(ctx.getChild(1)));
    };

    visitPostDecreaseExpression(ctx) {
        return new DecrementExpression(ctx, 'post', this.visit(ctx.getChild(0)));
    }


    // ==========================
    // Other
    // ==========================

    visitStatement(ctx) {
        return this.visit(ctx.children[0]);
    };

    visitSourceElement(ctx) {
        return this.visit(ctx.children[0]);
    };
}

module.exports.AstVisitor = AstVisitor;