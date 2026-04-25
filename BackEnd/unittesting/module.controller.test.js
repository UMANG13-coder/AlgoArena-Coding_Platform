const moduleController = require('../controllers/module.controller');
const Module = require('../models/Module');
const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const Problem = require('../models/Problem');
const { STATUS_CODE } = require('../utils/constants');

jest.mock('../models/Module');
jest.mock('../models/Progress');
jest.mock('../models/Lesson');
jest.mock('../models/Problem');

const mockRequest = (data) => ({
  query: {},
  params: {},
  body: {},
  user: { id: 'user1', _id: 'user1' },
  ...data
});
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Module Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createModule', () => {
    it('should create a new module successfully', async () => {
      const req = mockRequest({ 
        body: { title: 'Test', description: 'Desc', difficulty: 'Beginner' }
      });
      const res = mockResponse();
      const newModule = { _id: '1', title: 'Test' };
      Module.create.mockResolvedValue(newModule);
      await moduleController.createModule(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.CREATED);
    });

    it('should return validation error for bad input', async () => {
      const req = mockRequest({ body: { title: '' } });
      const res = mockResponse();
      await moduleController.createModule(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({ body: { title: 'Test' } });
      const res = mockResponse();
      Module.create.mockRejectedValue(new Error('DB Error'));
      await moduleController.createModule(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });
  });

  describe('editModule', () => {
    it('should update a module successfully', async () => {
      const req = mockRequest({ 
        params: { id: '60d0fe4f5311236168a109ca' },
        body: { title: 'Updated' }
      });
      const res = mockResponse();
      Module.findByIdAndUpdate.mockResolvedValue({ _id: '60d0fe4f5311236168a109ca', title: 'Updated' });
      await moduleController.editModule(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SUCCESS);
    });

    it('should return validation error for invalid id', async () => {
      const req = mockRequest({ params: { id: 'invalid' } });
      const res = mockResponse();
      await moduleController.editModule(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should return validation error for invalid body', async () => {
      const req = mockRequest({ 
        params: { id: '60d0fe4f5311236168a109ca' },
        body: { difficulty: 'Extreme' }
      });
      const res = mockResponse();
      await moduleController.editModule(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should return 404 if module not found', async () => {
      const req = mockRequest({ 
        params: { id: '60d0fe4f5311236168a109ca' },
        body: { title: 'Updated' }
      });
      const res = mockResponse();
      Module.findByIdAndUpdate.mockResolvedValue(null);
      await moduleController.editModule(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.NOT_FOUND);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({ 
        params: { id: '60d0fe4f5311236168a109ca' },
        body: { title: 'Updated' }
      });
      const res = mockResponse();
      Module.findByIdAndUpdate.mockRejectedValue(new Error('DB Error'));
      await moduleController.editModule(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });
  });

  describe('getAllModules', () => {
    it('should return all modules with enrichment', async () => {
      const req = mockRequest({ query: { page: 1, limit: 10 } });
      const res = mockResponse();
      const mockModules = [
        { 
          _id: 'mod1', 
          lessons: [
            { _id: 'less1', problems: [{ _id: 'prob1' }] }
          ] 
        }
      ];
      Module.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockModules)
      });
      Progress.findOne.mockResolvedValue({ 
        user_id: 'user1',
        solved_problems: ['prob1'],
        completed_lessons: ['less1'],
        completed_modules: ['mod1']
      });
      await moduleController.getAllModules(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SUCCESS);
    });

    it('should fail with validation error', async () => {
      const req = mockRequest({ query: { page: 'invalid' } });
      const res = mockResponse();
      await moduleController.getAllModules(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({});
      const res = mockResponse();
      Module.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockRejectedValue(new Error('DB Error'))
      });
      await moduleController.getAllModules(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });
  });

  describe('getModuleById', () => {
    it('should return a module', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109ca' } });
      const res = mockResponse();
      Module.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ title: 'M1' })
      });
      await moduleController.getModuleById(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SUCCESS);
    });

    it('should return 404 if not found', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109ca' } });
      const res = mockResponse();
      Module.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });
      await moduleController.getModuleById(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.NOT_FOUND);
    });

    it('should fail with validation error', async () => {
      const req = mockRequest({ params: { id: 'invalid' } });
      const res = mockResponse();
      await moduleController.getModuleById(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109ca' } });
      const res = mockResponse();
      Module.findById.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error('DB Error'))
      });
      await moduleController.getModuleById(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.INTERNAL_SERVER_ERROR);
    });
  });

  describe('deleteModule', () => {
    it('should delete a module successfully', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109ca' } });
      const res = mockResponse();
      Module.findByIdAndDelete.mockResolvedValue({ _id: '60d0fe4f5311236168a109ca' });
      Lesson.find.mockResolvedValue([{ _id: 'less1' }]);
      Problem.deleteMany.mockResolvedValue({});
      Lesson.deleteMany.mockResolvedValue({});
      await moduleController.deleteModule(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SUCCESS);
    });

    it('should return 404 if not found', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109ca' } });
      const res = mockResponse();
      Module.findByIdAndDelete.mockResolvedValue(null);
      await moduleController.deleteModule(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.NOT_FOUND);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109ca' } });
      const res = mockResponse();
      Module.findByIdAndDelete.mockRejectedValue(new Error('DB Error'));
      await moduleController.deleteModule(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.INTERNAL_SERVER_ERROR);
    });
  });
});
