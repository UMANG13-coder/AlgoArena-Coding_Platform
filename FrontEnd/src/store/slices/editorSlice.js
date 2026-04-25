

import { createSlice } from '@reduxjs/toolkit'

const editorSlice = createSlice({
  name: 'editor',
  initialState: {

    codeCache:    {},

    languageCache: {},

    running:      false,
    submitting:   false,
    runResults:   null,   
    submitResult: null,   
    activeTab:    'testcases', 
  },
  reducers: {

    setCode: (state, { payload: { problemId, language, code } }) => {
      if (!state.codeCache[problemId]) state.codeCache[problemId] = {}
      state.codeCache[problemId][language] = code
    },

    setLanguage: (state, { payload: { problemId, language } }) => {
      state.languageCache[problemId] = language
    },

    setRunning:    (state, { payload }) => { state.running    = payload },
    setSubmitting: (state, { payload }) => { state.submitting = payload },
    setRunResults: (state, { payload }) => {
      state.runResults = payload
      state.activeTab  = 'results'
    },
    setSubmitResult: (state, { payload }) => {
      state.submitResult = payload
      state.activeTab    = 'results'
    },
    setActiveTab: (state, { payload }) => { state.activeTab = payload },

    resetResults: (state) => {
      state.running      = false
      state.submitting   = false
      state.runResults   = null
      state.submitResult = null
      state.activeTab    = 'testcases'
    },
  },
})

export const {
  setCode, setLanguage,
  setRunning, setSubmitting,
  setRunResults, setSubmitResult,
  setActiveTab, resetResults,
} = editorSlice.actions

export const selectCode = (problemId, language) => (s) =>
  s.editor.codeCache[problemId]?.[language] ?? null

export const selectLanguage = (problemId) => (s) =>
  s.editor.languageCache[problemId] ?? 'C++'

export const selectRunning      = (s) => s.editor.running
export const selectSubmitting   = (s) => s.editor.submitting
export const selectRunResults   = (s) => s.editor.runResults
export const selectSubmitResult = (s) => s.editor.submitResult
export const selectActiveTab    = (s) => s.editor.activeTab

export default editorSlice.reducer