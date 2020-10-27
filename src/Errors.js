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

module.exports = {
    NoSourceFileError: NoSourceFileError,
    FileNotExistsError: FileNotExistsError,
};