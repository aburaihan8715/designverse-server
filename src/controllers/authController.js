const signup = (req, res, next) => {
  res.json({ message: 'sign up success!' });
};
const login = (req, res, next) => {
  res.json({ message: 'login success!' });
};
const logout = (req, res, next) => {
  res.json({ message: 'logout success!' });
};

export { signup, login, logout };
