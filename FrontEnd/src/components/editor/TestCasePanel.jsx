

import { useState } from 'react'
import {
  ChevronDown, ChevronUp, CheckCircle, XCircle,
  Loader2, Clock, Cpu, AlertTriangle,
} from 'lucide-react'

const STATUS_STYLES = {
  Accepted:           { border: '#bbf7d0', header: '#f0fdf4', hover: '#dcfce7', icon: 'green',  label: '#16a34a' },
  'Wrong Answer':     { border: '#fecaca', header: '#fef2f2', hover: '#fee2e2', icon: 'red',    label: '#dc2626' },
  'Compilation Error':{ border: '#fed7aa', header: '#fff7ed', hover: '#ffedd5', icon: 'orange', label: '#ea580c' },
  'Runtime Error':    { border: '#fecaca', header: '#fef2f2', hover: '#fee2e2', icon: 'red',    label: '#dc2626' },
  Failed:             { border: '#fecaca', header: '#fef2f2', hover: '#fee2e2', icon: 'red',    label: '#dc2626' },
}

function ResultRow({ result, label, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const s = result.passed
    ? STATUS_STYLES['Accepted']
    : STATUS_STYLES['Wrong Answer']

  return (
    <div
      className="rounded-lg border overflow-hidden mb-2"
      style={{ borderColor: s.border }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors"
        style={{ background: s.header }}
        onMouseEnter={e => { e.currentTarget.style.background = s.hover }}
        onMouseLeave={e => { e.currentTarget.style.background = s.header }}
      >
        <div className="flex items-center gap-2">
          {result.passed
            ? <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
            : <XCircle     size={14} className="text-red-500   flex-shrink-0" />
          }
          <span className="text-[12px] font-semibold" style={{ color: s.label }}>
            {label}
          </span>
          {result.time && (
            <span className="text-[10px] text-gray-400 font-mono ml-1 flex items-center gap-0.5">
              <Clock size={9} />{result.time}
            </span>
          )}
        </div>
        {open
          ? <ChevronUp   size={13} className="text-gray-400" />
          : <ChevronDown size={13} className="text-gray-400" />
        }
      </button>

      {open && (
        <div className="px-3 py-3 bg-white border-t border-gray-100 space-y-2 font-mono text-[12px]">
          {result.input !== undefined && result.input !== '' && (
            <div>
              <span className="text-gray-400 text-[11px] uppercase tracking-wide">Input</span>
              <div className="mt-1 px-2 py-1.5 rounded bg-gray-50 text-black whitespace-pre-wrap">
                {result.input}
              </div>
            </div>
          )}
          <div>
            <span className="text-gray-400 text-[11px] uppercase tracking-wide">Expected</span>
            <div className="mt-1 px-2 py-1.5 rounded bg-gray-50 text-green-700 whitespace-pre-wrap">
              {result.expected || '(empty)'}
            </div>
          </div>
          <div>
            <span className="text-gray-400 text-[11px] uppercase tracking-wide">Your Output</span>
            <div
              className="mt-1 px-2 py-1.5 rounded whitespace-pre-wrap"
              style={{
                background: result.passed ? '#f0fdf4' : '#fef2f2',
                color:      result.passed ? '#16a34a'  : '#dc2626',
              }}
            >
              {result.actual || '(no output)'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function VerdictBanner({ result }) {
  const accepted = result.verdict === 'Accepted'
  const isError  = result.verdict === 'Compilation Error' || result.verdict === 'Runtime Error'

  const colours = accepted
    ? { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' }
    : isError
      ? { bg: '#fff7ed', border: '#fed7aa', text: '#ea580c' }
      : { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' }

  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-xl mb-3"
      style={{ background: colours.bg, border: `1px solid ${colours.border}` }}
    >
      <div className="flex items-center gap-2.5">
        {accepted
          ? <CheckCircle  size={16} className="text-green-600" />
          : isError
            ? <AlertTriangle size={16} style={{ color: colours.text }} />
            : <XCircle      size={16} className="text-red-500" />
        }
        <span className="text-[14px] font-bold" style={{ color: colours.text }}>
          {result.verdict}
        </span>
        {!isError && (
          <span className="text-[12px] text-gray-500 font-mono">
            {result.passed}/{result.total} passed
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-[11px] text-gray-400 font-mono">
        {result.runtime !== '—' && (
          <span className="flex items-center gap-1">
            <Clock size={10} /> {result.runtime}
          </span>
        )}
        {result.memory !== '—' && (
          <span className="flex items-center gap-1">
            <Cpu size={10} /> {result.memory}
          </span>
        )}
      </div>
    </div>
  )
}

function LoadingState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      <Loader2 size={20} className="text-orange-500 animate-spin" />
      <span className="text-[12px] text-gray-400">{label}</span>
    </div>
  )
}

export default function TestCasePanel({
  problem,
  activeTab,
  setActiveTab,
  runResults,
  submitResult,
  running,
  submitting,
  panelHeight,
  onDragStart,
}) {
  const [collapsed, setCollapsed] = useState(false)
  const isLoading = running || submitting
  const loadLabel = running ? 'Running your code…' : 'Submitting…'
  const height = collapsed ? 40 : (panelHeight || 220)

  return (
    <div
      className="flex flex-col bg-white flex-shrink-0 relative"
      style={{ height }}
    >
      {}
      {!collapsed && (
        <div
          onMouseDown={onDragStart}
          className="h-1 flex-shrink-0 bg-gray-200 hover:bg-orange-400 active:bg-orange-500 cursor-row-resize transition-colors z-10"
        />
      )}
      {}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-1">
          {['testcases', 'results'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-3 py-1 rounded text-[12px] font-semibold transition-all capitalize"
              style={
                activeTab === tab
                  ? { background: '#000', color: '#fff' }
                  : { color: '#9ca3af' }
              }
              onMouseEnter={e => {
                if (activeTab !== tab) { e.currentTarget.style.color = '#000'; e.currentTarget.style.background = '#f3f4f6' }
              }}
              onMouseLeave={e => {
                if (activeTab !== tab) { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent' }
              }}
            >
              {tab === 'testcases' ? 'Test Cases' : 'Results'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setCollapsed(c => !c)}
          className="p-1 rounded text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
        >
          {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-3">

          {}
          {isLoading && <LoadingState label={loadLabel} />}

          {}
          {!isLoading && activeTab === 'testcases' && (
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                Sample Test Cases
              </p>
              {(problem?.sampleTestCases || []).length === 0 ? (
                <p className="text-[12px] text-gray-400 italic">No sample test cases available.</p>
              ) : (
                (problem?.sampleTestCases || []).map((tc, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 mb-2 overflow-hidden">
                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                        Case {i + 1}
                      </span>
                    </div>
                    <div className="p-3 font-mono text-[12px] space-y-1.5">
                      <div>
                        <span className="text-gray-400">Input:  </span>
                        <span className="text-black">{tc.input}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Output: </span>
                        <span className="text-green-700">{tc.expected}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {}
          {!isLoading && activeTab === 'results' && runResults && !submitResult && (() => {
            const { results, submissionStatus, errorOutput, error } = runResults

            if (submissionStatus === 'CompilationError' || submissionStatus === 'RunTimeError') {
              const label = submissionStatus === 'CompilationError' ? 'Compilation Error' : 'Runtime Error'
              return (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-center">
                    <AlertTriangle size={16} className="text-orange-500 flex-shrink-0" />
                    <span className="text-[13px] font-semibold text-orange-600">{label}</span>
                  </div>
                  {errorOutput ? (
                    <div className="rounded-lg border border-red-200 bg-red-50/50 overflow-hidden">
                      <div className="px-3 py-1.5 bg-red-100/60 border-b border-red-200">
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide">Error Output</span>
                      </div>
                      <pre className="p-3 text-[11px] font-mono text-red-700 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[140px] overflow-y-auto">
                        {errorOutput}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400">Check your code and try again.</p>
                  )}
                </div>
              )
            }

            if (error && results.length === 0) {
              return (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[12px] text-red-400">{error}</p>
                </div>
              )
            }

            return (
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                  Run Results
                </p>
                {results.length === 0
                  ? <p className="text-[12px] text-gray-400 italic">No results returned.</p>
                  : results.map((r, i) => (
                      <ResultRow
                        key={i}
                        result={r}
                        label={`Case ${i + 1}`}
                        defaultOpen={i === 0}
                      />
                    ))
                }
              </div>
            )
          })()}

          {}
          {!isLoading && activeTab === 'results' && submitResult && (() => {
            const { verdict, firstWrong, errorOutput } = submitResult
            const accepted = verdict === 'Accepted'
            const isError  = verdict === 'Compilation Error' || verdict === 'Runtime Error'

            return (
              <div>
                <VerdictBanner result={submitResult} />

                {accepted && (
                  <div className="flex flex-col items-center justify-center py-4 gap-1">
                    <CheckCircle size={22} className="text-green-500" />
                    <span className="text-[13px] font-semibold text-green-600">All test cases passed!</span>
                  </div>
                )}

                {isError && errorOutput && (
                  <div className="rounded-lg border border-red-200 bg-red-50/50 overflow-hidden mb-3">
                    <div className="px-3 py-1.5 bg-red-100/60 border-b border-red-200">
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide">Error Output</span>
                    </div>
                    <pre className="p-3 text-[11px] font-mono text-red-700 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[140px] overflow-y-auto">
                      {errorOutput}
                    </pre>
                  </div>
                )}

                {!accepted && !isError && firstWrong && (
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                      First Failing Case
                    </p>
                    <ResultRow
                      result={{
                        input:    String(firstWrong.input           ?? ''),
                        expected: String(firstWrong.expected_output ?? '').trim(),
                        actual:   String(firstWrong.actual_output   ?? '').trim(),
                        passed:   false,
                        time:     firstWrong.runtime_ms != null ? `${firstWrong.runtime_ms}ms` : null,
                      }}
                      label="First Wrong Answer"
                      defaultOpen={true}
                    />
                  </div>
                )}

                {!accepted && !isError && !firstWrong && (
                  <div className="text-center py-3">
                    <p className="text-[12px] text-gray-400">No detailed result available.</p>
                  </div>
                )}
              </div>
            )
          })()}

          {}
          {!isLoading && activeTab === 'results' && !runResults && !submitResult && (
            <div className="flex items-center justify-center h-full">
              <p className="text-[12px] text-gray-400">Run or Submit to see results</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}