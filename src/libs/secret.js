import 'dotenv/config';

const serverPort = process.env.SERVER_PORT || 5001;
const mongodbAtlasUri = process.env.MONGODB_ATLAS_URI || '';
const mongodbLocalUri =
  process.env.MONGODB_LOCAL_URI || 'mongodb://localhost:27017/designverse';
const jwtSecretKey = process.env.JWT_SECRET_KEY || 'jwt-secret-key';
const paymentSecretKey = process.env.PAYMENT_SECRET_KEY || 'payment-secret-key';

export {
  serverPort,
  mongodbAtlasUri,
  mongodbLocalUri,
  jwtSecretKey,
  paymentSecretKey,
};
