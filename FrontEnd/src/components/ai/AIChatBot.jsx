

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, X, Send, Loader2, Bot, User,
  Minimize2, Maximize2, RotateCcw,
} from 'lucide-react'
import { aiApi } from '../../api/auth' 

function renderMsg(text) {
  if (!text || typeof text !== 'string') return null
  const lines = text.split('\n')
  return lines.map((line, li) => {
    if (line === '') return <div key={li} className="h-2" />
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    return (
      <div key={li} className="leading-relaxed">
        {parts.map((p, pi) => {
          if (p.startsWith('**') && p.endsWith('**'))
            return <strong key={pi} className="font-semibold text-black">{p.slice(2, -2)}</strong>
          if (p.startsWith('`') && p.endsWith('`'))
            return (
              <code key={pi}
                className="px-1 py-0.5 rounded bg-gray-100 text-orange-600 font-mono text-[11px]">
                {p.slice(1, -1)}
              </code>
            )
          return <span key={pi}>{p}</span>
        })}
      </div>
    )
  })
}

// ── Message bubble ────────────────────────────────────────────────────────────
function Bubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isUser ? 'bg-black' : 'bg-orange-100 border border-orange-200'
      }`}>
        {isUser
          ? <User size={12} className="text-white" />
          : <Bot  size={12} className="text-orange-500" />
        }
      </div>

      {/* Content */}
      <div className={`max-w-[82%] rounded-xl px-3 py-2.5 text-[13px] ${
        isUser
          ? 'bg-black text-white rounded-tr-sm'
          : 'bg-gray-50 border border-gray-200 text-gray-800 rounded-tl-sm'
      }`}>
        {isUser
          ? <p className="leading-relaxed">{msg.content}</p>
          : <div className="space-y-0.5 text-gray-700">{renderMsg(msg.content)}</div>
        }
      </div>
    </div>
  )
}

// ── Typing dots ───────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex gap-2">
      <div className="w-6 h-6 rounded-full bg-orange-100 border border-orange-200
        flex items-center justify-center flex-shrink-0">
        <Bot size={12} className="text-orange-500" />
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-xl rounded-tl-sm px-3 py-2.5">
        <div className="flex items-center gap-1">
          {[0, 150, 300].map(d => (
            <div key={d}
              className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
              style={{ animationDelay: `${d}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── AIChatBot (main export) ───────────────────────────────────────────────────
export default function AIChatBot({ problem, code, language }) {
  const [open,      setOpen]      = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [messages,  setMessages]  = useState([
    {
      role:    'assistant',
      content: `Hi! I'm your DSA mentor 🤖\n\nI can see you're working on **${problem?.title || 'this problem'}**. Ask me anything:\n- 💡 Hints without spoilers\n- 🐛 Debug help\n- 📚 Concept explanations\n- ⚡ Complexity analysis`,
    }
  ])
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  // Reset messages when problem changes
  useEffect(() => {
    setMessages([{
      role:    'assistant',
      content: `Hi! I'm your DSA mentor 🤖 \n I'm here to help you out. Ask me anything.`,
    }])
  }, [problem?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open && !minimized) setTimeout(() => inputRef.current?.focus(), 200)
  }, [open, minimized])

  const sendMessage = useCallback(async (text) => {
    const content = (text || input).trim()
    if (!content || loading) return
    setInput('')

    const userMsg = { role: 'user', content }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const { data } = await aiApi.chat(content)

      setMessages(prev => [...prev, {
        role:    'assistant',
        content: typeof data?.data === 'string' ? data.data : 'Sorry, I could not generate a response.',
      }])

    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Connection error. Please try again.'
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: `⚠️ ${errMsg}`,
      }])
    } finally {
      setLoading(false)
    }
  }, [input, loading])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const clearChat = () => {
    setMessages([{
      role:    'assistant',
      content: `Chat cleared. Ask me anything about DSA realated questions . \n I am  here to help you out.`,
    }])
  }

  return (
    <>
      {}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{   scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.07 }}
            whileTap={{  scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-2xl
              bg-black text-white flex items-center justify-center
              shadow-xl hover:shadow-2xl transition-shadow"
            title="AI Assistant"
          >
            <Sparkles size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      {}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 16, scale: 0.97  }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-5 right-5 z-50 flex flex-col rounded-2xl
              border border-gray-200 bg-white shadow-2xl overflow-hidden"
            style={{
              width:  380,
              height: minimized ? 'auto' : 520,
            }}
          >
            {}
            <div className="flex items-center gap-2.5 px-4 py-3
              border-b border-gray-100 bg-gray-50 flex-shrink-0">
              <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
                <Sparkles size={13} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-black leading-tight">DSA Mentor</p>
                <p className="text-[10px] text-gray-400 truncate">
                  {problem?.title || 'Code help'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  title="Clear chat"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-200 transition-all"
                >
                  <RotateCcw size={12} />
                </button>
                <button
                  onClick={() => setMinimized(m => !m)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-200 transition-all"
                >
                  {minimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            {!minimized && (
              <>
                {}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg, i) => <Bubble key={i} msg={msg} />)}
                  {loading && <TypingDots />}
                  <div ref={bottomRef} />
                </div>

                {}
                <div className="flex items-end gap-2 px-3 pb-3 pt-2
                  border-t border-gray-100 flex-shrink-0">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Ask about this problem…"
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-gray-200 bg-white
                      px-3 py-2.5 text-[13px] text-black placeholder-gray-400 outline-none
                      focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                    style={{ maxHeight: 80 }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    className="w-9 h-9 rounded-xl bg-black text-white flex items-center
                      justify-center disabled:opacity-40 disabled:cursor-not-allowed
                      hover:bg-gray-800 transition-all flex-shrink-0"
                  >
                    {loading
                      ? <Loader2 size={13} className="animate-spin" />
                      : <Send    size={13} />
                    }
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}