

import { useRef, useState } from 'react'
import { Copy, Check, RotateCcw, ChevronDown, Code2 } from 'lucide-react'
import Editor from '@monaco-editor/react'
import toast from 'react-hot-toast'

const SOLARIZED_LIGHT = {
  base: 'vs',
  inherit: true,
  rules: [
    { background: 'FDF6E3', token: '' },
    { foreground: '93a1a1', token: 'comment' },
    { foreground: '93a1a1', token: 'punctuation.definition.comment' },
    { foreground: '93a1a1', token: 'string.comment' },
    { foreground: '2aa198', token: 'constant' },
    { foreground: '2aa198', token: 'entity.name.constant' },
    { foreground: '2aa198', token: 'variable.other.constant' },
    { foreground: '2aa198', token: 'variable.language' },
    { foreground: '268bd2', token: 'entity.name' },
    { foreground: '268bd2', token: 'entity.name.function' },
    { foreground: '268bd2', token: 'meta.function-call' },
    { foreground: 'b58900', token: 'variable.parameter.function' },
    { foreground: '2aa198', token: 'entity.name.tag' },
    { foreground: '859900', token: 'keyword' },
    { foreground: '859900', token: 'keyword.control' },
    { foreground: 'cb4b16', token: 'storage' },
    { foreground: 'cb4b16', token: 'storage.type' },
    { foreground: '657b83', token: 'storage.modifier.package' },
    { foreground: '657b83', token: 'storage.modifier.import' },
    { foreground: 'cb4b16', token: 'variable' },
    { foreground: 'cb4b16', token: 'variable.other' },
    { foreground: '2aa198', token: 'support' },
    { foreground: '2aa198', token: 'support.function' },
    { foreground: 'b58900', token: 'string' },
    { foreground: 'b58900', token: 'string.quoted' },
    { foreground: '2aa198', token: 'constant.numeric' },
    { foreground: '2aa198', token: 'constant.language' },
    { foreground: '6c71c4', token: 'constant.character' },
    { foreground: 'dc322f', token: 'invalid.broken' },
    { foreground: 'dc322f', token: 'invalid.deprecated' },
    { foreground: 'dc322f', token: 'invalid.illegal' },
  ],
  colors: {
    'editor.foreground':              '#657B83',
    'editor.background':              '#FDF6E3',
    'editor.selectionBackground':     '#EEE8D5',
    'editor.lineHighlightBackground': '#EEE8D580',
    'editorCursor.foreground':        '#586E75',
    'editorWhitespace.foreground':    '#D3C9A8',
    'editorIndentGuide.background':   '#EEE8D5',
    'editorLineNumber.foreground':    '#93A1A1',
    'editorLineNumber.activeForeground': '#657B83',
  },
}

export const LANGUAGES = ['C', 'C++', 'Java', 'Python']

const EXT = { C: 'c', 'C++': 'cpp', Java: 'java', Python: 'py' }

const MONACO_LANG = { C: 'c', 'C++': 'cpp', Java: 'java', Python: 'python' }

const LANG_COLOR = {
  C:      '#268bd2',
  'C++':  '#cb4b16',
  Java:   '#b58900',
  Python: '#2aa198',
}

function LanguageDropdown({ language, onLanguageChange }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false) }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all text-[12px] font-semibold font-mono"
        style={{
          background:  open ? '#d3c9a8' : '#eee8d5',
          color:       '#657b83',
          border:      `1px solid ${open ? '#c8bca8' : 'transparent'}`,
          minWidth:    '90px',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = '#ddd6c4' }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = '#eee8d5' }}
      >
        {}
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: LANG_COLOR[language] || '#93a1a1' }}
        />
        <Code2 size={11} className="flex-shrink-0 opacity-60" />
        <span className="flex-1">{language}</span>
        <ChevronDown
          size={11}
          className="flex-shrink-0 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-50 rounded-xl overflow-hidden shadow-lg"
          style={{
            background: '#fdf6e3',
            border:     '1px solid #d3c9a8',
            minWidth:   '120px',
          }}
        >
          {LANGUAGES.map((lang, i) => {
            const isSelected = lang === language
            return (
              <button
                key={lang}
                tabIndex={0}
                onClick={() => { onLanguageChange(lang); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12px] font-mono font-medium transition-colors"
                style={{
                  background:  isSelected ? '#eee8d5' : 'transparent',
                  color:       isSelected ? '#073642' : '#657b83',
                  borderBottom: i < LANGUAGES.length - 1 ? '1px solid #eee8d5' : 'none',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f5f0e0' }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: LANG_COLOR[lang] || '#93a1a1' }}
                />
                {lang}
                {isSelected && (
                  <span className="ml-auto text-[10px]" style={{ color: '#93a1a1' }}>✓</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function SimpleEditor({
  code,
  onChange,
  language,
  onLanguageChange,
  starterCode,
}) {
  const editorRef           = useRef(null)
  const [copied, setCopied] = useState(false)

  const handleBeforeMount = (monaco) => {
    monaco.editor.defineTheme('solarized-light', SOLARIZED_LIGHT)
  }

  const handleEditorMount = (editor) => {
    editorRef.current = editor
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Code copied!')
  }

  const handleReset = () => {
    const starter = typeof starterCode === 'object'
      ? (starterCode[language] || '')
      : (starterCode || '')
    onChange(starter)
    toast.success('Reset to starter code')
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#fdf6e3' }}>

      {}
      <div
        className="flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{ background: '#eee8d5', borderBottom: '1px solid #d3c9a8' }}
      >
        {}
        <LanguageDropdown language={language} onLanguageChange={onLanguageChange} />

        {}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono" style={{ color: '#93a1a1' }}>
            solution.{EXT[language]}
          </span>
          <div className="w-px h-3.5" style={{ background: '#d3c9a8' }} />

          {}
          <button
            onClick={handleCopy}
            title="Copy code"
            className="p-1.5 rounded transition-all"
            style={{ color: '#657b83' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#073642'; e.currentTarget.style.background = '#d3c9a8' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#657b83'; e.currentTarget.style.background = 'transparent' }}
          >
            {copied
              ? <Check  size={13} style={{ color: '#2aa198' }} />
              : <Copy   size={13} />
            }
          </button>

          {}
          <button
            onClick={handleReset}
            title="Reset to starter code"
            className="p-1.5 rounded transition-all"
            style={{ color: '#657b83' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#073642'; e.currentTarget.style.background = '#d3c9a8' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#657b83'; e.currentTarget.style.background = 'transparent' }}
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={MONACO_LANG[language] || 'plaintext'}
          value={code}
          onChange={(val) => onChange(val ?? '')}
          beforeMount={handleBeforeMount}
          onMount={handleEditorMount}
          theme="solarized-light"
          options={{
            fontSize:             13,
            fontFamily:           "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
            fontLigatures:        true,
            lineHeight:           22,
            minimap:              { enabled: false },
            scrollBeyondLastLine: false,
            renderLineHighlight:  'line',
            tabSize:              4,
            insertSpaces:         true,
            wordWrap:             'off',
            automaticLayout:      true,
            padding:              { top: 12, bottom: 12 },
            cursorStyle:          'line',
            cursorBlinking:       'smooth',
            smoothScrolling:      true,
            scrollbar: {
              verticalScrollbarSize:   5,
              horizontalScrollbarSize: 5,
            },
            overviewRulerLanes:            0,
            hideCursorInOverviewRuler:     true,
            overviewRulerBorder:           false,
            bracketPairColorization:       { enabled: true },
          }}
        />
      </div>
    </div>
  )
}