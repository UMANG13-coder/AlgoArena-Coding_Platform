const userServices = require('../services/user.service');
const User = require('../models/users');
const Progress = require('../models/Progress');

jest.mock('../models/users');
jest.mock('../models/Progress');

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUserById', () => {
    it('should return user when found', async () => {
      const mockUser = { _id: '1', name: 'Test' };
      User.findById.mockResolvedValue(mockUser);
      const result = await userServices.fetchUserById('1');
      expect(result).toEqual(mockUser);
    });

    it('should throw error when database fails', async () => {
      User.findById.mockRejectedValue(new Error('DB Fail'));
      await expect(userServices.fetchUserById('1')).rejects.toThrow('DB Fail');
    });
  });

  describe('deleteUser', () => {
    it('should return deleted user', async () => {
      const mockUser = { _id: '1', name: 'Test' };
      User.findByIdAndDelete.mockResolvedValue(mockUser);
      const result = await userServices.deleteUser('1');
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      User.findByIdAndDelete.mockResolvedValue(null);
      await expect(userServices.deleteUser('1')).rejects.toThrow('User with ID 1 not found');
    });
  });

  describe('getAllUsers', () => {
    it('should return all users with pagination and solved count', async () => {
      const mockUsers = [{ _id: '1', name: 'User 1' }];
      const mockProgress = [{ user_id: '1', solved_problems: ['p1', 'p2'] }];
      
      User.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockUsers)
          })
        })
      });
      User.countDocuments.mockResolvedValue(1);
      Progress.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockProgress)
      });

      const result = await userServices.getAllUsers({ page: 1, limit: 10 });
      expect(result.data[0].solvedCount).toBe(2);
      expect(result.pagination.totalUsers).toBe(1);
    });

    it('should handle search query', async () => {
      User.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([])
          })
        })
      });
      User.countDocuments.mockResolvedValue(0);
      Progress.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

      await userServices.getAllUsers({ page: 1, limit: 10, nameSearch: 'test' });
      expect(User.find).toHaveBeenCalledWith({
        name: { $regex: 'test', $options: 'i' }
      });
    });

    it('should throw error if find fails', async () => {
      User.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockRejectedValue(new Error('Fail'))
          })
        })
      });
      await expect(userServices.getAllUsers({ page: 1, limit: 10 })).rejects.toThrow('Fail');
    });
  });

  describe('updateUser', () => {
    it('should update and return user', async () => {
      const oldData = { _id: '1', name: 'Old' };
      const updateFields = { name: 'New' };
      const updatedUser = { _id: '1', name: 'New' };

      User.findByIdAndUpdate.mockResolvedValue(updatedUser);
      const result = await userServices.updateUser('1', oldData, updateFields);
      expect(result).toEqual(updatedUser);
    });

    it('should throw error if user not found', async () => {
      User.findByIdAndUpdate.mockResolvedValue(null);
      await expect(userServices.updateUser('1', {}, {})).rejects.toThrow('User with ID 1 not found');
    });
  });
});
