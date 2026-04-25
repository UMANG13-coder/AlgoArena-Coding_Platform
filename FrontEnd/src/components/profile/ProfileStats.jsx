import { useAppSelector } from '../../hooks/redux'
import {
  selectSolvedCount, selectTotalCount, selectPercentage,
  selectSolvedByDifficulty,
} from '../../store/slices/modulesSlice'

function DonutChart({ easy, medium, hard, total, solved }) {
  const r    = 52
  const cx   = 68
  const cy   = 68
  const circ = 2 * Math.PI * r

  const easyPct = total ? easy   / total : 0
  const medPct  = total ? medium / total : 0
  const hardPct = total ? hard   / total : 0

  const segments = [
    { pct: easyPct, color: '#16a34a', offset: 0 },
    { pct: medPct,  color: '#d97706', offset: easyPct },
    { pct: hardPct, color: '#dc2626', offset: easyPct + medPct },
  ]

  return (
    <div className="flex flex-col items-center">
      <svg width={136} height={136} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={13} />
        {total === 0 ? null : segments.map((seg, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={13}
            strokeDasharray={`${circ * seg.pct} ${circ * (1 - seg.pct)}`}
            strokeDashoffset={-circ * seg.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="mt-[-88px] mb-[52px] text-center pointer-events-none">
        <div className="text-2xl font-bold text-black leading-none">{solved}</div>
        <div className="text-[11px] text-gray-400 mt-0.5">/ {total}</div>
      </div>
      <div className="flex flex-col gap-1.5 mt-1 w-full">
        {[
          { label: 'Easy',   count: easy,   color: '#16a34a' },
          { label: 'Medium', count: medium, color: '#d97706' },
          { label: 'Hard',   count: hard,   color: '#dc2626' },
        ].map(d => (
          <div key={d.label} className="flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
              <span className="text-gray-500">{d.label}</span>
            </div>
            <span className="font-semibold text-black">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ProfileStats() {
  const solvedCount = useAppSelector(selectSolvedCount)
  const total       = useAppSelector(selectTotalCount)
  const percentage  = useAppSelector(selectPercentage)
  const { easy, medium, hard } = useAppSelector(selectSolvedByDifficulty)

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-[13px] font-bold text-black uppercase tracking-wide mb-4">
          DSA Progress
        </h3>
        <DonutChart
          easy={easy} medium={medium} hard={hard}
          total={total} solved={solvedCount}
        />
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-gray-500">Overall</span>
            <span className="font-bold text-black">{percentage}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-orange-500 transition-all duration-700"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
