import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Code2, Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

import { useAppDispatch, useAppSelector } from '../hooks/redux'
import {
  loginUser, signupUser, loginWithGoogle,
  selectAuthLoading, clearError, setGoogleSession,
} from '../store/slices/authSlice'
import { Button, Divider, Input } from '../components/ui'

const slide = {
  initial:    { opacity: 0, x: 20  },
  animate:    { opacity: 1, x: 0   },
  exit:       { opacity: 0, x: -20 },
  transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

const BULLETS = [
  '8+ problems across 5 topic areas',
  'Monaco Editor with syntax highlighting',
  'Judge0-powered instant code execution',
  'Track your progress over time',
]

export default function AuthPage() {
  const nav      = useNavigate()
  const dispatch = useAppDispatch()
  const loading  = useAppSelector(selectAuthLoading)

  const [view,       setView]       = useState('login')
  const [showPass,   setShowPass]   = useState(false)
  const [loginForm,  setLoginForm]  = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' })
  const [errors,     setErrors]     = useState({})

  useEffect(() => {
    const params     = new URLSearchParams(window.location.search)
    const token      = params.get('token')
    const email      = params.get('email')
    const profilePic = params.get('profile_pic')
    const name       = params.get('name')
    const id         = params.get('id')
    const role       = params.get('role')
    const error      = params.get('error')

    if (error) {
      toast.error(`Google sign-in failed: ${decodeURIComponent(error)}`)
      window.history.replaceState({}, '', '/auth')
      return
    }

    if (token && email) {
      dispatch(setGoogleSession({
        token,
        email:       decodeURIComponent(email),
        profile_pic: decodeURIComponent(profilePic || ''),
        name:        decodeURIComponent(name || ''),
        id:          id || '',
        role:        role || 'user',
      }))
      toast.success('Signed in with Google!')
      nav('/dashboard')
    }
  }, [])

  useEffect(() => { dispatch(clearError()); setErrors({}) }, [view])

  const switchView = (v) => { setErrors({}); setShowPass(false); setView(v) }

  const handleLogin = async () => {
    const errs = {}
    if (!loginForm.email)    errs.email    = 'Email is required'
    if (!loginForm.password) errs.password = 'Password is required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    const res = await dispatch(loginUser(loginForm))
    if (loginUser.fulfilled.match(res)) { toast.success('Welcome back!'); nav('/dashboard') }
    else toast.error(res.payload || 'Login failed')
  }

  const handleGoogle = async () => {
    const res = await dispatch(loginWithGoogle())
    if (loginWithGoogle.rejected.match(res)) {
      toast.error(res.payload || 'Google sign-in failed')
    }
  }

  const handleSignup = async () => {
    const errs = {}
    if (!signupForm.name)               errs.name     = 'Name is required'
    if (!signupForm.email)              errs.email    = 'Email is required'
    if (signupForm.password.length < 6) errs.password = 'Minimum 6 characters'
    if (Object.keys(errs).length) { setErrors(errs); return }
    const res = await dispatch(signupUser(signupForm))
    if (signupUser.fulfilled.match(res)) { toast.success('Account created!'); nav('/dashboard') }
    else toast.error(res.payload || 'Signup failed')
  }

  return (
    <div className="min-h-screen bg-white flex">

      <div className="hidden lg:flex flex-col justify-between w-[400px] flex-shrink-0 bg-orange-50 border-r border-orange-200 p-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center">
            <Code2 size={18} className="text-white" />
          </div>
          <span className="font-black text-xl text-black">AlgoArena</span>
        </div>

        <div>
          <h2 className="font-black text-4xl text-black leading-tight mb-4">
            Level up your<br />
            <span className="text-gradient">coding skills</span>
          </h2>
          <p className="font-medium text-black text-sm leading-relaxed mb-8">
            Structured problems, real execution, instant feedback.
            The focused practice platform built for serious learners.
          </p>
          <div className="space-y-3">
            {BULLETS.map(t => (
              <div key={t} className="flex items-center gap-2.5 text-sm">
                <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                <span className="font-semibold text-black">{t}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs font-semibold text-black">© 2024 AlgoArena. All rights reserved.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">

            {view === 'login' && (
              <motion.div key="login" {...slide} className="space-y-6">
                <div>
                  <h1 className="font-black text-2xl text-black mb-1">Welcome back</h1>
                  <p className="text-sm font-medium text-black">Sign in to continue solving problems</p>
                </div>

                <button
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-sm font-semibold text-black transition-all"
                >
                  <GoogleIcon /> Continue with Google
                </button>

                <Divider label="or continue with email" />

                <div className="space-y-4">
                  <Input
                    label="Email" type="email" placeholder="you@example.com"
                    value={loginForm.email} error={errors.email}
                    onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                  />
                  <div className="relative">
                    <Input
                      label="Password" type={showPass ? 'text' : 'password'}
                      placeholder="••••••••" value={loginForm.password} error={errors.password}
                      onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    />
                    <button onClick={() => setShowPass(p => !p)}
                      className="absolute right-3 top-8 text-gray-400 hover:text-black">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <Button variant="primary" onClick={handleLogin} loading={loading} className="w-full glow-orange">
                  Sign In <ArrowRight size={15} />
                </Button>

                <p className="text-center text-sm font-medium text-black">
                  Don't have an account?{' '}
                  <button onClick={() => switchView('signup')} className="text-orange-600 hover:text-orange-700 font-bold">
                    Sign up free
                  </button>
                </p>
              </motion.div>
            )}

            {view === 'signup' && (
              <motion.div key="signup" {...slide} className="space-y-6">
                <div className="flex items-center gap-3">
                  <button onClick={() => switchView('login')} className="text-gray-400 hover:text-black transition-colors">
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <h1 className="font-black text-2xl text-black">Create account</h1>
                    <p className="text-sm font-medium text-black">Join AlgoArena and start solving</p>
                  </div>
                </div>

                <button
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-sm font-semibold text-black transition-all"
                >
                  <GoogleIcon /> Sign up with Google
                </button>

                <Divider label="or sign up with email" />

                <div className="space-y-4">
                  <Input
                    label="Full Name" type="text" placeholder="Your full name"
                    value={signupForm.name} error={errors.name}
                    onChange={e => setSignupForm(p => ({ ...p, name: e.target.value }))}
                  />
                  <Input
                    label="Email" type="email" placeholder="you@example.com"
                    value={signupForm.email} error={errors.email}
                    onChange={e => setSignupForm(p => ({ ...p, email: e.target.value }))}
                  />
                  <div className="relative">
                    <Input
                      label="Password" type={showPass ? 'text' : 'password'}
                      placeholder="Min. 6 characters" value={signupForm.password} error={errors.password}
                      onChange={e => setSignupForm(p => ({ ...p, password: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleSignup()}
                    />
                    <button onClick={() => setShowPass(p => !p)}
                      className="absolute right-3 top-8 text-gray-400 hover:text-black">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <Button variant="primary" onClick={handleSignup} loading={loading} className="w-full glow-orange">
                  Create Account <ArrowRight size={15} />
                </Button>

                <p className="text-center text-sm font-medium text-black">
                  Already have an account?{' '}
                  <button onClick={() => switchView('login')} className="text-orange-600 hover:text-orange-700 font-bold">
                    Sign in
                  </button>
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
