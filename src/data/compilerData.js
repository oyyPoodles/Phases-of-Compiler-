export const compilerPhases = [
  {
    id: "preprocessing",
    title: "Preprocessing",
    description: "Before compilation starts, the preprocessor handles directives and prepares the source code.",
    details: [
      "Checks for required headers like <stdio.h>.",
      "Extracts statements from the main() function.",
      "Removes comments and boilerplate code (return 0).",
      "Validates language mode (C vs C++ syntax check)."
    ],
    visualData: {
      source: `#include <stdio.h>\n\nint main() {\n  int base = 5 + 3 * 2;\n  int total = base + 10;\n  total = total - 4;\n  printf(total);\n  printf(base + total);\n  return 0;\n}`,
      output: `int base = 5 + 3 * 2;\nint total = base + 10;\ntotal = total - 4;\nprintf(total);\nprintf(base + total);`
    },
    implementationCode: `// Preprocessing Logic
const preprocess = (source) => {
  const lines = source.split('\\n');
  return lines.filter(line => {
    return !line.startsWith('#') && 
           !line.includes('int main') && 
           !line.includes('return 0') &&
           line.trim() !== '}' && 
           line.trim() !== '{';
  }).join('\\n');
};`
  },
  {
    id: "lexical",
    title: "Phase 1: Lexical Analysis",
    description: "The Scanner reads the stream of characters and groups them into meaningful sequences called Tokens.",
    details: [
      "Converts raw text into (Type, Value) pairs.",
      "Identifies keywords (int, printf), identifiers (base, total), and literals (5, 3).",
      "Handles whitespace and multi-character symbols like '+=' or '=='."
    ],
    visualData: {
      tokens: [
        { type: "keyword", value: "int" },
        { type: "identifier", value: "base" },
        { type: "symbol", value: "=" },
        { type: "number", value: "5" },
        { type: "symbol", value: "+" },
        { type: "number", value: "3" },
        { type: "symbol", value: "*" },
        { type: "number", value: "2" },
        { type: "symbol", value: ";" },
        { type: "keyword", value: "int" },
        { type: "identifier", value: "total" },
        { type: "symbol", value: "=" },
        { type: "identifier", value: "base" },
        { type: "symbol", value: "+" },
        { type: "number", value: "10" },
        { type: "symbol", value: ";" },
        { type: "identifier", value: "total" },
        { type: "symbol", value: "=" },
        { type: "identifier", value: "total" },
        { type: "symbol", value: "-" },
        { type: "number", value: "4" },
        { type: "symbol", value: ";" },
        { type: "keyword", value: "printf" },
        { type: "symbol", value: "(" },
        { type: "identifier", value: "total" },
        { type: "symbol", value: ")" },
        { type: "symbol", value: ";" }
      ]
    },
    implementationCode: `/* Lexical Specification (scanner.l) */
%{
#include "y.tab.h"
%}

%%
"int"       { return KEYWORD_INT; }
"printf"    { return KEYWORD_PRINTF; }
"return"    { return KEYWORD_RETURN; }
[0-9]+      { yylval = atoi(yytext); return NUMBER; }
[a-zA-Z_][a-zA-Z0-9_]* { yylval = strdup(yytext); return IDENTIFIER; }
"="         { return SYMBOL_ASSIGN; }
"+"         { return SYMBOL_PLUS; }
"*"         { return SYMBOL_MUL; }
";"         { return SYMBOL_SEMICOLON; }
[ \\t\\n]    ; /* skip whitespace */
.           { return yytext[0]; }
%%`
  },
  {
    id: "syntax",
    title: "Phase 2: Syntax Analysis",
    description: "The Parser checks if the tokens follow the grammar rules and builds an Abstract Syntax Tree (AST).",
    details: [
      "Enforces operator precedence (e.g., * before +).",
      "Groups tokens into logical expressions and statements.",
      "Builds a hierarchical tree representing the program structure."
    ],
    visualData: {
      ast: {
        type: "Program",
        body: [
          {
            type: "VariableDeclaration",
            id: "base",
            init: {
              type: "BinaryExpression",
              op: "+",
              left: { type: "Literal", value: 5 },
              right: {
                type: "BinaryExpression",
                op: "*",
                left: { type: "Literal", value: 3 },
                right: { type: "Literal", value: 2 }
              }
            }
          }
          // ... rest simplified for UI
        ]
      }
    },
    implementationCode: `/* Syntax Specification (parser.y) */
%token KEYWORD_INT KEYWORD_PRINTF NUMBER IDENTIFIER
%left SYMBOL_PLUS SYMBOL_MINUS
%left SYMBOL_MUL SYMBOL_DIV

%%
program:
    statements
    ;

statements:
    statement statements
    | /* empty */
    ;

statement:
    KEYWORD_INT IDENTIFIER SYMBOL_ASSIGN expression SYMBOL_SEMICOLON
    | KEYWORD_PRINTF '(' expression ')' SYMBOL_SEMICOLON
    ;

expression:
    NUMBER
    | IDENTIFIER
    | expression SYMBOL_PLUS expression
    | expression SYMBOL_MUL expression
    ;
%%`
  },
  {
    id: "semantic",
    title: "Phase 3: Semantic Analysis",
    description: "The Semantic Analyzer ensures the program makes sense (type checking, scope validation).",
    details: [
      "Creates the Symbol Table to track variables and their types.",
      "Verifies that variables are declared before being used.",
      "Checks for type compatibility in assignments and expressions."
    ],
    visualData: {
      symbolTable: [
        { name: "base", type: "int", scope: "global/main", initialized: true },
        { name: "total", type: "int", scope: "global/main", initialized: true }
      ]
    },
    implementationCode: `/* Semantic Checker (Analyzer.cpp) */
void SemanticAnalyzer::check(ASTNode* node) {
  if (node->type == NODE_VAR_DECL) {
    if (symbolTable.exists(node->name)) {
      error("Redeclaration of " + node->name);
    }
    symbolTable.insert(node->name, node->varType);
  } else if (node->type == NODE_IDENTIFIER) {
    if (!symbolTable.exists(node->name)) {
      error("Undefined variable: " + node->name);
    }
  }
}`
  },
  {
    id: "ir",
    title: "Phase 4: Intermediate Code",
    description: "The AST is flattened into machine-independent Intermediate Representation (IR), often Three-Address Code.",
    details: [
      "Breaks down complex expressions into simple 3-operand steps.",
      "Introduces temporary variables (t1, t2) to hold intermediate results.",
      "Makes the code ready for generic optimizations."
    ],
    visualData: {
      ir: [
        "t1 = 3 * 2",
        "t2 = 5 + t1",
        "base = t2",
        "t3 = base + 10",
        "total = t3",
        "t4 = total - 4",
        "total = t4",
        "print total",
        "t5 = base + total",
        "print t5"
      ]
    },
    implementationCode: `// IR Generation (TAC)
const generateIR = (node) => {
  if (node.type === 'BinaryOp') {
    const t = getTemp();
    emit(\`\${t} = \${node.left} \${node.op} \${node.right}\`);
    return t;
  }
  return node.value;
};`
  },
  {
    id: "optimization",
    title: "Phase 5: Code Optimization",
    description: "The Optimizer improves the IR to make it faster or smaller without changing the output.",
    details: [
      "Constant Folding: Performs math at compile time (5 + 6 = 11).",
      "Constant Propagation: Replaces variables with their constant values.",
      "Dead Code Removal: Eliminates steps that don't affect the result."
    ],
    visualData: {
      before: [
        "t1 = 3 * 2",
        "t2 = 5 + t1",
        "base = t2",
        "t3 = base + 10",
        "total = t3"
      ],
      after: [
        "base = 11 // (5 + 6)",
        "total = 21 // (11 + 10)",
        "total = 17 // (21 - 4)",
        "print 17",
        "print 28 // (11 + 17)"
      ]
    },
    implementationCode: `/* Target Code Gen (Emitter.cpp) */
void CodeEmitter::emit(Instruction instr) {
  switch(instr.type) {
    case OP_PUSH:
      buffer.write("PUSH %d", instr.value);
      break;
    case OP_STORE:
      buffer.write("STORE [ebp-%d]", instr.offset);
      break;
    case OP_ADD:
      buffer.write("ADD");
      break;
    case OP_HALT:
      buffer.write("HALT");
      break;
  }
}`
  },
  {
    id: "target",
    title: "Phase 6: Target Code",
    description: "The final phase translates IR into low-level machine instructions (Stack VM Opcodes).",
    details: [
      "Maps variables to memory addresses or stack offsets.",
      "Emits executable instructions like PUSH, ADD, STORE.",
      "Final preparation for the target environment (VM)."
    ],
    visualData: {
      asm: [
        "PUSH 5",
        "PUSH 3",
        "PUSH 2",
        "MUL",
        "ADD",
        "STORE 0 // base",
        "LOAD 0",
        "PUSH 10",
        "ADD",
        "STORE 1 // total",
        "LOAD 1",
        "PUSH 4",
        "SUB",
        "STORE 1",
        "LOAD 1",
        "PRINT",
        "LOAD 0",
        "LOAD 1",
        "ADD",
        "PRINT",
        "HALT"
      ]
    }
  }
];
