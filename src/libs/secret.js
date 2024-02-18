import "dotenv/config";

const serverPort = process.env.SERVER_PORT || 5001;
const mongoDbUri = process.env.MONGODB_ATLAS_URI || "";
const jwtSecretKey = process.env.JWT_SECRET_KEY || "jwt-secret-key";
const paymentSecretKey = process.env.PAYMENT_SECRET_KEY || "payment-secret-key";

export { serverPort, mongoDbUri, jwtSecretKey, paymentSecretKey };
