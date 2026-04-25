
import { useState } from 'react'
import { submissionApi } from '../api/auth'

const LANG_ID = { C: 50, 'C++': 54, Java: 62, Python: 71 }
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function pollUntilDone(submissionId) {
  for (let attempt = 0; attempt < 60; attempt++) {
    await sleep(2000)
    const res = await submissionApi.getById(submissionId)
    const sub = res?.data?.data ?? res?.data
    if (sub?.status && sub.status !== 'Pending') return sub
  }
  throw new Error('Polling timed out')
}

function statusToVerdict(status, passedCount, total) {
  if (status === 'Completed' && passedCount === total) return 'Accepted'
  if (status === 'CompilationError') return 'Compilation Error'
  if (status === 'RunTimeError')     return 'Runtime Error'
  if (status === 'Failed')           return 'Wrong Answer'
  return status || 'Wrong Answer'
}

export function useTestRunner() {
  const [running,      setRunning]      = useState(false)
  const [submitting,   setSubmitting]   = useState(false)
  const [runResults,   setRunResults]   = useState(null)   
  const [submitResult, setSubmitResult] = useState(null)   
  const [activeTab,    setActiveTab]    = useState('testcases')

  const run = async (code, language, problem) => {
    setRunning(true)
    setRunResults(null)
    setSubmitResult(null)
    setActiveTab('results')

    const langId = LANG_ID[language] || 71

    try {

      const res = await submissionApi.run({
        code,
        language_id: langId,
        problem_id:  problem?.id,
      })

      const submissionId =
        res?.data?.data?.submission_id ??
        res?.data?.submission_id

      if (!submissionId) throw new Error('No submission_id returned from server')

      const sub = await pollUntilDone(submissionId)

      const rawResults = Array.isArray(sub.test_results) ? sub.test_results : []

      const results = rawResults.map((tr) => ({
        input:    String(tr.input          ?? ''),
        expected: String(tr.expected_output ?? '').trim(),
        actual:   String(tr.actual_output  ?? '').trim(),
        passed:   !!tr.passed,
        time:     tr.runtime_ms != null ? `${tr.runtime_ms}ms` : null,
        status:   tr.status,
      }))

      const errorOutput = sub.error_output
        || rawResults.find(r => r.compile_output)?.compile_output
        || rawResults.find(r => r.stderr)?.stderr
        || null

      setRunResults({ results, submissionStatus: sub.status, errorOutput })
    } catch (err) {
      console.error('[useTestRunner] run error:', err)
      setRunResults({ results: [], submissionStatus: 'Failed', error: err.message })
    } finally {
      setRunning(false)
    }
  }

  const submit = async (code, language, problem) => {
    setSubmitting(true)
    setSubmitResult(null)
    setRunResults(null)
    setActiveTab('results')

    const langId = LANG_ID[language] || 71

    try {
      const res = await submissionApi.submit({
        code,
        language_id: langId,
        problem_id:  problem?.id,
      })

      const submissionId =
        res?.data?.data?.submission_id ??
        res?.data?.submission_id

      if (!submissionId) throw new Error('No submission_id returned from server')

      const sub = await pollUntilDone(submissionId)

      const testResults  = Array.isArray(sub.test_results) ? sub.test_results : []

      const passedCount  = sub.passed_tests ?? testResults.filter(r => r.passed).length
      const total        = sub.total_tests  ?? testResults.length
      const verdict      = statusToVerdict(sub.status, passedCount, total)

      const firstWrong   = testResults.find(r => !r.passed) ?? null

      const errorOutput = sub.error_output
        || testResults.find(r => r.compile_output)?.compile_output
        || testResults.find(r => r.stderr)?.stderr
        || null

      const result = {
        verdict,
        passed:     passedCount,
        total,
        status:     sub.status,
        runtime:    sub.runtime_ms != null ? `${sub.runtime_ms}ms` : '—',
        memory:     sub.memory_kb  != null ? `${sub.memory_kb} KB` : '—',
        firstWrong,        
        errorOutput,       
        isSubmission: true,
      }

      setSubmitResult(result)
      return result
    } catch (err) {
      console.error('[useTestRunner] submit error:', err)
      return null
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setRunResults(null)
    setSubmitResult(null)
    setActiveTab('testcases')
  }

  return {
    running, submitting,
    runResults, submitResult,
    activeTab, setActiveTab,
    run, submit, reset
  }
}