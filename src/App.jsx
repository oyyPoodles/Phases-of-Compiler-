import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Wind, 
  Layers, 
  Terminal as TerminalIcon,
  Search,
  Code,
  Activity,
  ArrowRight,
  ChevronRight,
  Heart,
  Circle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { compilerPhases } from './data/compilerData';
import { compileCode } from './utils/compilerLogic';
import './App.css';

const App = () => {
  const [sourceCode, setSourceCode] = useState(
`#include <stdio.h>

int main() {
  int base = 5 + 3 * 2;
  int total = base + 10;
  total = total - 4;
  printf(total);
  printf(base + total);
  return 0;
}`
  );
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [compiledData, setCompiledData] = useState(compileCode(sourceCode));

  useEffect(() => {
    setCompiledData(compileCode(sourceCode));
  }, [sourceCode]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const [showImpl, setShowImpl] = useState(false);

  useEffect(() => {
    setShowImpl(false); // Reset when phase changes
  }, [currentPhaseIdx]);

  const activePhase = compilerPhases[currentPhaseIdx];
  const activeData = {
    ...activePhase,
    visualData: compiledData[activePhase.id] || activePhase.visualData
  };

  const handleRun = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00d2ff', '#3a7bd5', '#fcd34d'],
      scalar: 1.2,
      gravity: 0.5
    });
  };

  return (
    <div className="app-container">
      <div className="mesh-gradient"></div>
      <div className="pretty-glow" style={{ left: cursorPos.x, top: cursorPos.y }}></div>

      <header>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="header-subtitle"
        >
          An Elegant Journey Through Logic
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          Compiler Atlas
        </motion.h1>
      </header>

      <nav className="nav-rail">
        {compilerPhases.map((phase, idx) => (
          <div 
            key={phase.id}
            className={`nav-item ${idx === currentPhaseIdx ? 'active' : ''}`}
            onClick={() => setCurrentPhaseIdx(idx)}
          >
            {phase.title.split(':')[0] || phase.title}
          </div>
        ))}
      </nav>

      <main className="stage-canvas">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeData.id}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="stage-card"
          >
            <button 
              className="btn-impl-toggle" 
              onClick={() => setShowImpl(!showImpl)}
            >
              {showImpl ? <ChevronRight size={16} style={{ transform: 'rotate(90deg)' }} /> : <Code size={16} />}
              {showImpl ? 'Hide Implementation' : 'Show Implementation Code'}
            </button>

            <AnimatePresence>
              {showImpl && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="impl-view"
                >
                  <div className="impl-header">
                    <TerminalIcon size={14} /> INTERNAL_ENGINE_LOG.js
                  </div>
                  <pre className="impl-code">
                    {activeData.implementationCode}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid-layout">
              <div className="info-block">
                <div style={{ color: 'var(--primary)', fontStyle: 'italic', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Step {currentPhaseIdx + 1}
                </div>
                <h2 className="stage-title">{activeData.title}</h2>
                <p className="stage-description">{activeData.description}</p>
                
                <h4>Core Methodology</h4>
                <ul className="feature-list">
                  {activeData.details.map((detail, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + (i * 0.1) }}
                      className="feature-item"
                    >
                      <Sparkles size={16} style={{ color: 'var(--accent)', marginTop: '0.2rem' }} />
                      <span>{detail}</span>
                    </motion.li>
                  ))}
                </ul>

                <div style={{ marginTop: '4rem', display: 'flex', gap: '1.5rem' }}>
                  <button className="btn-elegant" onClick={handleRun}>
                    Execute Pipeline
                  </button>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="nav-arrow" 
                      onClick={() => setCurrentPhaseIdx(p => Math.max(0, p - 1))}
                      disabled={currentPhaseIdx === 0}
                      style={{ background: 'none', border: '1px solid var(--border)', color: '#fff', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                    </button>
                    <button 
                      className="nav-arrow" 
                      onClick={() => setCurrentPhaseIdx(p => Math.min(compilerPhases.length - 1, p + 1))}
                      disabled={currentPhaseIdx === compilerPhases.length - 1}
                      style={{ background: 'none', border: '1px solid var(--border)', color: '#fff', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="visual-container">
                <PhaseVisualizer 
                  phase={activeData} 
                  sourceCode={sourceCode} 
                  setSourceCode={setSourceCode} 
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer>
        DESIGNED WITH ELEGANCE • COMPILER ATLAS PROTOCOL • 2026
      </footer>
    </div>
  );
};

const PhaseVisualizer = ({ phase, sourceCode, setSourceCode }) => {
  switch(phase.id) {
    case 'preprocessing':
      return (
        <div className="vis-box">
           <div style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Composition Area</div>
           <textarea 
             className="code-editor-elegant" 
             value={sourceCode}
             onChange={(e) => setSourceCode(e.target.value)}
             spellCheck="false"
             style={{ 
               width: '100%', 
               minHeight: '300px', 
               resize: 'none', 
               outline: 'none',
               color: '#fff',
               background: 'rgba(0,0,0,0.4)',
               fontSize: '0.9rem',
               lineHeight: 1.6
             }}
           />
           <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
             <div style={{ fontSize: '0.6rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>REFINED OUTPUT</div>
             <pre style={{ fontSize: '0.8rem', opacity: 0.7 }}>{phase.visualData.output}</pre>
           </div>
        </div>
      );
    case 'lexical':
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {phase.visualData.tokens.map((t, i) => (
            <motion.div 
              key={i}
              className="token-tag"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.01 }}
            >
              <div style={{ fontSize: '0.5rem', opacity: 0.5 }}>{t.type}</div>
              <div style={{ fontWeight: 600 }}>{t.value}</div>
            </motion.div>
          ))}
        </div>
      );
    case 'syntax':
      return (
        <div className="code-editor-elegant" style={{ background: 'rgba(0,0,0,0.6)', borderStyle: 'dashed' }}>
           <pre style={{ color: 'var(--primary)', fontSize: '0.8rem', lineHeight: 1.8 }}>
{`Program_Root
 ├─ Init: base
 │   └─ Op: ADD (5, MUL(3, 2))
 ├─ Init: total
 │   └─ Op: ADD (base, 10)
 ├─ Assign: total
 │   └─ Op: SUB (total, 4)
 └─ Call: printf(total)
 └─ Call: printf(ADD(base, total))`}
           </pre>
        </div>
      );
    case 'semantic':
      return (
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '32px', padding: '2rem', border: '1px solid var(--border)' }}>
          {phase.visualData.symbolTable.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>IDENTIFIER</div>
                <div style={{ fontFamily: 'JetBrains Mono' }}>{s.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--primary)' }}>TYPE_SPEC</div>
                <div style={{ color: 'var(--accent)' }}>{s.type}</div>
              </div>
            </div>
          ))}
        </div>
      );
    case 'ir':
    case 'optimization':
      const lines = phase.id === 'ir' ? phase.visualData.ir : phase.visualData.after;
      return (
        <div className="code-editor-elegant">
          {lines.map((l, i) => (
            <div key={i} style={{ display: 'flex', gap: '1.5rem', opacity: 0.8 }}>
              <span style={{ fontSize: '0.7rem', opacity: 0.2 }}>{i+1}</span>
              <code style={{ fontSize: '0.85rem' }}>{l}</code>
            </div>
          ))}
        </div>
      );
    case 'target':
      return (
        <div className="vis-container">
          <div className="code-editor-elegant" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {phase.visualData.asm.map((l, i) => (
              <div key={i} style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                <span style={{ color: 'var(--primary)', marginRight: '1rem' }}>{i.toString(16).padStart(2, '0')}</span>
                <code>{l}</code>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '2rem', padding: '2rem', background: '#000', borderRadius: '32px', border: '1px solid var(--primary)', boxShadow: '0 0 30px rgba(0, 210, 255, 0.1)' }}>
             <div style={{ fontSize: '0.6rem', color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TerminalIcon size={14} /> EXECUTOR_LOG
             </div>
             <div style={{ fontFamily: 'JetBrains Mono', fontSize: '1rem' }}>
                <div style={{ opacity: 0.5 }}>$ run final_bin</div>
                <div style={{ color: 'var(--accent)', margin: '0.5rem 0' }}>OUT: 1728</div>
                <div style={{ color: '#10b981', fontSize: '0.7rem' }}>√ SUCCESS</div>
             </div>
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default App;
