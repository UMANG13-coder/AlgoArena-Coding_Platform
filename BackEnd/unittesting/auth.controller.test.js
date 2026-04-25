process.env.SUPABASE_URL = 'http://test.com';
process.env.SUPABASE_SECRET_KEY = 'test';
const authController = require('../controllers/auth.controller');
const User = require('../models/users');
const authServices = require('../services/auth.service');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { STATUS_CODE } = require('../utils/constants');
const { getOAuthClient } = require('../utils/helper');

jest.mock('../models/users');
jest.mock('../services/auth.service');
jest.mock('../utils/helper');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

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
  res.redirect = jest.fn();
  return res;
};

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login', () => {
    it('should login successfully', async () => {
      const req = mockRequest({ body: { email: 't@t.com', password: 'p1' } });
      const res = mockResponse();
      User.findOne.mockResolvedValue({ id: '1', email: 't@t.com', password: 'hash', name: 'T' });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token');
      await authController.Login(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SUCCESS);
    });

    it('should return validation error', async () => {
      const req = mockRequest({ body: { email: 'invalid' } });
      const res = mockResponse();
      await authController.Login(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should return 404 if user not found', async () => {
      const req = mockRequest({ body: { email: 't@t.com', password: 'p1' } });
      const res = mockResponse();
      User.findOne.mockResolvedValue(null);
      await authController.Login(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.NOT_FOUND);
    });

    it('should return 401 if account has no password (Google user)', async () => {
      const req = mockRequest({ body: { email: 't@t.com', password: 'p1' } });
      const res = mockResponse();
      User.findOne.mockResolvedValue({ id: '1', email: 't@t.com' });
      await authController.Login(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.UNAUTHORIZED);
    });

    it('should return 401 if password validation fails', async () => {
      const req = mockRequest({ body: { email: 't@t.com', password: 'p1' } });
      const res = mockResponse();
      User.findOne.mockResolvedValue({ id: '1', email: 't@t.com', password: 'hash' });
      bcrypt.compare.mockResolvedValue(false);
      await authController.Login(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.UNAUTHORIZED);
    });

    it('should handle internal server error', async () => {
      const req = mockRequest({ body: { email: 't@t.com', password: 'p1' } });
      const res = mockResponse();
      User.findOne.mockRejectedValue(new Error('DB Error'));
      await authController.Login(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.UNAUTHORIZED);
    });
  });

  describe('Signup', () => {
    it('should signup successfully', async () => {
      const req = mockRequest({ body: { name: 'T', email: 't@t.com', password: 'Password1' } });
      const res = mockResponse();
      User.findOne.mockResolvedValue(null);
      authServices.createNewUser.mockResolvedValue({ _id: '1', email: 't@t.com' });
      jwt.sign.mockReturnValue('token');
      await authController.Signup(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.CREATED);
    });

    it('should return 409 if user already exists', async () => {
      const req = mockRequest({ body: { name: 'T', email: 't@t.com', password: 'Password1' } });
      const res = mockResponse();
      User.findOne.mockResolvedValue({ _id: '1' });
      await authController.Signup(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.CONFLICT);
    });

    it('should return validation error', async () => {
      const req = mockRequest({ body: { email: 'invalid' } });
      const res = mockResponse();
      await authController.Signup(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.VALIDATION_ERROR);
    });

    it('should handle error during user creation', async () => {
      const req = mockRequest({ body: { name: 'T', email: 't@t.com', password: 'Password1' } });
      const res = mockResponse();
      User.findOne.mockResolvedValue(null);
      authServices.createNewUser.mockRejectedValue(new Error('Signup failed'));
      await authController.Signup(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });
  });

  describe('generateRedirectUrl', () => {
    it('should return auth url', async () => {
      const req = mockRequest({});
      const res = mockResponse();
      getOAuthClient.mockReturnValue({ generateAuthUrl: () => 'http://auth.url' });
      await authController.generateRedirectUrl(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SUCCESS);
    });

    it('should handle error generating url', async () => {
      const req = mockRequest({});
      const res = mockResponse();
      getOAuthClient.mockImplementation(() => { throw new Error('OAuth Error'); });
      await authController.generateRedirectUrl(req, res);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.SERVER_ERROR);
    });
  });

  describe('handleGoogleCallback', () => {
    it('should handle callback successfully for existing user', async () => {
      const req = mockRequest({ query: { code: 'code' } });
      const res = mockResponse();
      const mockClient = {
        getToken: jest.fn().mockResolvedValue({ tokens: { id_token: 'id' } }),
        setCredentials: jest.fn(),
        verifyIdToken: jest.fn().mockResolvedValue({ getPayload: () => ({ email: 't@t.com', sub: 'g1' }) })
      };
      getOAuthClient.mockReturnValue(mockClient);
      User.findOne.mockResolvedValue({ _id: '1', email: 't@t.com', role: 'user', save: jest.fn() });
      jwt.sign.mockReturnValue('token');
      await authController.handleGoogleCallback(req, res);
      expect(res.redirect).toHaveBeenCalled();
    });

    it('should handle callback successfully for existing user with google_id', async () => {
      const req = mockRequest({ query: { code: 'code' } });
      const res = mockResponse();
      const mockClient = {
        getToken: jest.fn().mockResolvedValue({ tokens: { id_token: 'id' } }),
        setCredentials: jest.fn(),
        verifyIdToken: jest.fn().mockResolvedValue({ getPayload: () => ({ email: 't@t.com', sub: 'g1' }) })
      };
      getOAuthClient.mockReturnValue(mockClient);
      User.findOne.mockResolvedValue({ _id: '1', email: 't@t.com', google_id: 'g1', role: 'user' });
      jwt.sign.mockReturnValue('token');
      await authController.handleGoogleCallback(req, res);
      expect(res.redirect).toHaveBeenCalled();
    });

    it('should handle callback for new user', async () => {
      const req = mockRequest({ query: { code: 'code' } });
      const res = mockResponse();
      const mockClient = {
        getToken: jest.fn().mockResolvedValue({ tokens: { id_token: 'id' } }),
        setCredentials: jest.fn(),
        verifyIdToken: jest.fn().mockResolvedValue({ getPayload: () => ({ email: 'new@t.com', sub: 'g2', name: 'New', picture: 'pic' }) })
      };
      getOAuthClient.mockReturnValue(mockClient);
      User.findOne.mockResolvedValue(null);
      authServices.createNewUser.mockResolvedValue({ _id: '2', email: 'new@t.com', name: 'New', avatar_url: 'pic', role: 'user' });
      jwt.sign.mockReturnValue('token');
      await authController.handleGoogleCallback(req, res);
      expect(res.redirect).toHaveBeenCalled();
    });

    it('should redirect with error if code is missing', async () => {
      const req = mockRequest({ query: {} });
      const res = mockResponse();
      await authController.handleGoogleCallback(req, res);
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('error=missing_code'));
    });

    it('should redirect with error on exception', async () => {
      const req = mockRequest({ query: { code: 'code' } });
      const res = mockResponse();
      getOAuthClient.mockImplementation(() => { throw new Error('Callback Error'); });
      await authController.handleGoogleCallback(req, res);
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('error=Callback%20Error'));
    });
  });
});
