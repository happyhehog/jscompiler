# JSCompiler

Javascript compiler in javascript for FEFU course.

## Install

Install ```NodeJS``` and ```npm```, then run in project directory

```
npm install -g yarn
yarn install
```

## Usage

Parse source files:
```
yarn start filePath1 filePath2 ...
```

Run tests:
```
yarn test
```

## Not implemented
```with, switch, try/catch/finally, throw, debugger, interface, implements, package, yield```

Keywords ```interface``` and ```implement``` have no real use case in Javascript world, yet.

Statement ```with``` is deprecated in ES6 and cannot be used with strict mode;
 
## External sources
1. [EcmaScript Antlr4 grammar](https://github.com/antlr/grammars-v4/tree/master/javascript/ecmascript)

## Materials
1. [ES Antlr4 Nodes Description](https://github.com/estree/estree/blob/master/es5.md)
2. [Writing compiler with Javascript and Antlr4](https://habr.com/ru/post/351906/)