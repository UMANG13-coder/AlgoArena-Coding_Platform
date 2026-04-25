const lessonController = require('../controllers/lesson.controller');
const Lesson = require('../models/Lesson');
const Module = require('../models/Module');
const Problem = require('../models/Problem');
const { STATUS_CODE } = require('../utils/constants');

jest.mock('../models/Lesson');
jest.mock('../models/Module');
jest.mock('../models/Problem');

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

describe('Lesson Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createLesson', () => {
    it('should create a lesson successfully', async () => {
      const req = mockRequest({
        body: { module_id: '60d0fe4f5311236168a109ca', title: 'Test Lesson' }
      });
      const res = mockResponse();
      const newLesson = { _id: '1', title: 'Test Lesson' };
      Lesson.create.mockResolvedValue(newLesson);
      Module.findByIdAndUpdate.mockResolvedValue({});
      await lessonController.createLesson(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.CREATED);
    });

    it('should fail with validation error', async () => {
      const req = mockRequest({ body: {} });
      const res = mockResponse();
      await lessonController.createLesson(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({ body: { module_id: '60d0fe4f5311236168a109ca', title: 'Test Lesson' } });
      const res = mockResponse();
      Lesson.create.mockRejectedValue(new Error('DB Error'));
      await lessonController.createLesson(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });
  });

  describe('getAllLessons', () => {
    it('should return all lessons', async () => {
      const req = mockRequest({ query: { page: 1, limit: 10 } });
      const res = mockResponse();
      Lesson.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([{ title: 'L1' }])
      });
      Lesson.countDocuments.mockResolvedValue(1);
      await lessonController.getAllLessons(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
    });

    it('should fail with validation error', async () => {
      const req = mockRequest({ query: { page: 'invalid' } });
      const res = mockResponse();
      await lessonController.getAllLessons(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({ query: { page: 1, limit: 10 } });
      const res = mockResponse();
      Lesson.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockRejectedValue(new Error('DB Error'))
      });
      await lessonController.getAllLessons(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });
  });

  describe('getLessonById', () => {
    it('should return a lesson', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109cb' } });
      const res = mockResponse();
      Lesson.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ title: 'L1' })
      });
      await lessonController.getLessonById(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
    });

    it('should return 404 if not found', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109cb' } });
      const res = mockResponse();
      Lesson.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });
      await lessonController.getLessonById(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.NOT_FOUND);
    });

    it('should fail with validation error', async () => {
      const req = mockRequest({ params: {} });
      const res = mockResponse();
      await lessonController.getLessonById(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109cb' } });
      const res = mockResponse();
      Lesson.findById.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error('DB Error'))
      });
      await lessonController.getLessonById(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });
  });

  describe('updateLesson', () => {
    it('should update a lesson successfully', async () => {
      const req = mockRequest({
        params: { id: '60d0fe4f5311236168a109cb' },
        body: { title: 'Updated' }
      });
      const res = mockResponse();
      Lesson.findById.mockResolvedValue({ _id: '60d0fe4f5311236168a109cb' });
      Lesson.findByIdAndUpdate.mockResolvedValue({ _id: '60d0fe4f5311236168a109cb', title: 'Updated' });
      await lessonController.updateLesson(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
    });

    it('should return 404 if not found', async () => {
      const req = mockRequest({
        params: { id: '60d0fe4f5311236168a109cb' },
        body: { title: 'Updated' }
      });
      const res = mockResponse();
      Lesson.findById.mockResolvedValue(null);
      await lessonController.updateLesson(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.NOT_FOUND);
    });

    it('should fail with validation error', async () => {
      const req = mockRequest({
        params: { id: '60d0fe4f5311236168a109cb' },
        body: { title: 123 }
      });
      const res = mockResponse();
      await lessonController.updateLesson(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({
        params: { id: '60d0fe4f5311236168a109cb' },
        body: { title: 'Updated' }
      });
      const res = mockResponse();
      Lesson.findById.mockRejectedValue(new Error('DB Error'));
      await lessonController.updateLesson(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.INTERNAL_SERVER_ERROR);
    });
  });

  describe('deleteLesson', () => {
    it('should delete a lesson successfully', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109cb' } });
      const res = mockResponse();
      Lesson.findByIdAndDelete.mockResolvedValue({ _id: '60d0fe4f5311236168a109cb', module_id: '60d0fe4f5311236168a109ca' });
      Module.findByIdAndUpdate.mockResolvedValue({});
      Problem.deleteMany.mockResolvedValue({});
      await lessonController.deleteLesson(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
    });

    it('should delete a lesson successfully with no module_id', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109cb' } });
      const res = mockResponse();
      Lesson.findByIdAndDelete.mockResolvedValue({ _id: '60d0fe4f5311236168a109cb' });
      Problem.deleteMany.mockResolvedValue({});
      await lessonController.deleteLesson(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
    });

    it('should return 404 if not found', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109cb' } });
      const res = mockResponse();
      Lesson.findByIdAndDelete.mockResolvedValue(null);
      await lessonController.deleteLesson(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.NOT_FOUND);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109cb' } });
      const res = mockResponse();
      Lesson.findByIdAndDelete.mockRejectedValue(new Error('DB Error'));
      await lessonController.deleteLesson(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.INTERNAL_SERVER_ERROR);
    });
  });
});
