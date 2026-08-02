import jwt from "jsonwebtoken";
import crypto from "crypto";
import  RefreshToken  from "../models/refreshToken.model.js";


const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },  //we are also signing role,so the role of the user can be direclty identified by his access token and no db lookup is needed
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};


const generateAndSaveRefreshToken = async (userId) => {
 
  const rawToken = crypto.randomBytes(64).toString('hex');

  
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); //refersh token is valid for 7 days

  //saving the hashed refresh token in the db
  await RefreshToken.create({
    token: hashedToken,
    user: userId,
    expiresAt,
    isRevoked: false, 
  });

  return rawToken;
};


const verifyRefreshToken = async (rawToken) => {
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const tokenDoc = await RefreshToken.findOne({
    token: hashedToken,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  }).populate('user', '_id role email isActive');
  //here we are sending the user doc as well,so that new tokens can be generated and saved in the db

  return tokenDoc;
};


const verifyAccessToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET
  );
};


const revokeRefreshToken = async (rawToken) => {
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  await RefreshToken.findOneAndUpdate(
    { token: hashedToken },
    { isRevoked: true }
  );
};


const revokeAllUserTokens = async (userId) => {
  await RefreshToken.updateMany(
    { user: userId, isRevoked: false },
    { isRevoked: true }
  );
};


const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, //valid for 7 days
  path: '/',  //when you will logout and revoke the cookies in that case we will use this same path
};

export {
  generateAccessToken,
  generateAndSaveRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  refreshCookieOptions,
  verifyAccessToken
};
