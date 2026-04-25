import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, User, Settings } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { selectUser }          from '../store/slices/authSlice'
import { loadUserProfile }     from '../store/slices/profileSlice'
import { fetchModules }        from '../store/slices/modulesSlice'
import ProfileCard             from '../components/profile/ProfileCard'
import ProfileStats            from '../components/profile/ProfileStats'
import EditProfileForm         from '../components/profile/EditProfileForm'
import RecentSolved            from '../components/profile/RecentSolved'

function ProfileTopbar({ activeTab, onTabChange }) {
  const nav = useNavigate()

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <button
          onClick={() => nav('/dashboard')}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
            <span className="font-mono text-white text-[13px]">&gt;_</span>
          </div>
          <span className="font-semibold text-[15px] text-black tracking-tight">
            Algo<span className="text-orange-500">Arena</span>
          </span>
        </button>

        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'view', label: 'Profile', icon: User     },
            { id: 'edit', label: 'Edit',    icon: Settings },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
                activeTab === t.id
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => nav('/dashboard')}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-500
            hover:text-black transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
        >
          <LayoutDashboard size={13} />
          Dashboard
        </button>
      </div>
    </header>
  )
}

export default function ProfilePage() {
  const dispatch   = useAppDispatch()
  const user       = useAppSelector(selectUser)
  const [tab, setTab] = useState('view')

  useEffect(() => {
    if (user?.id) {
      dispatch(loadUserProfile())
      dispatch(fetchModules())
    }
  }, [user?.id, dispatch])

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileTopbar activeTab={tab} onTabChange={setTab} />

      <main className="max-w-5xl mx-auto px-6 py-8">

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.3 }}
          className="mb-7"
        >
          <h1 className="text-xl font-bold text-black tracking-tight">
            {tab === 'edit' ? 'Edit Profile' : 'My Profile'}
          </h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {tab === 'edit'
              ? 'Update your personal information, links and coding profiles.'
              : 'Your progress, stats and coding journey.'}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {tab === 'view' && (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{   opacity: 0, y: -6  }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-[260px_1fr] gap-6"
            >
              <div className="space-y-5">
                <ProfileCard onEditClick={() => setTab('edit')} />
              </div>
              <div className="space-y-5">
                <ProfileStats />
                <RecentSolved />
              </div>
            </motion.div>
          )}

          {tab === 'edit' && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{   opacity: 0, y: -6  }}
              transition={{ duration: 0.25 }}
              className="max-w-2xl"
            >
              <EditProfileForm />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
