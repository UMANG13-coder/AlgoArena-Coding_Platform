const User = require("../models/users");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const { STATUS_CODE } = require("../utils/constants");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const authServices = require("../services/auth.service");
const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret";
const { getOAuthClient } = require("../utils/helper");

async function Login(req, res) {
  const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });
  try {
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
      return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
    }

    const { email, password } = value;
    const user = await User.findOne({ email });

    if (!user) {
      return sendErrorResponse(res, {}, "Invalid Credentials", STATUS_CODE.NOT_FOUND);
    }

    if (!user.password) {
      return sendErrorResponse(
        res,
        {},
        "This account was created with Google. Please sign in with Google.",
        STATUS_CODE.UNAUTHORIZED
      );
    }

    const validatePassword = await bcrypt.compare(password, user.password);

    if (!validatePassword) {
      return sendErrorResponse(res, {}, "Invalid Credentials", STATUS_CODE.UNAUTHORIZED);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      jwtSecret,
      { expiresIn: "24h" }
    );

    return sendSuccessResponse(
      res,
      { token, email, name: user.name, id: user._id, profile_pic: user?.avatar_url, role: user.role },
      "Logged In Successfully",
      STATUS_CODE.SUCCESS
    );
  } catch (err) {
    return sendErrorResponse(
      res,
      {},
      "Internal Server Error",
      STATUS_CODE.UNAUTHORIZED
    );
  }
}

async function Signup(req, res) {
  const signupSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).pattern(/^(?=.*[A-Z])(?=.*\d).*$/).required()
    .messages({
    'string.pattern.base': 'Password must contain at least one uppercase letter and one number, and be alphanumeric',
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required'
  })
  });
  try {
    const { error, value } = signupSchema.validate(req.body);

    if (error) {
      return sendErrorResponse(res, error.details, "Validation error", STATUS_CODE.VALIDATION_ERROR);
    }

    const { name, email, password } = value;
    const avatar_url = req.file ? req.file : null;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return sendErrorResponse(res, {}, "User Already Exists", STATUS_CODE.CONFLICT);
    }

    const newUser = await authServices.createNewUser({
      name,
      email,
      password,
      google_id: null,
      avatar_url
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      jwtSecret,
      { expiresIn: "24h" }
    );

    return sendSuccessResponse(
      res,
      { token, email: newUser.email, name: newUser.name, id: newUser._id, profile_pic: newUser?.avatar_url || null, role: newUser.role },
      "User Created Successfully",
      STATUS_CODE.CREATED
    );
  } catch (err) {
    return sendErrorResponse(
      res,
      {},
      `Error Creating User: ${err.message}`,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
}

async function generateRedirectUrl(req, res) {
  try {
    const oauth2Client = getOAuthClient();

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["openid", "email", "profile"],
    });

    return sendSuccessResponse(
      res,
      { auth_url: url },
      "Google Auth URL generated successfully",
      STATUS_CODE.SUCCESS
    );
  } catch (err) {
    return sendErrorResponse(
      res,
      {},
      `Error generating redirect URL: ${err.message}`,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
}

async function handleGoogleCallback(req, res) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${frontendUrl}/auth?error=missing_code`);
    }

    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    let user = await User.findOne({ email: payload.email });

    if (user) {
      if (!user.google_id) {
        user.google_id = payload.sub;
        await user.save();
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        jwtSecret,
        { expiresIn: "24h" }
      );

      return res.redirect(
        `${frontendUrl}/auth?token=${token}&email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name || "")}&id=${user._id}&profile_pic=${encodeURIComponent(user?.avatar_url || "")}&role=${user.role}`
      );
    }

    const newUser = await authServices.createNewUser({
      name: payload.name,
      email: payload.email,
      password: null,
      google_id: payload.sub,
      avatar_url: payload.picture
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      jwtSecret,
      { expiresIn: "24h" }
    );

    return res.redirect(
      `${frontendUrl}/auth?token=${token}&email=${encodeURIComponent(newUser.email)}&name=${encodeURIComponent(newUser.name || "")}&id=${newUser._id}&profile_pic=${encodeURIComponent(newUser?.avatar_url || "")}&role=${newUser.role}`
    );

  } catch (err) {
    console.error("Google callback error:", err.message);
    return res.redirect(`${frontendUrl}/auth?error=${encodeURIComponent(err.message)}`);
  }
}

module.exports = {
  Login,
  Signup,
  generateRedirectUrl,
  handleGoogleCallback
};
