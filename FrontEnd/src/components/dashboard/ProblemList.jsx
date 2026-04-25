import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, CheckCircle, BookOpen } from 'lucide-react'
import { useAppSelector } from '../../hooks/redux'
import { selectModules } from '../../store/slices/modulesSlice'

const DIFF = {
  Easy:   { text: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  Medium: { text: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  Hard:   { text: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
}

function DiffBadge({ d }) {
  const c = DIFF[d] || DIFF.Easy
  return (
    <span
      className="px-2 py-0.5 rounded text-[11px] font-semibold"
      style={{ color: c.text, background: c.bg, border: `1px solid ${c.border}` }}
    >
      {d}
    </span>
  )
}

function ProblemRow({ problem }) {
  const nav = useNavigate()
  const id  = problem._id || problem.id
  const isSolved = problem.isSolved === true
  return (
    <button
      onClick={() => nav(`/problem/${id}`)}
      className="w-full flex items-center justify-between px-8 py-2.5 border-b border-gray-100
        last:border-0 hover:bg-orange-50/50 transition-colors text-left group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
          isSolved
            ? 'bg-green-50 border-green-300'
            : 'border-gray-300 group-hover:border-orange-300'
        }`}>
          {isSolved && <CheckCircle size={9} className="text-green-600" />}
        </div>
        <span className={`text-[13px] font-medium truncate transition-colors ${
          isSolved ? 'text-gray-400 line-through' : 'text-black group-hover:text-orange-600'
        }`}>
          {problem.title}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <DiffBadge d={problem.difficulty} />
        <ChevronRight size={13} className="text-gray-300 group-hover:text-orange-400 transition-colors" />
      </div>
    </button>
  )
}

function LessonFolder({ lesson, search }) {
  const [open, setOpen] = useState(false)
  const problems = lesson.problems || []

  const filtered = search
    ? problems.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()))
    : problems

  if (search && filtered.length === 0) return null

  const solvedCount = problems.filter(p => p.isSolved === true).length

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-50/80
          hover:bg-gray-100 transition-colors text-left"
      >
        <BookOpen size={12} className="text-gray-400 flex-shrink-0" />
        <span className="text-[12px] font-semibold text-gray-600 flex-1 truncate">
          {lesson.title}
        </span>
        <span className="text-[11px] text-gray-400 flex-shrink-0">
          {solvedCount}/{problems.length} solved
        </span>
        <ChevronRight
          size={12}
          className="text-gray-400 transition-transform flex-shrink-0"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)' }}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            {filtered.length === 0 ? (
              <p className="px-8 py-2 text-[12px] text-gray-400 italic">
                No problems in this lesson.
              </p>
            ) : (
              filtered.map(p => (
                <ProblemRow
                  key={p._id || p.id}
                  problem={p}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ModuleFolder({ module, search }) {
  const [open, setOpen] = useState(false)
  const lessons     = module.lessons || []
  const allProblems = lessons.flatMap(l => l.problems || [])

  const solvedCount = allProblems.filter(p => p.isSolved === true).length
  const total       = allProblems.length
  const pct         = total ? Math.round((solvedCount / total) * 100) : 0

  const anyMatch = search
    ? allProblems.some(p => p.title?.toLowerCase().includes(search.toLowerCase()))
    : true
  if (search && !anyMatch) return null

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden mb-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-white
          hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-semibold text-black">{module.title}</span>
          <span className="text-[12px] text-gray-400">{solvedCount}/{total} solved</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden hidden sm:block">
            <div
              className="h-full rounded-full bg-orange-400 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <ChevronRight
            size={15}
            className="text-gray-400 transition-transform"
            style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)' }}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-100"
          >
            {lessons.length === 0 ? (
              <p className="px-4 py-3 text-[13px] text-gray-400 italic">
                No lessons in this module yet.
              </p>
            ) : (
              lessons.map(lesson => (
                <LessonFolder
                  key={lesson._id || lesson.id}
                  lesson={lesson}
                  search={search}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ProblemList({ search }) {
  const modules = useAppSelector(selectModules)

  if (modules.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 text-[14px]">
        No modules found. Add some modules to get started.
      </div>
    )
  }

  return (
    <div>
      {modules.map(mod => (
        <ModuleFolder
          key={mod._id || mod.id}
          module={mod}
          search={search}
        />
      ))}
    </div>
  )
}