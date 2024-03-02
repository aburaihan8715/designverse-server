import { connectDb } from '../libs/db.js';
import { User } from '../models/userModel.js';

const createUser = async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  try {
    await connectDb();
    // CHECK WEATHER USER ALREADY EXISTS
    const isUserExists = await User.findOne({ email: email });
    if (isUserExists) throw new Error('User already exists');

    // CREATE USER
    const newUser = new User({
      name,
      email,
      password,
      passwordConfirm,
    });
    const user = await newUser.save();

    // CREATE TOKEN

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
    console.log(error);
  }
};

const getAllUsers = (req, res, next) => {
  res.json({ message: 'Users has been sent successfully' });
};

const getUser = (req, res, next) => {
  res.json({ message: 'User has been sent successfully' });
};

const updateUser = (req, res, next) => {
  res.json({ message: 'User has been updated successfully' });
};

const deleteUser = (req, res, next) => {
  res.json({ message: 'User has been deleted successfully' });
};

export { getAllUsers, createUser, getUser, updateUser, deleteUser };
