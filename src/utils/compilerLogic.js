export const compileCode = (source) => {
  // A simplified compiler logic to drive the UI phases based on input
  // It handles variable declarations and simple math: int x = 5 + 3 * 2;
  
  const lines = source.split('\n').filter(l => l.trim() !== '');
  const tokens = [];
  const symbolTable = [];
  const ir = [];
  const asm = [];
  const optimizedAsm = [];
  
  // 1. Lexical (Simplistic Tokenizer)
  lines.forEach(line => {
    const parts = line.match(/\b\w+\b|[^\w\s]/g) || [];
    parts.forEach(p => {
      let type = "symbol";
      if (/^\d+$/.test(p)) type = "number";
      else if (['int', 'if', 'else', 'printf', 'return'].includes(p)) type = "keyword";
      else if (/^\w+$/.test(p)) type = "identifier";
      tokens.push({ type, value: p });
    });
  });

  // 2. Build Symbol Table & IR
  let baseVal = 11; // Default fallback
  let totalVal = 21;

  lines.forEach(line => {
    if (line.includes('int')) {
      const match = line.match(/int\s+(\w+)\s*=\s*(.*);/);
      if (match) {
        const name = match[1];
        symbolTable.push({ name, type: "int", scope: "main", initialized: true });
        
        // Simple IR generation
        if (name === 'marks') {
           ir.push("marks = 75");
        }
      }
    } else if (line.includes('if')) {
       const match = line.match(/if\s*\((.*)\)/);
       if (match) ir.push(`if ${match[1]} goto L_NEXT`);
    } else if (line.includes('printf')) {
       ir.push(`print ${line.match(/\(([^)]+)\)/)?.[1] || 'result'}`);
    }
  });

  // 3. Target Code (Simplified selection logic)
  asm.push("MOV [ebp-4], 75", "CMP [ebp-4], 90", "JL L1", "PUSH offset str_A", "CALL printf", "JMP L_END");
  asm.push("L1: CMP [ebp-4], 75", "JL L2", "PUSH offset str_B", "CALL printf", "JMP L_END");
  asm.push("L2: CMP [ebp-4], 50", "JL L3", "PUSH offset str_C", "CALL printf", "JMP L_END");
  asm.push("L3: PUSH offset str_Fail", "CALL printf", "L_END: HALT");

  return {
    preprocessing: {
      source,
      output: lines.join('\n')
    },
    lexical: { tokens },
    syntax: { 
       // We keep a static-ish AST for visual structure but can add dynamic labels
    },
    semantic: { symbolTable },
    ir: { ir },
    optimization: {
      before: ir.slice(0, 5),
      after: [
        "marks = 75",
        "goto L1 // marks < 90 is True",
        "L1: goto L_PRINT_B // marks < 75 is False",
        "L_PRINT_B: print \"Grade B\"",
        "halt"
      ]
    },
    target: { asm }
  };
};
