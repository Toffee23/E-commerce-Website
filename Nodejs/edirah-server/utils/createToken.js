const createTokenUser = (user) => {
  return {
    name: user.name,
    userId: user._id,
    role: user.role,
    email: user.email,
    address: user.address,
    cart: user.cart,
    interest: user.interest,
    dob: user.dob,
    wishList: user.wishList,
  };
};

const createTokenVendor = (vendor) => {
  return {
    vendorname: vendor.vendorname,
    name: vendor.name,
    userId: vendor._id,
    role: vendor.role,
    email: vendor.email,
    address: vendor.address,
    verified: vendor.verified,
  };
};

module.exports = { createTokenUser, createTokenVendor };
