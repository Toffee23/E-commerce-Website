import { Schema, model } from "mongoose";

// Interface representing the structure of the Dress document
interface Dress {
  subtag: "casual" | "evening" | "occassion" | "shirt" | "maxi" | "denim" | "knitted";
  color: string[];
  size: "s" | "m" | "l" | "xl" | "xxl";
}

// Creating a Mongoose Schema for the Dress interface
const DressSchema = new Schema<Dress>({
  subtag: {
    type: String,
    required: [true, "please provide a subtag"],
    enum: ["casual", "evening", "occassion", "shirt", "maxi", "denim", "knitted"],
  },
  color: {
    type: [String],
    default: ["#222"],
    required: true,
  },
  size: {
    type: String,
    required: [true, "please provide a size"],
    enum: ["s", "m", "l", "xl", "xxl"],
  },
});

// Interface representing the structure of the Clothing document
interface Clothing {
  dress: Dress;
}

// Creating a Mongoose Schema for the Clothing interface
const ClothingSchema = new Schema<Clothing>({
  dress: {
    type: DressSchema,
    required: [true, "please provide the dress data"],
    // You can add a validate function here if needed
    // validate: function () {},
  },
});

export default model<Clothing>("Clothing", ClothingSchema);
