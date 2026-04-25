process.env.SUPABASE_URL = 'http://test.com';
process.env.SUPABASE_SECRET_KEY = 'test_key';
const userController = require('../controllers/user.controller');
const userServices = require('../services/user.service');
const { STATUS_CODE } = require('../utils/constants');
const UserProfile = require('../models/UserProfile');
const User = require('../models/users');
const helper = require('../utils/helper');

jest.mock('../services/user.service');
jest.mock('../models/UserProfile');
jest.mock('../models/users');
jest.mock('../utils/helper');

const mockRequest = (data) => ({
  query: {},
  params: {},
  body: {},
  user: { id: '60d0fe4f5311236168a109ca', _id: '60d0fe4f5311236168a109ca' },
  ...data
});
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('User Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users successfully', async () => {
      const req = mockRequest({ query: { page: 1, limit: 10 } });
      const res = mockResponse();
      const mockUsers = { data: [{ id: '1', name: 'Test' }], pagination: { totalUsers: 1 } };
      userServices.getAllUsers.mockResolvedValue(mockUsers);
      await userController.getAllUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
    });

    it('should handle validation error', async () => {
      const req = mockRequest({ query: { page: -1 } });
      const res = mockResponse();
      await userController.getAllUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({});
      const res = mockResponse();
      userServices.getAllUsers.mockRejectedValue(new Error('DB Error'));
      await userController.getAllUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109ca' } });
      const res = mockResponse();
      userServices.fetchUserById.mockResolvedValue({ _id: '1', name: 'Test' });
      await userController.getUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SUCCESS);
    });

    it('should return 404 if user not found', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109ca' } });
      const res = mockResponse();
      userServices.fetchUserById.mockResolvedValue(null);
      await userController.getUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.NOT_FOUND);
    });

    it('should handle validation error', async () => {
      const req = mockRequest({ params: { id: 'invalid' } });
      const res = mockResponse();
      await userController.getUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109ca' } });
      const res = mockResponse();
      userServices.fetchUserById.mockRejectedValue(new Error('DB Error'));
      await userController.getUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });
  });

  describe('getUserProfile', () => {
    it('should return 401 if unauthorized', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109cb' } });
      const res = mockResponse();
      await userController.getUserProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.UNAUTHORIZED);
    });

    it('should return 404 if user not found', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109ca' } });
      const res = mockResponse();
      userServices.fetchUserById.mockResolvedValue(null);
      await userController.getUserProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.NOT_FOUND);
    });

    it('should return profile successfully', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109ca' } });
      const res = mockResponse();
      userServices.fetchUserById.mockResolvedValue({ _id: '1' });
      UserProfile.findOne.mockResolvedValue({ bio: 'hi' });
      await userController.getUserProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
    });

    it('should return empty profile successfully if not exists', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109ca' } });
      const res = mockResponse();
      userServices.fetchUserById.mockResolvedValue({ _id: '1' });
      UserProfile.findOne.mockResolvedValue(null);
      await userController.getUserProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
    });

    it('should handle validation error', async () => {
      const req = mockRequest({ params: { id: 'invalid' } });
      const res = mockResponse();
      await userController.getUserProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109ca' } });
      const res = mockResponse();
      userServices.fetchUserById.mockRejectedValue(new Error('DB Error'));
      await userController.getUserProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });
  });

  describe('deleteUser', () => {
    it('should delete user by id', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109ca' } });
      const res = mockResponse();
      userServices.deleteUser.mockResolvedValue({ data: { _id: '1' } });
      await userController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
    });

    it('should handle validation error', async () => {
      const req = mockRequest({ params: { id: 'invalid' } });
      const res = mockResponse();
      await userController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109ca' } });
      const res = mockResponse();
      userServices.deleteUser.mockRejectedValue(new Error('DB Error'));
      await userController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });
  });

  describe('editUser', () => {
    it('should edit user successfully', async () => {
      const req = mockRequest({ params: { id: '1' }, body: { name: 'New' } });
      const res = mockResponse();
      userServices.fetchUserById.mockResolvedValue({ _id: '1' });
      userServices.updateUser.mockResolvedValue({ data: { _id: '1', name: 'New' } });
      await userController.editUser(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SUCCESS);
    });

    it('should return 404 if user not found', async () => {
      const req = mockRequest({ params: { id: '1' }, body: { name: 'New' } });
      const res = mockResponse();
      userServices.fetchUserById.mockResolvedValue(null);
      await userController.editUser(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.NOT_FOUND);
    });

    it('should return validation error', async () => {
      const req = mockRequest({ body: { email: 'invalid' } });
      const res = mockResponse();
      await userController.editUser(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({ params: { id: '1' }, body: { name: 'New' } });
      const res = mockResponse();
      userServices.fetchUserById.mockRejectedValue(new Error('DB Error'));
      await userController.editUser(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });
  });

  describe('editUserProfile', () => {
    it('should update existing profile', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109ca' }, body: { bio: 'new bio' } });
      const res = mockResponse();
      const mockProfile = { save: jest.fn() };
      UserProfile.findOne.mockResolvedValue(mockProfile);
      await userController.editUserProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
      expect(mockProfile.save).toHaveBeenCalled();
    });

    it('should create new profile if not exists', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109ca' }, body: { bio: 'new bio' } });
      const res = mockResponse();
      UserProfile.findOne.mockResolvedValue(null);
      UserProfile.prototype.save = jest.fn();
      await userController.editUserProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
    });

    it('should return 401 if unauthorized', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109cb' }, body: { bio: 'new bio' } });
      const res = mockResponse();
      await userController.editUserProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.UNAUTHORIZED);
    });

    it('should handle validation error in params', async () => {
      const req = mockRequest({ params: { id: 'invalid' } });
      const res = mockResponse();
      await userController.editUserProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle validation error in body', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109ca' }, body: { grad_year: 1800 } });
      const res = mockResponse();
      await userController.editUserProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109ca' } });
      const res = mockResponse();
      UserProfile.findOne.mockRejectedValue(new Error('DB Error'));
      await userController.editUserProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.INTERNAL_SERVER_ERROR);
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar successfully', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109ca' }, file: { buffer: Buffer.from('') } });
      const res = mockResponse();
      helper.uploadImage.mockResolvedValue({ status: 'success', data: 'http://pic.url' });
      const mockUser = { save: jest.fn() };
      User.findById.mockResolvedValue(mockUser);
      await userController.uploadAvatar(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should return 401 if unauthorized', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109cb' } });
      const res = mockResponse();
      await userController.uploadAvatar(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.UNAUTHORIZED);
    });

    it('should return 400 if no file provided', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109ca' } });
      const res = mockResponse();
      await userController.uploadAvatar(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.BAD_REQUEST);
    });

    it('should handle upload error', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109ca' }, file: { buffer: Buffer.from('') } });
      const res = mockResponse();
      helper.uploadImage.mockResolvedValue({ status: 'error' });
      await userController.uploadAvatar(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });

    it('should return 404 if user not found', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109ca' }, file: { buffer: Buffer.from('') } });
      const res = mockResponse();
      helper.uploadImage.mockResolvedValue({ status: 'success', data: 'url' });
      User.findById.mockResolvedValue(null);
      await userController.uploadAvatar(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.NOT_FOUND);
    });

    it('should handle catch block', async () => {
      const req = mockRequest({ params: { id: '60d0fe4f5311236168a109ca' }, file: { buffer: Buffer.from('') } });
      const res = mockResponse();
      helper.uploadImage.mockRejectedValue(new Error('Upload failed'));
      await userController.uploadAvatar(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });
  });
});
