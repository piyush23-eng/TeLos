import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Code2, Play, RotateCcw, Search, Terminal, X, Zap } from 'lucide-react';
import { problemCatalog } from '../../problemCatalog';
import { apiUrl } from '../../apiConfig';
import type { CodeLanguage } from '../../types';

const codeTemplate = (problem: any, lang: CodeLanguage) => {
  const header = `// ${problem?.title || 'Problem'}\n// ${problem?.description || ''}\n\n`;
  if (lang === 'python') {
    return `${header}def solve(input_data):\n    # Write your optimal O(N) solution here\n    result = []\n    return result\n\nif __name__ == "__main__":\n    print(solve(None))\n`;
  }
  if (lang === 'cpp') {
    return `${header}#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint solve() {\n    // Write your optimal solution here\n    return 0;\n}\n\nint main() {\n    cout << solve() << endl;\n    return 0;\n}\n`;
  }
  if (lang === 'java') {
    return `${header}public class Solution {\n    public static void main(String[] args) {\n        System.out.println("Solution executed.");\n    }\n}\n`;
  }
  return `${header}function solve(input) {\n    // Write your optimal solution here\n    return input;\n}\n\nconsole.log(solve(undefined));\n`;
};

export function Bank() {
  const [problems, setProblems] = useState<any[]>(problemCatalog);
  const [selected, setSelected] = useState<any>(problemCatalog[0] || null);
  const [companyFilter, setCompanyFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<CodeLanguage>('python');
  const [code, setCode] = useState(() => codeTemplate(problemCatalog[0], 'python'));
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);

  const openProblem = (problem: any) => {
    const defaultLanguage = (problem.language || language || 'python') as CodeLanguage;
    setSelected(problem);
    setLanguage(defaultLanguage);
    setCode(codeTemplate(problem, defaultLanguage));
    setOutput('');
  };

  useEffect(() => {
    fetch(apiUrl('/api/problems'))
      .then(r => r.json())
      .then(d => {
        const list = d.problems || [];
        if (list.length > 0) {
          setProblems(list);
          if (!selected) {
            setSelected(list[0]);
            const lang = (list[0].language || 'python') as CodeLanguage;
            setLanguage(lang);
            setCode(codeTemplate(list[0], lang));
          }
        }
      })
      .catch(() => undefined);
  }, []);

  const companyFilters = useMemo(
    () => ['all', ...Array.from(new Set(problems.map(p => p.company)))],
    [problems]
  );

  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      const matchesCompany = companyFilter === 'all' || p.company?.toLowerCase() === companyFilter.toLowerCase();
      const matchesDifficulty = difficultyFilter === 'all' || p.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        p.title?.toLowerCase().includes(q) ||
        p.company?.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));
      return matchesCompany && matchesDifficulty && matchesSearch;
    });
  }, [problems, companyFilter, difficultyFilter, searchQuery]);

  const currentIndex = selected ? filteredProblems.findIndex(p => p.id === selected.id) : -1;

  const goToPrev = () => {
    if (currentIndex > 0) {
      openProblem(filteredProblems[currentIndex - 1]);
    } else if (filteredProblems.length > 0) {
      openProblem(filteredProblems[filteredProblems.length - 1]);
    }
  };

  const goToNext = () => {
    if (currentIndex >= 0 && currentIndex < filteredProblems.length - 1) {
      openProblem(filteredProblems[currentIndex + 1]);
    } else if (filteredProblems.length > 0) {
      openProblem(filteredProblems[0]);
    }
  };

  const runCode = async () => {
    if (!selected) return;
    setRunning(true);
    setOutput('Running solution against test sandbox...');
    try {
      const result = await fetch(apiUrl('/api/run'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, problemId: selected.id }),
      });
      if (!result.ok) {
        const errPayload = await result.json().catch(() => ({}));
        throw new Error(errPayload.error || `Runner returned HTTP ${result.status}`);
      }
      const payload = await result.json();
      setOutput(payload.output || 'Solution executed successfully with no errors.');
    } catch (err: any) {
      if (language === 'js') {
        try {
          const logs: string[] = [];
          const customConsole = {
            log: (...args: any[]) => logs.push(args.map(String).join(' ')),
            error: (...args: any[]) => logs.push(args.map(String).join(' ')),
            warn: (...args: any[]) => logs.push(args.map(String).join(' ')),
          };
          const runnerFn = new Function('console', code);
          runnerFn(customConsole);
          setOutput(logs.join('\n') || 'Executed locally: Solution passed with no console errors.');
          return;
        } catch (clientErr: any) {
          setOutput(`Runtime Error:\n${clientErr.message}`);
          return;
        }
      }
      setOutput(err?.message ? `Execution error: ${err.message}` : 'Runner service temporarily unavailable. Please retry in a moment.');
    } finally {
      setRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const nextCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(nextCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <main className="shell">
      <section className="studio-head">
        <div>
          <p className="kicker">04 / LIVE CODING &amp; PRACTICE DRILLS</p>
          <h1>PRACTICE<br /><span>WORKBENCH.</span></h1>
        </div>
        <div className="session-meta">
          <b>{problems.length} CURATED DRILLS</b>
          <span>MULTI-LANGUAGE SANDBOX</span>
          <span>COMPANY-ALIGNED DSA</span>
        </div>
      </section>

      {/* Modern Brutalist Drill Control Deck */}
      <div className="drill-control-deck">
        {/* Top Filter Bar: Company Chips + Difficulty Pills + Search */}
        <div className="drill-filter-bar">
          <div className="drill-filter-group">
            <div className="drill-group-label">
              <Code2 size={13} />
              <span>COMPANY:</span>
            </div>
            <div className="drill-chip-scroll">
              {companyFilters.map(f => (
                <button
                  key={f}
                  className={`drill-filter-chip ${companyFilter === f ? 'active' : ''}`}
                  onClick={() => {
                    setCompanyFilter(f);
                    const nextList = problems.filter(p => 
                      (f === 'all' || p.company === f) &&
                      (difficultyFilter === 'all' || p.difficulty?.toLowerCase() === difficultyFilter.toLowerCase())
                    );
                    if (nextList.length > 0 && (!selected || !nextList.some(p => p.id === selected.id))) {
                      openProblem(nextList[0]);
                    }
                  }}
                >
                  {f === 'all' ? 'All Companies' : f}
                </button>
              ))}
            </div>
          </div>

          <div className="drill-filter-group">
            <div className="drill-group-label">
              <Zap size={13} />
              <span>DIFFICULTY:</span>
            </div>
            <div className="drill-difficulty-pills">
              {(['all', 'Easy', 'Medium', 'Hard'] as const).map(diff => (
                <button
                  key={diff}
                  className={`drill-diff-pill ${difficultyFilter === diff ? 'active' : ''} diff-${diff.toLowerCase()}`}
                  onClick={() => {
                    setDifficultyFilter(diff);
                    const nextList = problems.filter(p => 
                      (companyFilter === 'all' || p.company === companyFilter) &&
                      (diff === 'all' || p.difficulty?.toLowerCase() === diff.toLowerCase())
                    );
                    if (nextList.length > 0 && (!selected || !nextList.some(p => p.id === selected.id))) {
                      openProblem(nextList[0]);
                    }
                  }}
                >
                  {diff.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="drill-search-box">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search drills by topic..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="drill-search-clear" onClick={() => setSearchQuery('')}>
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Drill Navigator: Prev / Next / Jump Select / Metadata */}
        <div className="drill-navigator-strip">
          <div className="drill-nav-controls">
            <button 
              className="drill-nav-btn prev-btn" 
              onClick={goToPrev}
              disabled={filteredProblems.length === 0}
              title="Previous Problem"
            >
              <ChevronLeft size={14} />
              <span>PREV</span>
            </button>

            <div className="drill-active-select-wrapper">
              <select
                className="drill-active-select"
                value={selected?.id || ''}
                onChange={e => {
                  const target = problems.find(p => p.id === e.target.value);
                  if (target) openProblem(target);
                }}
              >
                {filteredProblems.map((p, idx) => (
                  <option key={p.id} value={p.id}>
                    [{p.company}] #{String(idx + 1).padStart(2, '0')} — {p.title} ({p.difficulty})
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="drill-select-arrow" />
            </div>

            <button 
              className="drill-nav-btn next-btn" 
              onClick={goToNext}
              disabled={filteredProblems.length === 0}
              title="Next Problem"
            >
              <span>NEXT</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="drill-nav-meta">
            {selected && (
              <>
                <span className="drill-tag-badge company-tag">{selected.company}</span>
                <span className={`drill-tag-badge difficulty-tag diff-${selected.difficulty?.toLowerCase()}`}>
                  {selected.difficulty}
                </span>
                {selected.category && (
                  <span className="drill-tag-badge category-tag">{selected.category}</span>
                )}
              </>
            )}
            <span className="drill-counter-pill">
              {currentIndex >= 0 ? `${currentIndex + 1} / ${filteredProblems.length}` : `${filteredProblems.length}`} DRILLS
            </span>
          </div>
        </div>
      </div>

      {/* Main Split: Left Question Box, Right Workspace Box (100% Symmetrical Equal Dual-Pane) */}
      <section className="drill-workspace-shell">
        {/* LEFT EQUAL BOX: Question Details & Specs */}
        <div className="drill-box drill-question-box">
          <div className="panel-label">
            <span>
              <Code2 size={13} style={{ display: 'inline', marginRight: 6 }} />
              ACTIVE DRILL • {selected?.company?.toUpperCase() || 'SPECIFICATIONS'}
            </span>
            <span>{selected?.difficulty?.toUpperCase() || 'DRILL DETAILS'}</span>
          </div>

          <div className="drill-question-scroll">
            {selected ? (
              <>
                <div className="drill-question-hero">
                  <p className="kicker">DRILL SPECIFICATION / {selected.company}</p>
                  <h2>{selected.title}</h2>
                  <div className="drill-meta-pills">
                    <span className={`drill-tag-badge difficulty-tag diff-${selected.difficulty?.toLowerCase()}`}>
                      {selected.difficulty} DIFFICULTY
                    </span>
                    {selected.category && (
                      <span className="drill-tag-badge category-tag">{selected.category}</span>
                    )}
                    <span className="metric-pill">
                      TARGET: {selected.details?.expectedComplexity || 'O(N) TIME'}
                    </span>
                  </div>
                </div>

                <div className="problem-statement-block">
                  <p className="problem-statement">{selected.details?.prompt || selected.description}</p>
                </div>

                <div className="problem-io">
                  <div>
                    <strong>INPUT</strong>
                    <span>{selected.details?.input || 'Function parameters described above.'}</span>
                  </div>
                  <div>
                    <strong>OUTPUT</strong>
                    <span>{selected.details?.output || 'Expected return value.'}</span>
                  </div>
                  <div>
                    <strong>COMPLEXITY</strong>
                    <span>{selected.details?.expectedComplexity || 'Optimal time and auxiliary space.'}</span>
                  </div>
                </div>

                {selected.details?.examples && selected.details.examples.length > 0 && (
                  <div className="example-stack">
                    <div className="panel-label" style={{ padding: '8px 0', border: 0, borderBottom: '1px solid var(--line)' }}>
                      <span>EXAMPLES</span>
                      <span>TEST CASES</span>
                    </div>
                    {selected.details.examples.map((example: any, index: number) => (
                      <article className="example-card" key={index}>
                        <strong>EXAMPLE {index + 1}</strong>
                        <code>Input: {example.input}</code>
                        <code>Output: {example.output}</code>
                        {example.explanation && <p>{example.explanation}</p>}
                      </article>
                    ))}
                  </div>
                )}

                <div className="constraint-card">
                  <div className="panel-label" style={{ padding: '8px 0', border: 0, borderBottom: '1px solid var(--line)' }}>
                    <span>CONSTRAINTS</span>
                    <span>BOUNDARIES</span>
                  </div>
                  <ul>
                    {(selected.details?.constraints || ['1 <= nums.length <= 10^5', 'Optimal O(N) runtime required.']).map((constraint: string) => (
                      <li key={constraint}>{constraint}</li>
                    ))}
                  </ul>
                  {selected.hint && (
                    <div className="hint-callout">
                      <b>INTERVIEW HINT</b>
                      <span>{selected.hint}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state">
                Select a drill to view specifications.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT EQUAL BOX: Code Workspace & Terminal Output */}
        <div className="drill-box drill-code-box">
          <div className="panel-label">
            <span>
              <Terminal size={13} style={{ display: 'inline', marginRight: 6 }} />
              WORKSPACE • {language.toUpperCase()}
            </span>
            <span>SANDBOX READY • TAB: 2 SPACES</span>
          </div>

          <div className="drill-code-toolbar">
            <label>
              LANGUAGE
              <select
                value={language}
                onChange={e => {
                  const next = e.target.value as CodeLanguage;
                  setLanguage(next);
                  if (selected) {
                    setCode(codeTemplate(selected, next));
                    setOutput('Starter reset for ' + next.toUpperCase() + '.');
                  }
                }}
              >
                <option value="python">Python 3</option>
                <option value="js">JavaScript (Node.js)</option>
                <option value="cpp">C++ (GCC 12)</option>
                <option value="java">Java (OpenJDK 17)</option>
              </select>
            </label>
            <span className="runtime-label">
              {language === 'python'
                ? 'Python 3.11 Sandbox'
                : language === 'js'
                ? 'Node.js 20 Sandbox'
                : language === 'cpp'
                ? 'GCC C++20 Sandbox'
                : 'OpenJDK 17 Sandbox'}
            </span>
          </div>

          <textarea
            className="drill-code-input"
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            placeholder="// Write your solution here..."
          />

          <div className="drill-action-bar">
            <button className="brand-button" onClick={runCode} disabled={running}>
              <Play size={15} fill="currentColor" /> {running ? 'RUNNING...' : 'RUN SOLUTION'}
            </button>
            <button className="ghost-button" onClick={() => selected && openProblem(selected)}>
              <RotateCcw size={13} style={{ display: 'inline', marginRight: 4 }} /> RESET CODE
            </button>
          </div>

          <div className="drill-console-pane">
            <div className="drill-console-header">
              <span>SANDBOX CONSOLE / TEST OUTPUT</span>
              <span>{running ? 'PROCESSING...' : 'RESULT'}</span>
            </div>
            <pre className="drill-console-output">
              {output || '// Click "RUN SOLUTION" to execute code against sandbox test cases.'}
            </pre>
          </div>
        </div>
      </section>
    </main>
  );
}
