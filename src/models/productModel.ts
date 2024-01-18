import { Document, Schema, model, Types, VirtualType } from "mongoose";
import ClothingSchema from "./SubCategoryModel";

// Interface representing the structure of the overall product document
interface Product extends Document {
  productNumber: string;
  price: number;
  description: string;
  image: string;
  tag: string;
  gender: string;
  inventory: number;
  averageRating: number;
  verified: boolean;
  numOfReviews: number;
  vendor: Types.ObjectId;
  name: string;
  category: {
    name: "man" | "woman" | "kids";
    clothing: Clothing;
  };
  vendorName: VirtualType;
  reviews: Types.DocumentArray;
}


// Creating a Mongoose Schema for the Product interface
const ProductSchema = new Schema<Product>(
  {
    productNumber: {
      type: String,
      unique: true,
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Please provide product description"],
      maxlength: [1000, "Desc cannot be more than 1000 characters"],
    },
    image: {
      type: String,
      default: "/uploads/example.jpeg",
    },
    tag: {
      type: String,
      required: [true, "please provide product tag"],
      enum: [
        "shoes",
        "clothing",
        "sports",
        "accessories",
        "underwear and socks",
        "designer",
        "gift",
        "care",
        "get the look",
        "beauty",
        "brands",
        "sale",
      ],
    },
    gender: {
      type: String,
      required: [true, "please provide product gender"],
      enum: ["male", "female"],
    },
    inventory: {
      type: Number,
      required: true,
      default: 10,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    vendor: {
      type: Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please provide product name"],
      default: function (this: Product) {
        return (
          this.category.clothing.dress.subtag +
          " - " +
          this.category.name +
          " - " +
          this.category.clothing.dress.color
        );
      },
    },
    category: {
      name: {
        type: String,
        required: [true, "please provide product category"],
        enum: ["man", "woman", "kids"],
      },
      clothing: {
        type: ClothingSchema,
        required: [true, "please provide the clothing data"],
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Adding a virtual property for the vendor name
ProductSchema.virtual("vendorName").get(function (this: Product) {
  return this.vendor.name;
});

// Adding a virtual property for reviews
ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
});

// Pre-save hook to generate a random product number if not provided
ProductSchema.pre("save", function (next) {
  if (!this.productNumber) {
    this.productNumber = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, "0");
  }
  next();
});

// Pre-remove hook to delete associated reviews when a product is removed
ProductSchema.pre("remove", async function (next) {
  await this.model("Review").deleteMany({ product: this._id });
});

export default model<Product>("Product", ProductSchema);
