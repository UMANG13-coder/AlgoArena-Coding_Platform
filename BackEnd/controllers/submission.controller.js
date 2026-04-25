const Joi=require('joi');
const axios=require('axios');
const { submissionQueue } = require('../utils/queue');
const { sendErrorResponse, sendSuccessResponse } = require('../utils/response');
const { STATUS_CODE } = require('../utils/constants');
const submission=require('../models/submission');
const Problem=require('../models/Problem');
const {encode, decode} = require('../utils/helper');

async function runCode(req, res) {
  const schema = Joi.object({
    code:        Joi.string().required(),
    language_id: Joi.number().integer().min(1).required(),
    problem_id:  Joi.string().optional(),
    input:       Joi.string().optional().allow('')
  });

  const { error, value } = schema.validate(req.body);
  if (error) return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);

  try {
    let visibleTestCases = [];
    let hiddenTestCases  = [];

    if (value.problem_id) {
      const problem = await Problem.findById(value.problem_id).select('test_cases');
      if (!problem) return sendErrorResponse(res, {}, "Problem not found", STATUS_CODE.NOT_FOUND);

      visibleTestCases = problem.test_cases.filter(tc => tc.isHidden === false);
      hiddenTestCases  = problem.test_cases.filter(tc => tc.isHidden === true);

    } else if (value.input) {

      visibleTestCases = [{ input: value.input, expected_output: null }];
    }

    let submissionDoc  = null;
    let shouldUpdateDB = true;

    if (value.problem_id) {
      submissionDoc = await submission.findOne({
        user_id:    req.user.id,
        problem_id: value.problem_id
      });
    }

    if (!submissionDoc) {

      submissionDoc = await submission.create({
        user_id:      req.user.id,
        problem_id:   value.problem_id || undefined,
        language_id:  value.language_id,
        code:         encode(value.code),
        is_submitted: false,
        status:       'Pending'
      });

    } else if (!submissionDoc.is_submitted) {

      submissionDoc.code        = encode(value.code);
      submissionDoc.language_id = value.language_id;
      submissionDoc.status      = 'Pending';
      await submissionDoc.save();

    } else {

      submissionDoc = await submission.create({
        user_id:      req.user.id,
        problem_id:   value.problem_id || undefined,
        language_id:  value.language_id,
        code:         encode(value.code),
        is_submitted: false,
        status:       'Pending'
      });

    }

    const job = await submissionQueue.add('run-code', {
      source_code:       value.code,
      language_id:       value.language_id,
      test_cases:        visibleTestCases,
      test_cases_hidden: hiddenTestCases,
      submission_id:     shouldUpdateDB ? submissionDoc._id.toString() : null,
      is_run:            true
    });

    return sendSuccessResponse(
      res,
      {
        jobId:         job.id,
        submission_id: shouldUpdateDB ? submissionDoc._id : null,
        db_updated:    shouldUpdateDB
      },
      "Code queued for execution",
      STATUS_CODE.CREATED
    );

  } catch (err) {
    sendErrorResponse(res, {}, `Error: ${err.message}`, STATUS_CODE.INTERNAL_SERVER_ERROR);
  }
}

async function addSubmission(req, res) {
  const schema = Joi.object({
    code:        Joi.string().required(),
    language_id: Joi.number().integer().min(1).required(),
    problem_id:  Joi.string().required()
  });

  const { error, value } = schema.validate(req.body);
  if (error) return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);

  try {

    const problem = await Problem.findById(value.problem_id).select('test_cases');
    if (!problem) return sendErrorResponse(res, {}, "Problem not found", STATUS_CODE.NOT_FOUND);

    const allTestCases = problem.test_cases;

    let submissionDoc = null;

    const existingRun = await submission.findOne({
      user_id:      req.user.id,
      problem_id:   value.problem_id,
      is_submitted: false
    });

    if (existingRun) {

      existingRun.code                = encode(value.code);
      existingRun.language_id         = value.language_id;
      existingRun.is_submitted        = true;
      existingRun.status              = 'Pending';
      existingRun.submitted_at        = new Date();
      existingRun.test_results_hidden = [];   
      await existingRun.save();
      submissionDoc = existingRun;

    } else {

      submissionDoc = await submission.create({
        user_id:      req.user.id,
        problem_id:   value.problem_id,
        language_id:  value.language_id,
        code:         encode(value.code),
        is_submitted: true,
        status:       'Pending',
        submitted_at: new Date()
      });
    }

    const job = await submissionQueue.add('execute-submission', {
      source_code:   value.code,
      language_id:   value.language_id,
      submission_id: submissionDoc._id.toString(),
      test_cases:    allTestCases,
      is_run:        false
    });

    return sendSuccessResponse(
      res,
      { jobId: job.id, submission_id: submissionDoc._id },
      "Submission queued successfully",
      STATUS_CODE.CREATED
    );

  } catch (err) {
    sendErrorResponse(res, {}, `Error Adding Submission: ${err.message}`, STATUS_CODE.INTERNAL_SERVER_ERROR);
  }
}

module.exports = { runCode, addSubmission };

async function getSubmissions(req, res) {
    try {
        const { problemId } = req.query;

        const filter = { user_id: req.user.id };
        if (problemId) filter.problem_id = problemId;

        const submissions = await submission
            .find(filter)
            .sort({ submitted_at: -1 })
            .limit(50);

        return sendSuccessResponse(res, submissions, "Submissions retrieved successfully", STATUS_CODE.SUCCESS);
    } catch (err) {
        return sendErrorResponse(res, {}, `Error retrieving submissions: ${err.message}`, STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
}

async function getSubmissionResult(req, res) {
    const submissionIdSchema = Joi.object({
        id: Joi.string().required()
    });
    try{
        const {error, value} = submissionIdSchema.validate(req.params);

        if(error){
            return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
        }
        const submissionId = value.id;
        const submissionResult=await submission.findById(submissionId);
        if(!submissionResult){
            return sendErrorResponse(res, {}, "Submission not found", STATUS_CODE.NOT_FOUND);
        }
        return sendSuccessResponse(res, submissionResult, "Submission result retrieved successfully", STATUS_CODE.SUCCESS);
    }catch(err){
        return sendErrorResponse(res, {}, `Error retrieving submission result: ${err.message}`, STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
}

async function deleteSubmission(req, res) {
    try {
        const { id } = req.params;
        const result = await submission.findOneAndDelete({ _id: id, user_id: req.user.id });
        if (!result) {
            return sendErrorResponse(res, {}, "Submission not found", STATUS_CODE.NOT_FOUND);
        }
        return sendSuccessResponse(res, {}, "Submission deleted successfully", STATUS_CODE.SUCCESS);
    } catch (err) {
        return sendErrorResponse(res, {}, `Error deleting submission: ${err.message}`, STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    addSubmission,
    getSubmissions,
    getSubmissionResult,
    deleteSubmission,
    runCode
};