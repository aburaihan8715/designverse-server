import createError from 'http-errors';
import { promisify } from 'util';

import { connectDb } from '../libs/db.js';
import { User } from '../models/userModel.js';
import { createJWT } from '../utils/createJWT.js';
import { jwtSecretKey } from '../libs/secret.js';
import { successResponse } from '../utils/response.js';
import jwt from 'jsonwebtoken';

// CREATE USER
const register = async (req, res, next) => {
  try {
    await connectDb();
    // check if user is already registered
    const isUserExists = await User.findOne({
      email: req.body.email,
    });
    if (isUserExists) throw createError(409, 'User already exists');

    // create a new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });
    const user = await newUser.save();
    const { password, __v, ...others } = user._doc;

    // send response
    successResponse(res, { statusCode: 201, data: { ...others } });
  } catch (error) {
    next(error);
  }
};

// CREATE TOKEN AND SEND IT TO THE CLIENT
const getToken = async (req, res, next) => {
  try {
    const token = await createJWT({ email: req.body.email }, jwtSecretKey);

    successResponse(res, { statusCode: 201, data: { token } });
  } catch (error) {
    next(error);
  }
};

// VERIFY AUTHENTICATION
const verifyAuthentication = async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token)
    return next(
      createError(401, 'You are not logged in! Please log in to get access')
    );

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, jwtSecretKey);

  // 3) Check if user still exists
  const currentUser = await User.findOne({ email: decoded.email });
  if (!currentUser)
    return next(
      createError(401, 'The user belonging to this token does no longer exist')
    );

  // 4) Check if user changed password after the token was issued
  // NOTE: This part is very advanced
  // if (currentUser.changedPasswordAfter(decoded.iat))
  //   throw createError(
  //     401,
  //     'User recently changed password! Please login again.'
  //   );

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
};

// VERIFY AUTHORITY
const verifyAuthority = (...roles) => {
  return (req, res, next) => {
    // roles ['user','admin','user']
    if (!roles.includes(req.user.role)) {
      return next(
        createError(403, 'You do not have permission to preform this action')
      );
    }
    next();
  };
};

export { register, getToken, verifyAuthentication, verifyAuthority };
