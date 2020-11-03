class NoSourceFileError extends Error {
    constructor() {
        super("No source file selected for parsing");
    }
}

class FileNotExistsError extends Error {
    constructor() {
        super("File does not exists");
    }
}

class ParsingError extends Error {
    constructor() {
        super("Parser finished with error");
    }

}

module.exports = {
    NoSourceFileError: NoSourceFileError,
    FileNotExistsError: FileNotExistsError,
    ParsingError: ParsingError,
};