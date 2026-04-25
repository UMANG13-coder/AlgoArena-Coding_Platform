import { useRef, useState, useEffect } from 'react'

export default function OtpInput({ length = 6, onChange, error }) {
  const [values, setValues] = useState(Array(length).fill(''))
  const refs = useRef([])

  useEffect(() => { refs.current[0]?.focus() }, [])

  const handleChange = (idx, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...values]
    next[idx] = val
    setValues(next)
    onChange?.(next.join(''))
    if (val && idx < length - 1) refs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !values[idx] && idx > 0) refs.current[idx - 1]?.focus()
    if (e.key === 'ArrowLeft'  && idx > 0)               refs.current[idx - 1]?.focus()
    if (e.key === 'ArrowRight' && idx < length - 1)      refs.current[idx + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    const next = Array(length).fill('')
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setValues(next)
    onChange?.(next.join(''))
    refs.current[Math.min(pasted.length, length - 1)]?.focus()
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2.5 justify-center">
        {values.map((val, idx) => (
          <input
            key={idx}
            ref={el => refs.current[idx] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={val}
            onChange={e  => handleChange(idx, e)}
            onKeyDown={e => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            className={`w-11 text-center text-lg font-bold rounded-lg border outline-none bg-white
              text-black transition-all duration-150 focus:scale-105
              ${error
                ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                : val
                  ? 'border-orange-500 focus:ring-2 focus:ring-orange-200'
                  : 'border-gray-300 hover:border-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
              }`}
            style={{ height: '52px', fontFamily: 'JetBrains Mono, monospace' }}
          />
        ))}
      </div>
      {error && <p className="text-center text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}
