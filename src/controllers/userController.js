const createUser = (req, res, next) => {
  res.json({ message: 'User created successfully' });
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
