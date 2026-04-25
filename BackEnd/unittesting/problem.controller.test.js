const problemController = require('../controllers/problem.controller');
const problem = require('../models/Problem');
const Lesson = require('../models/Lesson');
const { STATUS_CODE } = require('../utils/constants');

jest.mock('../models/Problem');
jest.mock('../models/Lesson');

const mockRequest = (data) => ({
  query: {},
  params: {},
  body: {},
  ...data
});
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Problem Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addProblem', () => {
    it('should add a problem successfully', async () => {
      const req = mockRequest({
        body: { 
          title: 'Test Prob', 
          lesson_id: '60d0fe4f5311236168a109ca', 
          description_md: 'desc', 
          difficulty: 'Easy' 
        }
      });
      const res = mockResponse();
      const newProb = { _id: '1', title: 'Test Prob' };
      problem.create.mockResolvedValue(newProb);
      Lesson.findByIdAndUpdate.mockResolvedValue({});
      await problemController.addProblem(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.CREATED);
    });

    it('should fail with validation error', async () => {
      const req = mockRequest({ body: {} });
      const res = mockResponse();
      await problemController.addProblem(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({
        body: { 
          title: 'Test Prob', 
          lesson_id: '60d0fe4f5311236168a109ca', 
          description_md: 'desc', 
          difficulty: 'Easy' 
        }
      });
      const res = mockResponse();
      problem.create.mockRejectedValue(new Error('DB Error'));
      await problemController.addProblem(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });
  });

  describe('updateProblem', () => {
    it('should update a problem successfully', async () => {
      const req = mockRequest({
        params: { id: '60d0fe4f5311236168a109cb' },
        body: { title: 'Updated Prob' }
      });
      const res = mockResponse();
      problem.findByIdAndUpdate.mockResolvedValue({ _id: '60d0fe4f5311236168a109cb', title: 'Updated Prob' });
      await problemController.updateProblem(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
    });

    it('should return 404 if not found', async () => {
      const req = mockRequest({
        params: { id: '60d0fe4f5311236168a109cb' },
        body: { title: 'Updated Prob' }
      });
      const res = mockResponse();
      problem.findByIdAndUpdate.mockResolvedValue(null);
      await problemController.updateProblem(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.NOT_FOUND);
    });

    it('should fail with validation error for invalid id', async () => {
      const req = mockRequest({ params: { id: 'invalid' } });
      const res = mockResponse();
      await problemController.updateProblem(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should fail with validation error for invalid body', async () => {
      const req = mockRequest({
        params: { id: '60d0fe4f5311236168a109cb' },
        body: { difficulty: 'Extreme' }
      });
      const res = mockResponse();
      await problemController.updateProblem(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({
        params: { id: '60d0fe4f5311236168a109cb' },
        body: { title: 'Updated Prob' }
      });
      const res = mockResponse();
      problem.findByIdAndUpdate.mockRejectedValue(new Error('DB Error'));
      await problemController.updateProblem(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });
  });

  describe('getAllProblems', () => {
    it('should return problems successfully', async () => {
      const req = mockRequest({ query: { page: 1, limit: 10 } });
      const res = mockResponse();
      problem.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ title: 'P1' }])
      });
      problem.countDocuments.mockResolvedValue(1);
      await problemController.getAllProblems(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
    });

    it('should fail with validation error', async () => {
      const req = mockRequest({ query: { page: 'invalid' } });
      const res = mockResponse();
      await problemController.getAllProblems(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({});
      const res = mockResponse();
      problem.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockRejectedValue(new Error('DB Error'))
      });
      await problemController.getAllProblems(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });
  });

  describe('getProblemById', () => {
    it('should return a problem by id', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109cb' } });
      const res = mockResponse();
      problem.findById.mockResolvedValue({ title: 'P1' });
      await problemController.getProblemById(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
    });

    it('should return 404 if not found', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109cb' } });
      const res = mockResponse();
      problem.findById.mockResolvedValue(null);
      await problemController.getProblemById(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.NOT_FOUND);
    });

    it('should fail with validation error', async () => {
      const req = mockRequest({ params: {} });
      const res = mockResponse();
      await problemController.getProblemById(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109cb' } });
      const res = mockResponse();
      problem.findById.mockRejectedValue(new Error('DB Error'));
      await problemController.getProblemById(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });
  });

  describe('deleteProblem', () => {
    it('should delete a problem successfully', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109cb' } });
      const res = mockResponse();
      problem.findByIdAndDelete.mockResolvedValue({ _id: '60d0fe4f5311236168a109cb', lesson_id: '60d0fe4f5311236168a109ca' });
      Lesson.findByIdAndUpdate.mockResolvedValue({});
      await problemController.deleteProblem(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
    });

    it('should delete a problem successfully with no lesson_id', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109cb' } });
      const res = mockResponse();
      problem.findByIdAndDelete.mockResolvedValue({ _id: '60d0fe4f5311236168a109cb' });
      await problemController.deleteProblem(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
    });

    it('should return 404 if not found', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109cb' } });
      const res = mockResponse();
      problem.findByIdAndDelete.mockResolvedValue(null);
      await problemController.deleteProblem(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.NOT_FOUND);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109cb' } });
      const res = mockResponse();
      problem.findByIdAndDelete.mockRejectedValue(new Error('DB Error'));
      await problemController.deleteProblem(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });
  });
});
