const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  // console.log("payload", payload);
  return token;
};

const isTokenValid = ({ token }) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = ({ res, user }) => {
  const token = createJWT({ payload: user });

  // one day in milli seconds
  const oneDay = 1000 * 60 * 60 * 24;
  const thirtyDays = oneDay * 30;

  // console.log(thirtyDays);
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + thirtyDays),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });

  // response is in the authController
  // res.status(StatusCodes.CREATED).json({ user });
};
module.exports = { createJWT, isTokenValid, attachCookiesToResponse };
