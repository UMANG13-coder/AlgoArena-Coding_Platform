const submissionController = require('../controllers/submission.controller');
const Submission = require('../models/submission');
const Problem = require('../models/Problem');
const { STATUS_CODE } = require('../utils/constants');
const { submissionQueue } = require('../utils/queue');
const helper = require('../utils/helper');

jest.mock('../models/submission');
jest.mock('../models/Problem');
jest.mock('../utils/helper', () => ({
  encode: jest.fn(s => s),
  decode: jest.fn(s => s)
}));
jest.mock('../utils/queue', () => ({
  submissionQueue: {
    add: jest.fn().mockResolvedValue({ id: 'job1' })
  }
}));

const mockRequest = (data) => ({
  user: { id: 'user1', _id: 'user1' },
  body: {},
  params: {},
  query: {},
  ...data
});
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Submission Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('runCode', () => {
    it('should update existing non-submitted submission', async () => {
      const req = mockRequest({
        body: { problem_id: '60d0fe4f5311236168a109ca', language_id: 1, code: 'print(1)' }
      });
      const res = mockResponse();
      Problem.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ test_cases: [] })
      });
      const mockSub = { is_submitted: false, save: jest.fn(), _id: { toString: () => '1' } };
      Submission.findOne.mockResolvedValue(mockSub);
      await submissionController.runCode(req, res);
      expect(mockSub.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.CREATED);
    });

    it('should create new submission if none exists', async () => {
      const req = mockRequest({
        body: { problem_id: '60d0fe4f5311236168a109ca', language_id: 1, code: 'print(1)' }
      });
      const res = mockResponse();
      Problem.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ test_cases: [] })
      });
      Submission.findOne.mockResolvedValue(null);
      Submission.create.mockResolvedValue({ _id: { toString: () => '2' } });
      await submissionController.runCode(req, res);
      expect(Submission.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.CREATED);
    });

    it('should create new submission if existing is already submitted', async () => {
      const req = mockRequest({
        body: { problem_id: '60d0fe4f5311236168a109ca', language_id: 1, code: 'print(1)' }
      });
      const res = mockResponse();
      Problem.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ test_cases: [] })
      });
      Submission.findOne.mockResolvedValue({ is_submitted: true });
      Submission.create.mockResolvedValue({ _id: { toString: () => '3' } });
      await submissionController.runCode(req, res);
      expect(Submission.create).toHaveBeenCalled();
    });

    it('should handle custom input with no problem_id', async () => {
      const req = mockRequest({
        body: { language_id: 1, code: 'print(1)', input: 'test input' }
      });
      const res = mockResponse();
      Submission.create.mockResolvedValue({ _id: { toString: () => '4' } });
      await submissionController.runCode(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.CREATED);
    });

    it('should return 404 if problem not found', async () => {
      const req = mockRequest({
        body: { problem_id: '60d0fe4f5311236168a109ca', language_id: 1, code: 'print(1)' }
      });
      const res = mockResponse();
      Problem.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });
      await submissionController.runCode(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.NOT_FOUND);
    });

    it('should return validation error', async () => {
      const req = mockRequest({ body: {} });
      const res = mockResponse();
      await submissionController.runCode(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({
        body: { language_id: 1, code: 'print(1)', input: 'test' }
      });
      const res = mockResponse();
      Submission.create.mockRejectedValue(new Error('DB error'));
      await submissionController.runCode(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });
  });

  describe('addSubmission', () => {
    it('should use existingRun if available', async () => {
      const req = mockRequest({
        body: { problem_id: '60d0fe4f5311236168a109ca', language_id: 1, code: 'print(1)' }
      });
      const res = mockResponse();
      Problem.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ test_cases: [] }) });
      const mockRun = { save: jest.fn(), _id: { toString: () => '1' } };
      Submission.findOne.mockResolvedValue(mockRun);
      await submissionController.addSubmission(req, res);
      expect(mockRun.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.CREATED);
    });

    it('should create new submission if no existing run', async () => {
      const req = mockRequest({
        body: { problem_id: '60d0fe4f5311236168a109ca', language_id: 1, code: 'print(1)' }
      });
      const res = mockResponse();
      Problem.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ test_cases: [] }) });
      Submission.findOne.mockResolvedValue(null);
      Submission.create.mockResolvedValue({ _id: { toString: () => '2' } });
      await submissionController.addSubmission(req, res);
      expect(Submission.create).toHaveBeenCalled();
    });

    it('should return 404 if problem not found', async () => {
      const req = mockRequest({
        body: { problem_id: '60d0fe4f5311236168a109ca', language_id: 1, code: 'print(1)' }
      });
      const res = mockResponse();
      Problem.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
      await submissionController.addSubmission(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.NOT_FOUND);
    });

    it('should return validation error', async () => {
      const req = mockRequest({ body: {} });
      const res = mockResponse();
      await submissionController.addSubmission(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({
        body: { problem_id: '60d0fe4f5311236168a109ca', language_id: 1, code: 'print(1)' }
      });
      const res = mockResponse();
      Problem.findById.mockReturnValue({ select: jest.fn().mockRejectedValue(new Error('DB error')) });
      await submissionController.addSubmission(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });
  });

  describe('getSubmissions', () => {
    it('should return submissions successfully', async () => {
      const req = mockRequest({ query: { problemId: '1' } });
      const res = mockResponse();
      Submission.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      });
      await submissionController.getSubmissions(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SUCCESS);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({});
      const res = mockResponse();
      Submission.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockRejectedValue(new Error('DB error'))
      });
      await submissionController.getSubmissions(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.INTERNAL_SERVER_ERROR);
    });
  });

  describe('getSubmissionResult', () => {
    it('should return result successfully', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109cb' } });
      const res = mockResponse();
      Submission.findById.mockResolvedValue({ _id: '1' });
      await submissionController.getSubmissionResult(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SUCCESS);
    });

    it('should return 404 if not found', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109cb' } });
      const res = mockResponse();
      Submission.findById.mockResolvedValue(null);
      await submissionController.getSubmissionResult(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.NOT_FOUND);
    });

    it('should return validation error', async () => {
      const req = mockRequest({ params: {} });
      const res = mockResponse();
      await submissionController.getSubmissionResult(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109cb' } });
      const res = mockResponse();
      Submission.findById.mockRejectedValue(new Error('DB error'));
      await submissionController.getSubmissionResult(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.INTERNAL_SERVER_ERROR);
    });
  });

  describe('deleteSubmission', () => {
    it('should delete submission successfully', async () => {
      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();
      Submission.findOneAndDelete.mockResolvedValue({ _id: '1' });
      await submissionController.deleteSubmission(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SUCCESS);
    });

    it('should return 404 if not found', async () => {
      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();
      Submission.findOneAndDelete.mockResolvedValue(null);
      await submissionController.deleteSubmission(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.NOT_FOUND);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();
      Submission.findOneAndDelete.mockRejectedValue(new Error('DB error'));
      await submissionController.deleteSubmission(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.INTERNAL_SERVER_ERROR);
    });
  });
});
