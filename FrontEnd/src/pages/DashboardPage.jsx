import { useState, useEffect } from 'react'
import { motion }              from 'framer-motion'
import { Trophy, BookOpen, BarChart2, Search } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../hooks/redux'
import { selectUser }          from '../store/slices/authSlice'
import {
  fetchModules, selectModulesLoading,
  selectSolvedCount, selectTotalCount, selectPercentage,
} from '../store/slices/modulesSlice'
import Topbar      from '../components/dashboard/Topbar'
import ProblemList from '../components/dashboard/ProblemList'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <div className="text-xl font-bold text-black leading-tight">{value}</div>
        <div className="text-[12px] font-medium text-gray-400 mt-0.5">{label}</div>
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const dispatch        = useAppDispatch()
  const user            = useAppSelector(selectUser)
  const solvedCount     = useAppSelector(selectSolvedCount)
  const totalCount      = useAppSelector(selectTotalCount)
  const percentage      = useAppSelector(selectPercentage)
  const problemsLoading = useAppSelector(selectModulesLoading)
  const [search, setSearch] = useState('')

  useEffect(() => {
    dispatch(fetchModules())
  }, [dispatch])

  const displayName = user?.name || user?.email?.split('@')[0] || 'there'
  const greeting    = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  const motivationText = solvedCount === 0
    ? 'Ready to start? Pick your first problem below.'
    : solvedCount === totalCount && totalCount > 0
    ? '🎉 You solved everything! Incredible work.'
    : `You've solved ${solvedCount} problem${solvedCount > 1 ? 's' : ''}. Keep the streak going!`

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar
        solvedCount={solvedCount}
        totalCount={totalCount}
        percentage={percentage}
      />

      <main className="max-w-5xl mx-auto px-6 py-8">

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-black tracking-tight mb-1">
            {greeting}, {displayName} 👋
          </h1>
          <p className="text-[14px] text-gray-500">{motivationText}</p>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard icon={Trophy}    label="Solved"   value={solvedCount}       color="#f97316" />
          <StatCard icon={BookOpen}  label="Total"    value={totalCount}        color="#6366f1" />
          <StatCard icon={BarChart2} label="Progress" value={`${percentage}%`}  color="#16a34a" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative mb-6"
        >
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white
              text-[14px] text-black placeholder-gray-400 outline-none
              focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400
                hover:text-black transition-colors text-[12px]"
            >
              ✕
            </button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {search && (
            <p className="text-[12px] text-gray-400 mb-3">
              Showing results for "<span className="text-black font-medium">{search}</span>"
            </p>
          )}
          {problemsLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-[14px]">
              Loading problems...
            </div>
          ) : (
            <ProblemList search={search} />
          )}
        </motion.div>

      </main>
    </div>
  )
}
