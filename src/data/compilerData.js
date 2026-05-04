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
      source: `#include <stdio.h>\n\nint main() {\n  int marks = 75;\n  if(marks >= 90)\n    printf("Grade A");\n  else if(marks >= 75)\n    printf("Grade B");\n  else if(marks >= 50)\n    printf("Grade C");\n  else\n    printf("Fail");\n  return 0;\n}`,
      output: `int marks = 75;\nif(marks >= 90)\n  printf("Grade A");\nelse if(marks >= 75)\n  printf("Grade B");\nelse if(marks >= 50)\n  printf("Grade C");\nelse\n  printf("Fail");`
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
      "Identifies keywords (if, else, int), identifiers (marks), and literals (75, 90).",
      "Handles relational operators like '>=' and string literals."
    ],
    visualData: {
      tokens: [
        { type: "keyword", value: "int" },
        { type: "identifier", value: "marks" },
        { type: "symbol", value: "=" },
        { type: "number", value: "75" },
        { type: "symbol", value: ";" },
        { type: "keyword", value: "if" },
        { type: "symbol", value: "(" },
        { type: "identifier", value: "marks" },
        { type: "operator", value: ">=" },
        { type: "number", value: "90" },
        { type: "symbol", value: ")" },
        { type: "keyword", value: "printf" },
        { type: "symbol", value: "(" },
        { type: "string", value: '"Grade A"' },
        { type: "symbol", value: ")" },
        { type: "symbol", value: ";" },
        { type: "keyword", value: "else" },
        { type: "keyword", value: "if" },
        { type: "symbol", value: "(" },
        { type: "identifier", value: "marks" },
        { type: "operator", value: ">=" },
        { type: "number", value: "75" },
        { type: "symbol", value: ")" },
        { type: "keyword", value: "printf" },
        { type: "symbol", value: "(" },
        { type: "string", value: '"Grade B"' },
        { type: "symbol", value: ")" },
        { type: "symbol", value: ";" },
        { type: "keyword", value: "else" },
        { type: "keyword", value: "if" },
        { type: "symbol", value: "(" },
        { type: "identifier", value: "marks" },
        { type: "operator", value: ">=" },
        { type: "number", value: "50" },
        { type: "symbol", value: ")" },
        { type: "keyword", value: "printf" },
        { type: "symbol", value: "(" },
        { type: "string", value: '"Grade C"' },
        { type: "symbol", value: ")" },
        { type: "symbol", value: ";" },
        { type: "keyword", value: "else" },
        { type: "keyword", value: "printf" },
        { type: "symbol", value: "(" },
        { type: "string", value: '"Fail"' },
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
"if"        { return KEYWORD_IF; }
"else"      { return KEYWORD_ELSE; }
"printf"    { return KEYWORD_PRINTF; }
">="        { return OP_GE; }
"<="        { return OP_LE; }
"=="        { return OP_EQ; }
[0-9]+      { yylval.num = atoi(yytext); return NUMBER; }
[a-zA-Z_][a-zA-Z0-9_]* { yylval.id = strdup(yytext); return IDENTIFIER; }
\"[^\"]*\"  { yylval.str = strdup(yytext); return STRING; }
[ \\t\\n]    ; /* skip whitespace */
.           { return yytext[0]; }
%%`
  },
  {
    id: "syntax",
    title: "Phase 2: Syntax Analysis",
    description: "The Parser checks if the tokens follow the grammar rules and builds an Abstract Syntax Tree (AST).",
    details: [
      "Enforces selection statement structures (if-else if-else).",
      "Groups tokens into logical expressions and relational comparisons.",
      "Builds a hierarchical tree representing the nested conditional logic."
    ],
    visualData: {
      ast: {
        type: "Program",
        body: [
          {
            type: "VariableDeclaration",
            id: "marks",
            init: { type: "Literal", value: 75 }
          },
          {
            type: "IfStatement",
            test: {
              type: "BinaryExpression",
              op: ">=",
              left: { type: "Identifier", name: "marks" },
              right: { type: "Literal", value: 90 }
            },
            consequent: { type: "PrintStatement", value: "Grade A" },
            alternate: {
              type: "IfStatement",
              test: {
                type: "BinaryExpression",
                op: ">=",
                left: { type: "Identifier", name: "marks" },
                right: { type: "Literal", value: 75 }
              },
              consequent: { type: "PrintStatement", value: "Grade B" },
              alternate: {
                type: "IfStatement",
                test: {
                  type: "BinaryExpression",
                  op: ">=",
                  left: { type: "Identifier", name: "marks" },
                  right: { type: "Literal", value: 50 }
                },
                consequent: { type: "PrintStatement", value: "Grade C" },
                alternate: { type: "PrintStatement", value: "Fail" }
              }
            }
          }
        ]
      }
    },
    implementationCode: `/* Syntax Specification (parser.y) */
%token KEYWORD_INT KEYWORD_IF KEYWORD_ELSE KEYWORD_PRINTF NUMBER IDENTIFIER STRING OP_GE
%nonassoc LOWER_THAN_ELSE
%nonassoc KEYWORD_ELSE

%%
program: statements ;

statements: statement statements | ;

statement:
    KEYWORD_INT IDENTIFIER '=' expression ';'
    | selection_statement
    | KEYWORD_PRINTF '(' STRING ')' ';'
    ;

selection_statement:
    KEYWORD_IF '(' condition ')' statement %prec LOWER_THAN_ELSE
    | KEYWORD_IF '(' condition ')' statement KEYWORD_ELSE statement
    ;

condition: expression OP_GE expression ;

expression: NUMBER | IDENTIFIER ;
%%`
  },
  {
    id: "semantic",
    title: "Phase 3: Semantic Analysis",
    description: "The Semantic Analyzer ensures the program makes sense (type checking, scope validation).",
    details: [
      "Creates the Symbol Table to track variables and their types.",
      "Verifies that 'marks' is declared before being used in conditions.",
      "Checks for type compatibility in relational operators (int >= int)."
    ],
    visualData: {
      symbolTable: [
        { name: "marks", type: "int", scope: "global/main", initialized: true }
      ]
    },
    implementationCode: `/* Semantic Checker (Analyzer.cpp) */
void SemanticAnalyzer::check(ASTNode* node) {
  if (node->type == NODE_IF) {
    checkCondition(node->condition);
    check(node->thenBlock);
    if (node->elseBlock) check(node->elseBlock);
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
      "Translates high-level control flow (if-else) into conditional jumps.",
      "Introduces labels (L1, L2, L_END) for branch targets.",
      "Maintains variable values in a simple flattened format."
    ],
    visualData: {
      ir: [
        "marks = 75",
        "if marks < 90 goto L1",
        "print \"Grade A\"",
        "goto L_END",
        "L1: if marks < 75 goto L2",
        "print \"Grade B\"",
        "goto L_END",
        "L2: if marks < 50 goto L3",
        "print \"Grade C\"",
        "goto L_END",
        "L3: print \"Fail\"",
        "L_END: halt"
      ]
    },
    implementationCode: `// IR Generation for Control Flow
const generateIR = (node) => {
  if (node.type === 'IfStatement') {
    const L1 = getLabel();
    const L_END = getLabel();
    emit(\`if !\${node.test} goto \${L1}\`);
    generateIR(node.consequent);
    emit(\`goto \${L_END}\`);
    emit(\`\${L1}:\`);
    if (node.alternate) generateIR(node.alternate);
    emit(\`\${L_END}:\`);
  }
};`
  },
  {
    id: "optimization",
    title: "Phase 5: Code Optimization",
    description: "The Optimizer improves the IR to make it faster or smaller without changing the output.",
    details: [
      "Constant Folding: Evaluates 75 < 90 as True during compilation.",
      "Dead Code Removal: Eliminates branches that will never be taken.",
      "Jump Threading: Simplifies sequences of jumps."
    ],
    visualData: {
      before: [
        "marks = 75",
        "if marks < 90 goto L1",
        "print \"Grade A\"",
        "goto L_END",
        "L1: if marks < 75 goto L2"
      ],
      after: [
        "marks = 75",
        "goto L1 // marks < 90 is True (75 < 90)",
        "L1: goto L_PRINT_B // marks < 75 is False",
        "L_PRINT_B: print \"Grade B\"",
        "halt"
      ]
    },
    implementationCode: `/* Jump Optimization (Optimizer.cpp) */
void Optimizer::optimizeJumps(vector<TAC>& code) {
  for (auto& instr : code) {
    if (instr.op == IF_GOTO && instr.cond.isConstant()) {
      if (instr.cond.val) {
        instr.op = GOTO;
      } else {
        instr.op = NOP; // Dead code
      }
    }
  }
}`
  },
  {
    id: "target",
    title: "Phase 6: Target Code",
    description: "The final phase translates IR into low-level machine instructions (x86-style Assembly).",
    details: [
      "Maps 'marks' to a specific memory location ([ebp-4]).",
      "Uses registers (EAX) and flags for comparisons.",
      "Implements selection logic using CMP, JL, and JMP instructions."
    ],
    visualData: {
      asm: [
        "MOV [ebp-4], 75  ; marks = 75",
        "CMP [ebp-4], 90",
        "JL L1",
        "PUSH offset str_A",
        "CALL printf",
        "JMP L_END",
        "L1:",
        "CMP [ebp-4], 75",
        "JL L2",
        "PUSH offset str_B",
        "CALL printf",
        "JMP L_END",
        "L2:",
        "CMP [ebp-4], 50",
        "JL L3",
        "PUSH offset str_C",
        "CALL printf",
        "JMP L_END",
        "L3:",
        "PUSH offset str_Fail",
        "CALL printf",
        "L_END:",
        "HALT"
      ]
    }
  }
];
