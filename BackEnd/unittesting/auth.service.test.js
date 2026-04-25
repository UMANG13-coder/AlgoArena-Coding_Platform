process.env.SUPABASE_URL = 'http://test.com';
process.env.SUPABASE_SECRET_KEY = 'test';
const authService = require('../services/auth.service');
const User = require('../models/users');
const helper = require('../utils/helper');

jest.mock('../models/users');
jest.mock('../utils/helper');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createNewUser', () => {
    it('should create a user successfully', async () => {
      const userData = { name: 'T', email: 't@t.com', password: 'p1' };
      const mockUser = { _id: { toString: () => '1' }, save: jest.fn() };
      User.create.mockResolvedValue(mockUser);

      const result = await authService.createNewUser(userData);
      expect(result).toBeDefined();
      expect(User.create).toHaveBeenCalled();
    });

    it('should handle avatar upload for non-google user', async () => {
      const userData = { name: 'T', email: 't@t.com', password: 'p1', avatar_url: 'file' };
      const mockUser = { _id: { toString: () => '1' }, save: jest.fn() };
      User.create.mockResolvedValue(mockUser);
      helper.uploadImage.mockResolvedValue({ data: { fullPath: 'http://url.com' } });

      await authService.createNewUser(userData);
      expect(helper.uploadImage).toHaveBeenCalled();
    });
  });
});
