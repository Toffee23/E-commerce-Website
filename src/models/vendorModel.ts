import mongoose, { Document, Schema, model } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

interface Address {
  street?: string;
  number?: string;
  postcode?: string;
  state?: string;
  country?: string;
}

interface Vendor extends Document {
  vendorname: string;
  name: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  address: Address;
  verified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AddressSchema = new Schema<Address>({
  street: { type: String },
  number: { type: String },
  postcode: { type: String },
  state: { type: String },
  country: { type: String },
});

const VendorSchema = new Schema<Vendor>(
  {
    vendorname: {
      type: String,
      required: [true, "please provide a vendorname name"],
      minlength: 3,
      maxlength: 50,
    },
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
      default: "vendor",
    },
    phone: {
      type: String,
      required: [true, "please provide a phone number"],
    },
    address: {
      type: AddressSchema,
      required: [true, "please provide an address"],
    },
    verified: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

VendorSchema.pre<Vendor>("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

VendorSchema.methods.comparePassword = async function (candidatePassword: string) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

const VendorModel = model<Vendor>("Vendor", VendorSchema);

export default VendorModel;
