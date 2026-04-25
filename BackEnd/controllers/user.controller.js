const User = require("../models/users");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const { STATUS_CODE } = require("../utils/constants");
const userServices = require("../services/user.service");
const Joi = require('joi');
const UserProfile = require("../models/UserProfile");
const { uploadImage } = require("../utils/helper");

async function getAllUsers(req, res) {
  const querySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    name: Joi.string().allow('')
  });
  try {
    const {error, value} = querySchema.validate(req.query);

    if(error){
      return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
    }

    const {page=1, limit=10, name: nameSearch} = value;

    const allUsers = await userServices.getAllUsers({
      page,
      limit,
      nameSearch
    });

    if(allUsers) {
      return sendSuccessResponse(
      res,
      {users:allUsers.data,pagination:allUsers.pagination},
      "Users Retrieved Successfully",
      STATUS_CODE.OK
    );
    }

  } catch (err) {
    return sendErrorResponse(
      res,
      {},
      `Error Retrieving Users: ${err.message}`,
      STATUS_CODE.SERVER_ERROR
    );
  }
}

async function getUserById(req, res) {
  const idSchema = Joi.object({
    id: Joi.string().hex().required()
  });
  try {
    const {error, value} = idSchema.validate(req.params);

    if(error){
      return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
    }

    const userId = value.id;
    const fetchUser = await userServices.fetchUserById(userId);

    if(!fetchUser) {
      return sendErrorResponse(
        res,
        {},
        "User Not Found",
        STATUS_CODE.NOT_FOUND
      );
    }

    return sendSuccessResponse(
      res,
      fetchUser,
      "User Retrieved Successfully",
      STATUS_CODE.SUCCESS
    );

  } catch (err) {
    return sendErrorResponse(
      res,
      {},
      `Error Retrieving User: ${err.message}`,
      STATUS_CODE.SERVER_ERROR
    );
  }
}

async function getUserProfile(req, res) {
  const idSchema = Joi.object({
    id: Joi.string().hex().required()
  });
  try {
    const {error, value} = idSchema.validate(req.params);

    if(error){
      return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
    }

    const userId = value.id;

    if(userId !== req.user.id.toString()){
      return sendErrorResponse(
        res,
        {},
        "Unauthorized: You can only view your own profile",
        STATUS_CODE.UNAUTHORIZED
      );
    }

    const user = await userServices.fetchUserById(userId);
    if(!user){
      return sendErrorResponse(res, {}, "User Not Found", STATUS_CODE.NOT_FOUND);
    }

    const profile = await UserProfile.findOne({ user_id: userId }) || {};

    return sendSuccessResponse(
      res,
      { user, profile },
      "Profile Retrieved Successfully",
      STATUS_CODE.OK
    );
  } catch (err) {
    return sendErrorResponse(
      res,
      {},
      `Error Retrieving Profile: ${err.message}`,
      STATUS_CODE.SERVER_ERROR
    );
  }
}

async function deleteUser(req, res) {
  const idSchema = Joi.object({
    id: Joi.string().hex().required()
  });
  try {
    const {error, value} = idSchema.validate(req.params);

    if(error){
      return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
    }

    const userId = value.id;

    const deletedUser= await userServices.deleteUser(userId);

    if(deletedUser) {
      return sendSuccessResponse(
        res,
        deletedUser.data,
        "User Deleted Successfully",
        STATUS_CODE.OK
      );
    } 
  } catch (err) {
    return sendErrorResponse(
      res,
      {},
      `Error Retrieving User: ${err.message}`,
      STATUS_CODE.SERVER_ERROR
    );
  }
}

async function editUser(req, res) {
  const editUserSchema = Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(6)
  });
  try {
    const {error, value} = editUserSchema.validate(req.body);

    if(error){
      return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
    }

    const userId = req.params.id;
    const { name, email, password } = value;

    if (!userId) {
      return sendErrorResponse(
        res,
        {},
        "User ID is required",
        STATUS_CODE.BAD_REQUEST
      );
    }

    const existingUser = await userServices.fetchUserById(userId);

    if (!existingUser) {
      return sendErrorResponse(
        res,
        {},
        "User Not Found",
        STATUS_CODE.NOT_FOUND
      );
    }

    const updatedUser = await userServices.updateUser(userId,existingUser,{ name, email, password });

    if (updatedUser) {
      return sendSuccessResponse(
        res,
        updatedUser.data,
        "User Updated Successfully",
        STATUS_CODE.SUCCESS
      );
    } 

  } catch (err) {
    return sendErrorResponse(
      res,
      {},
      `Error Updating User: ${err.message}`,
      STATUS_CODE.SERVER_ERROR
    );
  }
}

async function editUserProfile(req, res) {
  const editProfileSchema = Joi.object({
      location: Joi.string().allow(''),
      education: Joi.string().allow(''),
      bio: Joi.string().allow(''),
      grad_year: Joi.number().integer().min(1900),
      mobile: Joi.string().allow(''),
      github: Joi.string().uri().allow(''),
      linkedin: Joi.string().uri().allow(''),
      twitter: Joi.string().uri().allow(''),
      resume_url: Joi.string().uri().allow(''),
      leetcode: Joi.string().uri().allow(''),
      codeforces: Joi.string().uri().allow(''),
      gfg: Joi.string().uri().allow(''),
      hackerrank: Joi.string().uri().allow('')
  });

  const userIdSchema = Joi.object({
      id: Joi.string().hex().required()
  });

  try{
      const {error: paramError, value: paramValue} = userIdSchema.validate(req.params);

      if(paramError){
          return sendErrorResponse(res, paramError.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
      }

      const userId = paramValue.id;

      const {error, value} = editProfileSchema.validate(req.body);
      if(error){
          return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
      }

      if(userId !== req.user.id.toString()){
      return sendErrorResponse(
        res,
        {},
        "Unauthorized: You can only edit your own profile",
        STATUS_CODE.UNAUTHORIZED
      );
    }

      let userProfile = await UserProfile.findOne({ user_id: userId });

      if(!userProfile){
          userProfile = new UserProfile({
              user_id: userId,
              ...value
          });
      } else {
          Object.assign(userProfile, value);
      }

      await userProfile.save();

      return sendSuccessResponse(res, userProfile, "User profile updated successfully", STATUS_CODE.OK);
  }catch(err){
      return sendErrorResponse(res, err, "Failed to update user profile");
  }
}

async function uploadAvatar(req, res) {
  try {
    const userId = req.params.id;

    if(userId !== req.user.id.toString()){
      return sendErrorResponse(res, {}, "Unauthorized: You can only edit your own profile", STATUS_CODE.UNAUTHORIZED);
    }

    if (!req.file) {
      return sendErrorResponse(res, {}, "No image file provided", STATUS_CODE.BAD_REQUEST);
    }

    const uploadResult = await uploadImage(req.file, userId);

    if (uploadResult.status === 'error') {
      return sendErrorResponse(res, uploadResult, "Failed to upload image to storage", STATUS_CODE.SERVER_ERROR);
    }

    const publicUrl = uploadResult.data;

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return sendErrorResponse(res, {}, "User Not Found", STATUS_CODE.NOT_FOUND);
    }

    existingUser.avatar_url = publicUrl;
    await existingUser.save();

    return sendSuccessResponse(res, { avatar_url: publicUrl }, "Profile picture updated successfully", STATUS_CODE.OK);

  } catch (err) {
    return sendErrorResponse(res, {}, `Error uploading avatar: ${err.message}`, STATUS_CODE.SERVER_ERROR);
  }
}

module.exports={
    getAllUsers,
    getUserById,
    getUserProfile,
    deleteUser,
    editUser,
    editUserProfile,
    uploadAvatar
}
