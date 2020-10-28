const UnaryOperator = {
    MINUS: "-",
    PLUS: "+",
    LOGIC_NOT: "!",
    BIT_NOT: "~",
    DELETE: "delete"
};

const BinaryOperators = {
    EQUAL: "===",
    UNEQUAL: "!==",
    LESS: "<",
    LESS_OR_EQUAL: "<=",
    GREATER: ">",
    GREATER_OR_EQUAL: ">=",
    LEFT_SHIFT: "<<",
    RIGHT_SHIFT: ">>",
    ARITHMETIC_RIGHT_SHIFT: ">>>",
    ADDITION: "+",
    SUBTRACTION: "-",
    MULTIPLICATION: "*",
    DIVISION: "/",
    REMAINDER: "%",
    BIT_OR: "|",
    BIT_XOR: "^",
    BIT_AND: "&"
};

const OtherOperators = {
    ASSIGN: "=",
    LOGICAL_OR: "||",
    LOGICAL_AND: "&&"
};

module.exports = {
    UnaryOperator: UnaryOperator,
    BinaryOperator: BinaryOperators,
    OtherOperators: OtherOperators
};