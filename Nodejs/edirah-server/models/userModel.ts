import mongoose, { Schema, Document, Types } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

interface Address{
  street?: string;
  number?: string;
  postcode?: string;
  state?: string;
  country?: string;
}

interface CartItem {
  product: Types.ObjectId;
  quantity: number;
}

interface User extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user' | 'owner' | 'plus';
  address?: Address[];
  dob?: Date;
  interest: 'male' | 'female';
  cart: {
    shipping: number;
    total: number;
    cartQuantity: number;
    items: CartItem[];
  };
  wishList: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AddressSchema= new Schema <Address> ({
  street: { type: String },
  number: { type: String },
  postcode: { type: String },
  state: { type: String },
  country: { type: String },
});

const UserSchema: Schema<User> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'please provide a name'],
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'please provide an email'],
      validate: {
        validator: validator.isEmail,
        message: 'Please provide a valid email',
      },
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'please provide a password'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'owner', 'plus'],
      default: 'user',
    },
    address: {
      type: [AddressSchema],
      required: false,
    },
    dob: {
      type: Date,
      required: false,
      default: '',
    },
    interest: {
      type: String,
      enum: ['male', 'female'],
      required: [true, 'please provide interest to give a tailored experience'],
    },
    cart: {
      shipping: { type: Number, default: 4999 },
      total: { type: Number, default: 0 },
      cartQuantity: { type: Number, default: 0 },
      items: [
        {
          product: {
            type: mongoose.Types.ObjectId,
            ref: 'Product',
            required: true,
          },
          quantity: { type: Number, required: true },
        },
      ],
    },
    wishList: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

UserSchema.pre('save', async function (this: User) {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (
  this: User,
  candidatePassword: string
): Promise<boolean> {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

export default mongoose.model<User>('User', UserSchema);
