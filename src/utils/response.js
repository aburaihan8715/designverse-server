// error response
const errorResponse = (
  res,
  { statusCode = 500, message = 'Internal server error' }
) => {
  return res.status(statusCode).json({
    status: 'error',
    message: message,
  });
};

// success response
const successResponse = (res, { statusCode = 200, data = null }) => {
  return res.status(statusCode).json({
    status: 'success',
    data: data,
  });
};

export { errorResponse, successResponse };
