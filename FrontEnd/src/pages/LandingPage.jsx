import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code2, Zap, Trophy, ChevronRight, Terminal, GitBranch, Cpu, ArrowRight, LayoutDashboard } from 'lucide-react'
import { Button } from '../components/ui'
import { useAppSelector } from '../hooks/redux'
import { selectToken } from '../store/slices/authSlice'

const FEATURES = [
  { icon: Terminal,  title: 'In-Browser IDE',      desc: 'Monaco Editor with syntax highlighting and autocomplete — exactly like VS Code.',          color: '#f97316' },
  { icon: Zap,       title: 'Instant Execution',   desc: 'Judge0 engine runs your code in isolated sandboxes. Get output and runtime in real time.',  color: '#8b5cf6' },
  { icon: Trophy,    title: 'Track Progress',      desc: 'Solve problems, earn checkmarks, and watch your progress grow across every topic.',          color: '#22c55e' },
  { icon: GitBranch, title: 'Structured Topics',   desc: 'Problems organized as Topic → Subtopic → Problem. Never lose your place in the journey.',  color: '#f59e0b' },
  { icon: Cpu,       title: 'Hidden Test Cases',   desc: 'Sample cases on Run. Hidden edge cases on Submit. Mirrors real interview assessment.',      color: '#ec4899' },
  { icon: Code2,     title: 'Multi-Language',      desc: 'Write in C++, Python, Java, or JavaScript. Switch languages per problem anytime.',          color: '#06b6d4' },
]

const STATS = [
  { value: '8+',   label: 'Problems'    },
  { value: '4',    label: 'Languages'   },
  { value: '5',    label: 'Topic Areas' },
  { value: '100%', label: 'Free'        },
]

const STEPS = [
  { step: '01', title: 'Create an account', desc: 'Sign up in under 30 seconds with your email or Google.' },
  { step: '02', title: 'Pick a problem',    desc: 'Browse structured topics and pick a problem at your level.' },
  { step: '03', title: 'Code & submit',     desc: 'Write, run, and submit code directly in the browser IDE.' },
]

const up = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function LandingPage() {
  const nav       = useNavigate()
  const token     = useAppSelector(selectToken)
  const loggedIn  = Boolean(token)

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 flex items-center justify-between px-8 py-4">
        {}
        <button
          onClick={() => nav('/')}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
            <Code2 size={16} className="text-white" />
          </div>
          <span className="font-bold text-xl text-black tracking-tight">AlgoArena</span>
        </button>

        <div className="flex items-center gap-3">
          {loggedIn ? (

            <Button variant="primary" size="sm" onClick={() => nav('/dashboard')} className="glow-orange">
              <LayoutDashboard size={14} /> Go to Dashboard
            </Button>
          ) : (

            <>
              <Button variant="ghost" size="sm" onClick={() => nav('/auth')}>Sign In</Button>
              <Button variant="primary" size="sm" onClick={() => nav('/auth')} className="glow-orange">
                Get Started <ChevronRight size={14} />
              </Button>
            </>
          )}
        </div>
      </nav>

      {}
      <section className="max-w-5xl mx-auto px-8 pt-24 pb-20 text-center">

        <motion.div {...up(0.05)}>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border border-orange-300 text-black bg-orange-50 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Powered by Judge0 Self-Hosted Execution
          </span>
        </motion.div>

        <motion.h1
          {...up(0.1)}
          className="font-black text-5xl md:text-7xl text-black leading-[1.05] tracking-tight mb-6"
        >
          Master Coding
          <br />
          <span className="text-gradient">Problem by Problem</span>
        </motion.h1>

        <motion.p {...up(0.18)} className="text-black text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
          A structured coding platform with a real in-browser IDE, instant code execution,
          and progress tracking across every topic you need to crack.
        </motion.p>

        <motion.div {...up(0.24)} className="flex items-center justify-center gap-4 flex-wrap">
          <Button variant="primary" size="lg" onClick={() => nav(loggedIn ? '/dashboard' : '/auth')} className="glow-orange">
            {loggedIn ? <><LayoutDashboard size={16} /> Go to Dashboard</> : <>Start Solving Free <ArrowRight size={16} /></>}
          </Button>
          {!loggedIn && (
            <Button variant="secondary" size="lg" onClick={() => nav('/auth')}>
              Sign In
            </Button>
          )}
        </motion.div>

        {}
        <motion.div
          {...up(0.32)}
          className="flex items-center justify-center gap-12 mt-16 pt-10 border-t border-gray-200"
        >
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="font-black text-2xl text-black">{s.value}</div>
              <div className="text-sm font-semibold text-black mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {}
      <section className="max-w-6xl mx-auto px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="rounded-2xl border border-gray-200 overflow-hidden"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
        >
          {}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-b border-gray-200">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <div className="ml-3 h-5 rounded bg-gray-300 w-48" />
          </div>

          <div className="flex h-64 bg-white">
            {}
            <div className="w-48 border-r border-gray-200 p-3 space-y-1">
              {['Sorting', 'Arrays', 'Linked Lists', 'Graphs', 'DP'].map((f, i) => (
                <div key={f} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs font-semibold ${i === 0 ? 'bg-orange-100 text-black' : 'text-black hover:bg-gray-50'}`}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: i === 0 ? '#f97316' : '#d1d5db' }} />
                  {f}
                </div>
              ))}
            </div>

            {}
            <div className="flex-1 p-4 font-mono text-xs space-y-1.5 bg-gray-50">
              {[
                { line: 'class Solution {',                               color: '#1d4ed8' },
                { line: 'public:',                                        color: '#7c3aed' },
                { line: '    vector<int> selectionSort(vector<int>& n) {',color: '#000000' },
                { line: '        int n = nums.size();',                   color: '#000000' },
                { line: '        for (int i = 0; i < n-1; i++) {',       color: '#000000' },
                { line: '            int minIdx = i;',                    color: '#374151' },
                { line: '        }',                                      color: '#374151' },
                { line: '    }',                                          color: '#374151' },
                { line: '};',                                             color: '#1d4ed8' },
              ].map((l, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-gray-400 w-4 select-none">{i + 1}</span>
                  <span style={{ color: l.color, fontWeight: 500 }}>{l.line}</span>
                </div>
              ))}
            </div>

            {}
            <div className="w-56 border-l border-gray-200 p-3 bg-white">
              <div className="text-xs font-bold text-black mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" /> Test Cases
              </div>
              {['Case 1 ✓', 'Case 2 ✓'].map(c => (
                <div key={c} className="text-xs font-semibold text-black bg-green-50 border border-green-200 rounded px-2 py-1.5 mb-1.5">{c}</div>
              ))}
              <div className="mt-3 text-xs font-bold text-black bg-green-100 border border-green-300 rounded px-2 py-2 text-center">
                ✓ Accepted
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {}
      <section className="bg-gray-50 border-y border-gray-200 py-20">
        <div className="max-w-5xl mx-auto px-8">
          <motion.h2
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="font-black text-3xl text-black text-center mb-2"
          >
            Get started in 3 steps
          </motion.h2>
          <p className="font-semibold text-black text-center mb-12 text-sm">No setup. No config. Just open and code.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-100 border-2 border-orange-300 flex items-center justify-center mx-auto mb-4">
                  <span className="font-black text-black text-sm">{item.step}</span>
                </div>
                <h3 className="font-bold text-black mb-1.5">{item.title}</h3>
                <p className="text-sm font-medium text-black leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="max-w-6xl mx-auto px-8 py-24">
        <motion.h2
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="font-black text-3xl text-black text-center mb-3"
        >
          Everything you need to level up
        </motion.h2>
        <p className="font-semibold text-black text-center mb-12 text-sm">Built for focused, structured practice.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className="p-5 rounded-xl border border-gray-200 bg-white hover:border-orange-200 hover:shadow-md transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                style={{ background: `${f.color}18`, border: `1.5px solid ${f.color}40` }}>
                <f.icon size={18} style={{ color: f.color }} />
              </div>
              <h3 className="font-bold text-black mb-2">{f.title}</h3>
              <p className="text-sm font-medium text-black leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {}
      <section className="max-w-2xl mx-auto px-8 pb-24 text-center">
        <div className="p-10 rounded-2xl border-2 border-orange-200 bg-orange-50">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center mx-auto mb-5">
            <Code2 size={22} className="text-white" />
          </div>
          <h2 className="font-black text-3xl text-black mb-3">Ready to start?</h2>
          <p className="font-medium text-black mb-7 text-sm">Create a free account and solve your first problem in minutes.</p>
          <Button variant="primary" size="lg" onClick={() => nav('/auth')} className="glow-orange">
            Create Free Account <ArrowRight size={16} />
          </Button>
        </div>
      </section>

      {}
      <footer className="border-t border-gray-200 px-8 py-6 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-orange-500 flex items-center justify-center">
            <Code2 size={12} className="text-white" />
          </div>
          <span className="font-bold text-black text-sm">AlgoArena</span>
        </div>
        <span className="text-xs font-semibold text-black">Built for developers, by developers.</span>
      </footer>

    </div>
  )
}