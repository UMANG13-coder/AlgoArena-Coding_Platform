import { useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { useAppSelector } from '../../hooks/redux'
import { selectAllProblemsFromModules } from '../../store/slices/modulesSlice'

const DIFF_COLOR = {
  Easy:   { text: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  Medium: { text: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  Hard:   { text: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
}

export default function RecentSolved() {
  const nav      = useNavigate()
  const problems = useAppSelector(selectAllProblemsFromModules)

  const solvedProblems = problems
    .filter(p => p.isSolved === true)
    .slice(-5)
    .reverse()

  if (solvedProblems.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-[13px] font-bold text-black uppercase tracking-wide mb-4">
          Recently Solved
        </h3>
        <div className="flex flex-col items-center py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <CheckCircle size={18} className="text-gray-300" />
          </div>
          <p className="text-[13px] font-medium text-gray-400">No problems solved yet</p>
          <button
            onClick={() => nav('/dashboard')}
            className="mt-3 text-[12px] text-orange-500 hover:text-orange-600 transition-colors"
          >
            Start solving →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-[13px] font-bold text-black uppercase tracking-wide">
          Recently Solved
        </h3>
        <button
          onClick={() => nav('/dashboard')}
          className="text-[11px] text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1"
        >
          All problems <ArrowRight size={11} />
        </button>
      </div>
      {solvedProblems.map((p, i) => {
        const c  = DIFF_COLOR[p.difficulty] || DIFF_COLOR.Easy
        const id = p._id || p.id
        return (
          <button
            key={id}
            onClick={() => nav(`/problem/${id}`)}
            className={`w-full flex items-center justify-between px-5 py-3 text-left
              hover:bg-orange-50/40 transition-colors
              ${i < solvedProblems.length - 1 ? 'border-b border-gray-100' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-green-50 border border-green-200
                flex items-center justify-center flex-shrink-0">
                <CheckCircle size={9} className="text-green-600" />
              </div>
              <span className="text-[13px] font-medium text-gray-500 line-through">{p.title}</span>
            </div>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded flex-shrink-0"
              style={{ color: c.text, background: c.bg, border: `1px solid ${c.border}` }}
            >
              {p.difficulty}
            </span>
          </button>
        )
      })}
    </div>
  )
}
