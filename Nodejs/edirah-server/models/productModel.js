const mongoose = require("mongoose");
const ClothingSchema = require("./SubCategoryModel");

const ProductSchema = new mongoose.Schema(
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
      maxlength: [1000, "Desc cannot be more than 1000 charcaters"],
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
      type: mongoose.Schema.ObjectId,
      ref: "Vendor",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please provide product name"],
      default: function () {
        // return this.tag + " " + this.category.clothing;
        return (
          this.category.clothing.dress.subtag +
          " - " +
          this.category.name +
          " - " +
          this.category.clothing.dress.color
        );
      },
      // trim: true,
      // maxlength: [50, "name cannot be more than 50 characters "],
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
      // clothing: {
      //   type: ClothingSchema,
      //   required: [true, "provide clothing data"],
      // },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ProductSchema.category.add({ clothing: ClothingSchema });
ProductSchema.virtual("vendorName").get(function () {
  return this.vendor.name;
});

ProductSchema.pre("save", function (next) {
  if (!this.productNumber) {
    this.productNumber = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, "0");
  }
  next();
});

// console.log(ProductSchema);
ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
  // match: { rating: 5 },
});

ProductSchema.pre("remove", async function (next) {
  await this.model("Review").deleteMany({ product: this._id });
});

module.exports = mongoose.model("Product", ProductSchema);
