

import { useState, useEffect } from 'react'
import { FileText, Clock, Send, Trash2, Eye, ArrowLeft, Activity,
         RotateCcw, Loader2, AlertCircle, CheckCircle,
         Lightbulb, MemoryStick } from 'lucide-react'
import { aiApi } from '../../api/auth'
import ReactMarkdown from 'react-markdown'

const DIFF_COLOR = {
  Easy:   { text: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  Medium: { text: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  Hard:   { text: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
}

const TABS = [
  { id: 'description', label: 'Description', icon: FileText },
  { id: 'submissions', label: 'Submissions',  icon: Clock    },
]

function DeleteConfirmModal({ submission, onConfirm, onCancel }) {
  if (!submission) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onCancel}
      />
      {}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-[340px] mx-4 p-6 flex flex-col gap-4">
        {}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
            <Trash2 size={20} className="text-red-500" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-black">Delete Submission?</p>
            <p className="text-[12px] text-gray-400 mt-1">
              This will permanently remove your{' '}
              <span className="font-semibold text-gray-600">{submission.language}</span> submission
              {submission.date ? ` from ${submission.date}` : ''}.
            </p>
          </div>
        </div>

        {}
        <div className="flex justify-center">
          <span
            className="px-3 py-1 rounded-full text-[11px] font-bold border"
            style={{
              color:       submission.verdict === 'Accepted' ? '#16a34a' : '#dc2626',
              background:  submission.verdict === 'Accepted' ? '#f0fdf4' : '#fef2f2',
              borderColor: submission.verdict === 'Accepted' ? '#bbf7d0' : '#fecaca',
            }}
          >
            {submission.verdict}
          </span>
        </div>

        {}
        <div className="flex gap-2 mt-1">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function DescriptionTab({ problem }) {
  const dc = DIFF_COLOR[problem.difficulty] || DIFF_COLOR.Easy
  return (
    <div className="p-5 space-y-5 text-[14px]">
      <div>
        <h1 className="text-[18px] font-bold text-black tracking-tight mb-2">{problem.title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="px-2.5 py-0.5 rounded-full text-[12px] font-semibold"
            style={{ color: dc.text, background: dc.bg, border: `1px solid ${dc.border}` }}
          >
            {problem.difficulty}
          </span>
          {(problem.tags || []).map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-500">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="text-[14px] text-gray-700 leading-relaxed markdown-content space-y-4">
        <ReactMarkdown
          components={{
            h1: ({node, ...props}) => <h1 className="text-xl font-bold text-black mt-4 mb-2" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-lg font-bold text-black mt-4 mb-2" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-md font-bold text-black mt-3 mb-1" {...props} />,
            p: ({node, ...props}) => <p className="mb-3" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
            li: ({node, ...props}) => <li {...props} />,
            code: ({node, inline, ...props}) => 
              inline ? (
                <code className="px-1.5 py-0.5 rounded bg-gray-100 text-orange-600 font-mono text-[12px]" {...props} />
              ) : (
                <pre className="p-3 bg-gray-50 rounded-lg border border-gray-200 overflow-x-auto my-3"><code className="text-[12px] font-mono text-gray-800" {...props} /></pre>
              ),
            strong: ({node, ...props}) => <strong className="font-semibold text-black" {...props} />
          }}
        >
          {problem.description || problem.description_md}
        </ReactMarkdown>
      </div>

      {(problem.examples || []).map((ex, i) => (
        <div key={i} className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">
              Example {i + 1}
            </span>
          </div>
          <div className="p-4 font-mono text-[12.5px] space-y-1.5">
            <div><span className="text-gray-400">Input:  </span><span className="text-black">{ex.input}</span></div>
            <div><span className="text-gray-400">Output: </span><span className="text-green-700 font-semibold">{ex.output}</span></div>
            {ex.explanation && (
              <div className="pt-1 text-gray-500 font-sans text-[12px]">{ex.explanation}</div>
            )}
          </div>
        </div>
      ))}

      {}
      {(problem.time_limit_ms || problem.memory_limit_kb || (problem.constraints || []).length > 0) && (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Constraints</span>
          </div>

          <div className="p-4 space-y-3">
            {}
            {(problem.time_limit_ms || problem.memory_limit_kb) && (
              <div className="flex gap-2 flex-wrap">
                {problem.time_limit_ms && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
                    <Clock size={12} className="text-blue-500 flex-shrink-0" />
                    <span className="text-[11px] font-semibold text-blue-600">Time Limit</span>
                    <span className="text-[12px] font-bold text-blue-800 font-mono">
                      {problem.time_limit_ms >= 1000
                        ? `${problem.time_limit_ms / 1000}s`
                        : `${problem.time_limit_ms}ms`}
                    </span>
                  </div>
                )}
                {problem.memory_limit_kb && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-100">
                    <MemoryStick size={12} className="text-purple-500 flex-shrink-0" />
                    <span className="text-[11px] font-semibold text-purple-600">Memory Limit</span>
                    <span className="text-[12px] font-bold text-purple-800 font-mono">
                      {problem.memory_limit_kb >= 1024
                        ? `${Math.round(problem.memory_limit_kb / 1024)} MB`
                        : `${problem.memory_limit_kb} KB`}
                    </span>
                  </div>
                )}
              </div>
            )}

            {}
            {(problem.constraints || []).length > 0 && (
              <ul className="space-y-1.5">
                {problem.constraints.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-gray-600 font-mono">
                    <span className="text-orange-400 mt-0.5 flex-shrink-0">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ComplexityBadge({ label, notation, color }) {
  return (
    <div className={`flex flex-col items-center justify-center px-4 py-3 rounded-xl border ${color} flex-1`}>
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-0.5">{label}</span>
      <span className="font-mono text-[15px] font-bold">{notation}</span>
    </div>
  )
}

function AnalysisView({ submission, problemId, onBack }) {
  const [loading,  setLoading]  = useState(false)
  const [analysis, setAnalysis] = useState(submission.analysis || null)
  const [error,    setError]    = useState(null)

  const normalizeAnalysis = (d) => {
    const suggestions = d.code_suggestions
      ? Array.isArray(d.code_suggestions)
        ? d.code_suggestions.map(s => `${s.issue}: ${s.suggestion}`)
        : [`${d.code_suggestions.issue}: ${d.code_suggestions.suggestion}`]
      : []
    return {
      time_complexity:  { notation: d.time_complexity?.value || '—',  explanation: d.time_complexity?.description  || '' },
      space_complexity: { notation: d.space_complexity?.value || '—', explanation: d.space_complexity?.description || '' },
      review:      d.overall_rating?.summary || '',
      score:       d.overall_rating?.score   ?? null,
      suggestions,
    }
  }

  const runAnalysis = async () => {
    setLoading(true); setError(null)
    try {
      const { data } = await aiApi.analyzeCode(submission._id)
      const payload = data?.data || data
      setAnalysis(normalizeAnalysis(payload))
    } catch (err) {
      setError(err?.response?.data?.message || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (!analysis) runAnalysis() }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <button onClick={onBack}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold
            text-gray-500 hover:text-black hover:bg-gray-100 transition-all border border-gray-200">
          <ArrowLeft size={13} /> Back
        </button>
        <div className="h-4 w-px bg-gray-200" />
        <Activity size={13} className="text-orange-500" />
        <span className="text-[13px] font-bold text-black">Code Analysis</span>
        <span className="ml-auto px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-mono text-gray-500">{submission.language}</span>
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold"
          style={{ color: submission.verdict === 'Accepted' ? '#16a34a' : '#dc2626', background: submission.verdict === 'Accepted' ? '#f0fdf4' : '#fef2f2' }}>
          {submission.verdict}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <span className="text-[11px] font-semibold text-gray-500 ml-1">Submitted Code</span>
            </div>
            <span className="text-[10px] font-mono text-gray-400">{submission.date}</span>
          </div>
          <div className="overflow-auto bg-[#fafafa]" style={{ height: '200px' }}>
            <pre className="p-4 text-[12px] font-mono text-gray-800 leading-relaxed whitespace-pre min-w-max">
              {submission.code || '// No code available'}
            </pre>
          </div>
        </div>

        {loading && !analysis && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="relative w-10 h-10">
              <div className="w-10 h-10 rounded-full border-2 border-orange-100 absolute inset-0" />
              <Loader2 size={20} className="text-orange-500 animate-spin absolute inset-0 m-auto" />
            </div>
            <p className="text-[13px] font-medium text-gray-400">Analyzing your code…</p>
            <p className="text-[11px] text-gray-300">This may take a moment</p>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
              <span className="text-[13px] text-red-600 font-medium">{error}</span>
            </div>
            <button onClick={runAnalysis}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-red-500 text-white hover:bg-red-600 transition-all">
              <RotateCcw size={11} /> Try again
            </button>
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <ComplexityBadge label="Time Complexity"  notation={analysis.time_complexity?.notation  || '—'} color="bg-blue-50 border-blue-200 text-blue-700" />
              <ComplexityBadge label="Space Complexity" notation={analysis.space_complexity?.notation || '—'} color="bg-purple-50 border-purple-200 text-purple-700" />
            </div>

            {analysis.time_complexity?.explanation && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={12} className="text-blue-500" />
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">Time Complexity</span>
                </div>
                <p className="text-[12.5px] text-gray-700 leading-relaxed">{analysis.time_complexity.explanation}</p>
              </div>
            )}

            {analysis.space_complexity?.explanation && (
              <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MemoryStick size={12} className="text-purple-500" />
                  <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wide">Space Complexity</span>
                </div>
                <p className="text-[12.5px] text-gray-700 leading-relaxed">{analysis.space_complexity.explanation}</p>
              </div>
            )}

            {analysis.review && (
              <div className="rounded-xl border border-green-100 bg-green-50/40 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={12} className="text-green-500" />
                    <span className="text-[11px] font-bold text-green-700 uppercase tracking-wide">Overall Rating</span>
                  </div>
                  {analysis.score != null && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-700">{analysis.score}/10</span>
                  )}
                </div>
                <p className="text-[12.5px] text-gray-700 leading-relaxed">{analysis.review}</p>
              </div>
            )}

            {analysis.suggestions?.length > 0 && (
              <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={12} className="text-orange-500" />
                  <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wide">Suggestions</span>
                </div>
                <ul className="space-y-2">
                  {analysis.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12.5px] text-gray-700">
                      <span className="text-orange-400 mt-0.5 flex-shrink-0 font-bold">→</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {}
          </div>
        )}

        {analysis && loading && (
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-20">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 shadow-lg pointer-events-auto">
              <Loader2 size={14} className="text-orange-400 animate-spin" />
              <span className="text-[12px] text-gray-600 font-medium">Re-analyzing…</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SubmissionsTab({ submissions, onDelete, problemId, loading }) {
  const [viewingCode,   setViewingCode]   = useState(null)
  const [analyzingSub,  setAnalyzingSub]  = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const handleDeleteClick   = (sub) => setPendingDelete(sub)
  const handleCancelDelete  = ()    => setPendingDelete(null)
  const handleConfirmDelete = ()    => {
    if (pendingDelete) {
      onDelete(pendingDelete.id)
      setPendingDelete(null)
    }
  }

  if (analyzingSub) {
    return (
      <div className="flex flex-col h-full">
        <AnalysisView submission={analyzingSub} problemId={problemId} onBack={() => setAnalyzingSub(null)} />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center gap-3">
        <Loader2 size={22} className="text-orange-400 animate-spin" />
        <p className="text-[13px] font-medium text-gray-400">Loading submissions…</p>
      </div>
    )
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <Send size={28} className="text-gray-200 mb-3" />
        <p className="text-[13px] font-medium text-gray-400">No submissions yet</p>
        <p className="text-[12px] text-gray-300 mt-1">Submit your solution to see results here</p>
      </div>
    )
  }

  return (
    <div className="p-4">

      {}
      <DeleteConfirmModal
        submission={pendingDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {}
      {viewingCode && (
        <div className="mb-4 rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
            <span className="text-[12px] font-semibold text-gray-600">
              {viewingCode.language} · {viewingCode.verdict}
            </span>
            <button onClick={() => setViewingCode(null)}
              className="text-[11px] text-gray-400 hover:text-black px-2 py-1 rounded hover:bg-gray-200 transition-all">
              ✕ Close
            </button>
          </div>
          <div className="p-4 overflow-x-auto max-h-48">
            <pre className="text-[12px] font-mono text-black leading-relaxed whitespace-pre">
              {viewingCode.code}
            </pre>
          </div>
        </div>
      )}

      {}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-[30px_1fr_64px_100px_36px_36px] gap-1.5 px-3 py-2.5
          bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
          <span>#</span><span>Status</span><span>Lang</span>
          <span>Analysis</span><span className="text-center">Code</span><span className="text-center">Del</span>
        </div>

        {submissions.map((sub, i) => {
          const accepted = sub.verdict === 'Accepted'
          return (
            <div key={sub.id}>
              <div className="grid grid-cols-[30px_1fr_64px_100px_36px_36px] gap-1.5 px-3 py-3
                border-b border-gray-100 last:border-0 items-center hover:bg-gray-50 transition-colors">

                <span className="text-[11px] text-gray-400 font-mono">{i + 1}</span>

                <div>
                  <div className="text-[12px] font-bold leading-tight" style={{ color: accepted ? '#16a34a' : '#dc2626' }}>
                    {sub.verdict}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{sub.date}</div>
                </div>

                <span className="px-1.5 py-1 rounded bg-gray-100 text-[10px] font-mono text-gray-600 text-center truncate">
                  {sub.language}
                </span>

                <div className="flex justify-start">
                  {accepted ? (
                    <button onClick={() => setAnalyzingSub(sub)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold
                        border border-orange-200 bg-orange-50 text-orange-600
                        hover:bg-orange-100 hover:border-orange-300 transition-all">
                      <Activity size={11} />
                      <span className="hidden sm:inline">Analysis</span>
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold
                        border border-dashed border-gray-200 text-gray-300 cursor-not-allowed select-none"
                      title="Analysis only available for accepted submissions">
                      <Activity size={11} className="opacity-30" />
                      <span className="hidden sm:inline tracking-widest">— —</span>
                    </span>
                  )}
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => setViewingCode(viewingCode?.id === sub.id ? null : sub)}
                    className={`p-1.5 rounded transition-all ${
                      viewingCode?.id === sub.id ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-black hover:bg-gray-200'
                    }`}
                    title="View code"
                  >
                    <Eye size={13} />
                  </button>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => handleDeleteClick(sub)}
                    className="p-1.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

              </div>
            </div>
          )
        })}
      </div>

      <p className="text-[11px] text-gray-400 mt-3 px-1">
        {submissions.length} submission{submissions.length > 1 ? 's' : ''}
      </p>
    </div>
  )
}

export default function ProblemDescription({
  problem,
  submissions,
  submissionsLoading = false,
  onDeleteSubmission,
}) {
  const [tab, setTab] = useState('description')

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-0.5 px-3 border-b border-gray-200 bg-white flex-shrink-0">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-3 text-[12px] font-semibold
              border-b-2 transition-all whitespace-nowrap ${
              tab === t.id ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            <t.icon size={13} />
            {t.label}
            {t.id === 'submissions' && submissions?.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">
                {submissions.length}
              </span>
            )}
            {t.id === 'submissions' && submissionsLoading && (
              <Loader2 size={10} className="ml-1 animate-spin text-orange-400" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'description' && <DescriptionTab problem={problem} />}
        {tab === 'submissions' && (
          <SubmissionsTab
            submissions={submissions}
            onDelete={onDeleteSubmission}
            problemId={problem?.id || problem?._id}
            loading={submissionsLoading}
          />
        )}
      </div>
    </div>
  )
}