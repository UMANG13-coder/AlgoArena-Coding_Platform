process.env.SUPABASE_URL = 'http://test.com';
process.env.SUPABASE_SECRET_KEY = 'test_key';
process.env.GROK_API_KEY = 'test_key';

const aiSession = require('../models/AISession');
const submission = require('../models/submission');
const { STATUS_CODE } = require('../utils/constants');
const Groq = require('groq-sdk');
const { extractJSON } = require('../utils/helper');

jest.mock('../models/AISession');
jest.mock('../models/submission');
jest.mock('groq-sdk');
jest.mock('../utils/helper');

const aiController = require('../controllers/ai.controller');

const mockRequest = (data) => ({ 
  user: { id: '1' }, 
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

describe('AI Controller', () => {
  let mockGroq;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGroq = {
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    };
    Groq.mockImplementation(() => mockGroq);
  });

  describe('chatResponse', () => {
    it('should generate mentoring response', async () => {
      const req = mockRequest({ body: { prompt: 'hi' } });
      const res = mockResponse();
      mockGroq.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Hello!' } }]
      });
      await aiController.chatResponse(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SUCCESS);
    });

    it('should return validation error', async () => {
      const req = mockRequest({ body: {} });
      const res = mockResponse();
      await aiController.chatResponse(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle no response from Groq', async () => {
      const req = mockRequest({ body: { prompt: 'hi' } });
      const res = mockResponse();
      mockGroq.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: '' } }]
      });
      await aiController.chatResponse(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({ body: { prompt: 'hi' } });
      const res = mockResponse();
      mockGroq.chat.completions.create.mockRejectedValue(new Error('Groq error'));
      await aiController.chatResponse(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });
  });

  describe('analyzeCode', () => {
    it('should analyze code successfully', async () => {
      const req = mockRequest({ body: { submission_id: '60d0fe4f5311236168a109ca' } });
      const res = mockResponse();
      aiSession.findOne.mockResolvedValue(null);
      submission.findById.mockResolvedValue({ code: 'abc', language_id: 1 });
      mockGroq.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: '{"time_complexity": "O(1)"}' } }]
      });
      extractJSON.mockReturnValue({ time_complexity: 'O(1)' });
      aiSession.create.mockResolvedValue({ id: '1' });
      await aiController.analyzeCode(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SUCCESS);
    });

    it('should return existing analysis', async () => {
      const req = mockRequest({ body: { submission_id: '60d0fe4f5311236168a109ca' } });
      const res = mockResponse();
      aiSession.findOne.mockResolvedValue({ id: 'existing' });
      await aiController.analyzeCode(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SUCCESS);
    });

    it('should return validation error', async () => {
      const req = mockRequest({ body: {} });
      const res = mockResponse();
      await aiController.analyzeCode(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should return 404 if submission not found', async () => {
      const req = mockRequest({ body: { submission_id: '60d0fe4f5311236168a109ca' } });
      const res = mockResponse();
      aiSession.findOne.mockResolvedValue(null);
      submission.findById.mockResolvedValue(null);
      await aiController.analyzeCode(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.NOT_FOUND);
    });

    it('should return 400 if submission missing code/language', async () => {
      const req = mockRequest({ body: { submission_id: '60d0fe4f5311236168a109ca' } });
      const res = mockResponse();
      aiSession.findOne.mockResolvedValue(null);
      submission.findById.mockResolvedValue({ code: '' });
      await aiController.analyzeCode(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle no response from Groq', async () => {
      const req = mockRequest({ body: { submission_id: '60d0fe4f5311236168a109ca' } });
      const res = mockResponse();
      aiSession.findOne.mockResolvedValue(null);
      submission.findById.mockResolvedValue({ code: 'abc', language_id: 1 });
      mockGroq.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: '' } }]
      });
      await aiController.analyzeCode(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });

    it('should handle malformed JSON from Groq', async () => {
      const req = mockRequest({ body: { submission_id: '60d0fe4f5311236168a109ca' } });
      const res = mockResponse();
      aiSession.findOne.mockResolvedValue(null);
      submission.findById.mockResolvedValue({ code: 'abc', language_id: 1 });
      mockGroq.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'bad json' } }]
      });
      extractJSON.mockImplementation(() => { throw new Error('Parse error'); });
      await aiController.analyzeCode(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({ body: { submission_id: '60d0fe4f5311236168a109ca' } });
      const res = mockResponse();
      aiSession.findOne.mockRejectedValue(new Error('DB error'));
      await aiController.analyzeCode(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });
  });

  describe('generateProblem', () => {
    it('should generate problem successfully', async () => {
      const req = mockRequest({ body: { description: 'test problem description' } });
      const res = mockResponse();
      mockGroq.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: '{"title": "P1"}' } }]
      });
      extractJSON.mockReturnValue({ title: 'P1' });
      await aiController.generateProblem(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SUCCESS);
    });

    it('should generate problem with difficulty successfully', async () => {
      const req = mockRequest({ body: { description: 'test problem description', difficulty: 'Hard' } });
      const res = mockResponse();
      mockGroq.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: '{"title": "P1"}' } }]
      });
      extractJSON.mockReturnValue({ title: 'P1' });
      await aiController.generateProblem(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SUCCESS);
    });

    it('should return validation error', async () => {
      const req = mockRequest({ body: { description: 'short' } });
      const res = mockResponse();
      await aiController.generateProblem(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle no response from AI', async () => {
      const req = mockRequest({ body: { description: 'test problem description' } });
      const res = mockResponse();
      mockGroq.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: '' } }]
      });
      await aiController.generateProblem(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });

    it('should handle malformed JSON from AI', async () => {
      const req = mockRequest({ body: { description: 'test problem description' } });
      const res = mockResponse();
      mockGroq.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'bad json' } }]
      });
      extractJSON.mockImplementation(() => { throw new Error('Parse error'); });
      await aiController.generateProblem(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({ body: { description: 'test problem description' } });
      const res = mockResponse();
      mockGroq.chat.completions.create.mockRejectedValue(new Error('AI error'));
      await aiController.generateProblem(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });
  });
});
