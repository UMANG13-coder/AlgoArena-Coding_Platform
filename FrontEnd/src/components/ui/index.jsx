
import { Loader2 } from 'lucide-react'

export function Button({
  children, onClick, variant = 'primary', size = 'md',
  disabled = false, loading = false, className = '', type = 'button', ...props
}) {
  const base  = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg cursor-pointer select-none border transition-all duration-150'
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  const variants = {
    primary:
      'bg-orange-500 hover:bg-orange-600 border-orange-500 hover:border-orange-600 text-white shadow-md active:scale-[0.98]',
    secondary:
      'bg-white hover:bg-orange-50 border-orange-400 text-black hover:border-orange-500',
    ghost:
      'bg-transparent hover:bg-gray-100 border-transparent text-black',
    danger:
      'bg-red-50 hover:bg-red-100 border-red-300 text-black',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  )
}

export function Divider({ label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-gray-200" />
      {label && <span className="text-xs font-medium text-black whitespace-nowrap">{label}</span>}
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  )
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-black">{label}</label>
      )}
      <input
        className={`w-full px-3.5 py-2.5 rounded-lg bg-white border text-sm text-black
          font-medium placeholder-gray-400 outline-none
          focus:border-orange-500 focus:ring-2 focus:ring-orange-200
          transition-all duration-150
          ${error ? 'border-red-400' : 'border-gray-300 hover:border-gray-400'}
          ${className}`}
        {...props}
      />
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </div>
  )
}

export function Badge({ children, color = '#f97316', className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${className}`}
      style={{ color: '#000000', background: `${color}20`, border: `1px solid ${color}40` }}
    >
      {children}
    </span>
  )
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Confirm', message = 'Are you sure?', confirmLabel = 'Delete', variant = 'danger' }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-[scaleIn_0.2s_ease-out]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ background: variant === 'danger' ? '#fef2f2' : '#f0fdf4', border: `2px solid ${variant === 'danger' ? '#fecaca' : '#bbf7d0'}` }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={variant === 'danger' ? '#dc2626' : '#16a34a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
          </div>
          <h3 className="text-lg font-bold text-black mb-1">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>
        <div className="flex border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors border-r border-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 px-4 py-3 text-sm font-bold transition-colors ${
              variant === 'danger'
                ? 'text-red-600 hover:bg-red-50'
                : 'text-green-600 hover:bg-green-50'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
