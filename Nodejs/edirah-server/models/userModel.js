const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



const AddressSchema = {
  street: { type: String },
  number: { type: String },
  postcode: { type: String },
  state: { type: String },
  country: { type: String },
};

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please provide a name"],
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "please provide an email"],
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email",
      },
      unique: true,
    },
    password: {
      type: String,
      required: [true, "please provide a password"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "user", "owner", "plus"],
      default: "user",
    },
    address: {
      type: [AddressSchema],
      required: false,
    },
    dob: {
      type: Date,
      required: false,
      default: "",
    },
    interest: {
      type: String,
      enum: ["male", "female"],
      required: [true, "please provide interest to give a tailored experience"],
    },
    cart: {
      shipping: { type: Number, default: 4999 },
      total: { type: Number, default: 0 },
      cartQuantity: { type: Number, default: 0 },

      items: [
        {
          product: {
            type: mongoose.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: { type: Number, required: true },
        },
      ],
    },

    wishList: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

UserSchema.pre("save", async function () {
  // console.log(this.modifiedPaths());
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);

// use match or validator npm pakage to validate emails
// match: [
//   /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
//   "Please provide a valid email",
// ],
