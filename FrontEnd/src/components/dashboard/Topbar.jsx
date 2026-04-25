
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, User, ChevronDown, LayoutGrid } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { logoutUser, selectUser }         from '../../store/slices/authSlice'

function Logo() {
  const nav = useNavigate()
  return (
    <button
      onClick={() => nav('/dashboard')}
      className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
    >
      <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
        <span className="font-mono text-white text-[13px] font-medium" style={{ letterSpacing: '-0.5px' }}>
          &gt;_
        </span>
      </div>
      <span className="font-semibold text-[15px] text-black tracking-tight">
        Algo<span className="text-orange-500">Arena</span>
      </span>
    </button>
  )
}

function UserMenu({ user }) {
  const dispatch = useAppDispatch()
  const nav      = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const isAdminPage = location.pathname.startsWith('/admin')

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    setOpen(false)
    await dispatch(logoutUser())
    nav('/auth')
  }

  const initial = (user?.email || user?.name || 'U')[0].toUpperCase()
  const displayName = user?.name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-gray-200
          bg-white hover:bg-gray-50 transition-all"
      >
        {}
        {user?.profile_pic ? (
          <img
            src={user.profile_pic}
            alt={displayName}
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-orange-100 border border-orange-200
            flex items-center justify-center text-[11px] font-bold text-orange-600 flex-shrink-0">
            {initial}
          </div>
        )}
        <span className="text-[13px] font-medium text-black max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDown
          size={13}
          className="text-gray-400 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
        />
      </button>

      {}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{   opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-gray-200
              bg-white shadow-lg overflow-hidden z-50"
          >
            {}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-[13px] font-semibold text-black truncate">{displayName}</p>
              <p className="text-[11px] text-gray-400 truncate mt-0.5">{user?.email}</p>
            </div>

            {}
            <div className="p-1.5">
              {isAdminPage && (
                <button
                  onClick={() => { setOpen(false); nav('/dashboard') }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px]
                    text-gray-600 hover:bg-gray-50 hover:text-black transition-colors text-left"
                >
                  <LayoutGrid size={14} className="text-gray-400" />
                  User Dashboard
                </button>
              )}

              <button
                onClick={() => { setOpen(false); nav('/profile') }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px]
                  text-gray-600 hover:bg-gray-50 hover:text-black transition-colors text-left"
              >
                <User size={14} className="text-gray-400" />
                View Profile
              </button>

              {!isAdminPage && user?.role === 'admin' && (
                <>
                  <div className="my-1 h-px bg-gray-100" />
                  <button
                    onClick={() => { setOpen(false); nav('/admin') }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px]
                      text-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-colors text-left"
                  >
                    <User size={14} className="text-purple-500" />
                    Admin Dashboard
                  </button>
                </>
              )}

              <div className="my-1 h-px bg-gray-100" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px]
                  text-red-500 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

  export default function Topbar({ solvedCount, totalCount, percentage, hideProgress }) {
    const user = useAppSelector(selectUser)

    return (
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <Logo />

          {}
          {!hideProgress && (
            <div className="flex-1 max-w-xs hidden sm:block">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-gray-400">Progress</span>
                <span className="font-semibold text-black">{solvedCount}/{totalCount}</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          <UserMenu user={user} />
        </div>
    </header>
  )
}