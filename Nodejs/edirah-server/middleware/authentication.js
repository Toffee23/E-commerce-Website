const CustomError = require("../errors");
const { isTokenValid } = require("../utils");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new CustomError.UnauthenticatedError("Authtentication invalid");
  }
  try {
    const payload = isTokenValid({ token });

    req.user = {
      name: payload.name,
      userId: payload.userId,
      role: payload.role,
      address: payload.address,
      email: payload.email,
      cart: payload.cart,
      interest: payload.interest,
      dob: payload.dob,
      wishList: payload.wishList,

      // vendor details
      vendorname: payload.vendorname,
      verified: payload.verified,
    };
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication invalid");
  }
  next();
};

// const authorizePermissions = (req, res, next) => {
//   console.log("admin route");
//   const { role } = req.user;
//   if (role !== "admin") {
//     throw new CustomError.UnauthorizedError(
//       "Unauthorized to access this route"
//     );
//   } else {
//     console.log("not admin");
//   }
//   next();
// };

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        "Unauthorized to access this route"
      );
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermissions,
};
