
require('dotenv').config();
const { Worker }     = require('bullmq');
const axios          = require('axios');
const { connection } = require('../utils/queue');
const submission     = require('../models/submission');
const Progress       = require('../models/Progress');
const Problem        = require('../models/Problem');
const Lesson         = require('../models/Lesson');
const dbconnection   = require('../db');

(async () => { await dbconnection(); })();

const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com";
const headers = {
  'x-rapidapi-key':  process.env.JUDGE0_KEY,
  'x-rapidapi-host': process.env.JUDGE0_HOST,
  'Content-Type':    'application/json'
};

const encode    = (str) => (str != null ? Buffer.from(str).toString('base64') : undefined);
const decode    = (str) => (str        ? Buffer.from(str, 'base64').toString() : null);
const normalize = (s)   => (s ?? '').trim().replace(/\r\n/g, '\n');

async function sendBatch(payload) {
  const res = await axios.post(
    `${JUDGE0_URL}/submissions/batch?base64_encoded=true`,
    { submissions: payload },
    { headers }
  );
  return res.data.map(t => t.token);
}

async function pollBatch(tokens) {
  const joined = tokens.join(',');
  while (true) {
    const res = await axios.get(
      `${JUDGE0_URL}/submissions/batch?tokens=${joined}&base64_encoded=true`,
      { headers }
    );
    const all = res.data.submissions;
    if (all.every(s => s.status.id >= 3)) return all;
    await new Promise(r => setTimeout(r, 1500));
  }
}

function buildPayload(source_code, language_id, test_cases) {
  return test_cases.map(tc => ({
    source_code: encode(source_code),
    language_id,
    stdin:       encode(tc.input ?? '')
  }));
}

function shapeResult(r, tc) {
  const actualOutput   = decode(r.stdout);
  const expectedOutput = tc.expected_output ?? null;

  const ranSuccessfully = r.status.id === 3;
  const outputMatches   = normalize(actualOutput) === normalize(expectedOutput);

  const passed = expectedOutput === null
    ? ranSuccessfully
    : ranSuccessfully && outputMatches;

  return {
    input:           tc.input,
    expected_output: expectedOutput,
    actual_output:   actualOutput,
    compile_output:  decode(r.compile_output) || null,
    stderr:          decode(r.stderr) || null,
    status:          passed ? 'Accepted' : r.status.description,
    passed,
    runtime_ms:      r.time   ?? null,
    memory_kb:       r.memory ?? null
  };
}

function deriveStatus(results, shaped) {
  if (results.some(r => r.status.id === 6))                              return 'CompilationError';
  if (results.some(r => [7, 8, 9, 10, 11, 12].includes(r.status.id)))   return 'RunTimeError';
  if (results.some(r => r.status.id === 5))                              return 'Failed';  
  return shaped.every(r => r.passed) ? 'Completed' : 'Failed';          
}

const worker = new Worker('submission-queue', async job => {
  const {
    source_code,
    language_id,
    test_cases,
    test_cases_hidden,
    submission_id,
    is_run
  } = job.data;

  console.log(`Processing job [${job.name}] id=${job.id}`);

  try {

    if (is_run) {

      const visibleResults = await pollBatch(
        await sendBatch(buildPayload(source_code, language_id, test_cases))
      );
      const shapedVisible = visibleResults.map((r, i) => shapeResult(r, test_cases[i]));

      let shapedHidden = [];
      if (test_cases_hidden?.length) {
        const hiddenResults = await pollBatch(
          await sendBatch(buildPayload(source_code, language_id, test_cases_hidden))
        );
        shapedHidden = hiddenResults.map((r, i) => shapeResult(r, test_cases_hidden[i]));
      }

      const runStatus = deriveStatus(visibleResults, shapedVisible);

      if (submission_id) {
        const errorOutput = runStatus === 'CompilationError'
          ? (decode(visibleResults[0]?.compile_output) || decode(visibleResults[0]?.stderr) || null)
          : runStatus === 'RunTimeError'
            ? (decode(visibleResults.find(r => r.stderr)?.stderr) || null)
            : null;

        await submission.findByIdAndUpdate(submission_id, {
          status:              runStatus,
          runtime_ms:          Math.max(...visibleResults.map(r => r.time   || 0)),
          memory_kb:           Math.max(...visibleResults.map(r => r.memory || 0)),
          test_results:        shapedVisible,  
          test_results_hidden: shapedHidden,   
          ...(errorOutput && { error_output: errorOutput })

        });
        console.log(`✅ Run saved → submission ${submission_id} [${runStatus}]`);
      } else {
        console.log(`✅ Ghost run complete (no DB update) — job ${job.id}`);
      }

      return {
        shaped:      shapedVisible,
        runStatus,
        passedCount: shapedVisible.filter(r => r.passed).length,
        total:       shapedVisible.length
      };
    }

    const results = await pollBatch(
      await sendBatch(buildPayload(source_code, language_id, test_cases))
    );
    const shaped      = results.map((r, i) => shapeResult(r, test_cases[i]));
    const passedCount = shaped.filter(r => r.passed).length;
    const totalCount  = shaped.length;
    const finalStatus = deriveStatus(results, shaped);

    const errorOutput = finalStatus === 'CompilationError'
      ? (decode(results[0]?.compile_output) || decode(results[0]?.stderr) || null)
      : finalStatus === 'RunTimeError'
        ? (decode(results.find(r => r.stderr)?.stderr) || null)
        : null;

    const subDoc = await submission.findById(submission_id);
    subDoc.status       = finalStatus;
    subDoc.runtime_ms   = Math.max(...results.map(r => r.time   || 0));
    subDoc.memory_kb    = Math.max(...results.map(r => r.memory || 0));
    subDoc.passed_tests = passedCount;
    subDoc.total_tests  = totalCount;
    subDoc.test_results = shaped;
    if (errorOutput) subDoc.error_output = errorOutput;
    await subDoc.save();

    console.log(`✅ Submit ${submission_id}: ${finalStatus} (${passedCount}/${totalCount})`);
    return { finalStatus, passedCount, total: totalCount };

  } catch (err) {
    console.error(`❌ Job ${job.id} failed:`, err.response?.data || err.message);
    if (submission_id) {
      await submission.findByIdAndUpdate(submission_id, { status: 'Failed' });
    }
    throw err;
  }

}, { connection });

worker.on('completed', (job, result) => {
  console.log(`Job ${job.id} done:`, result);

});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed permanently:`, err.message);
});