const mongoose = require("mongoose");

const GeneralSchema = new mongoose.Schema({});
const JeansSchema = new mongoose.Schema({});

// enum: [
//       "dresses",
//       "t-shirts and tops",
//       "shirts and blouses",
//       "trousers",
//       "jeans",
//       "sweatshirts and hoodies",
//       "jackets and blazers",
//       "knitwear and cardigans",
//       "swimwear",
//       "shorts",
//       "skirts",
//       "jump suits",
//       "underwear",
//       "socks and tights",
//       "nightwear and loungewear",
// ],

const DressSchema = new mongoose.Schema({
  subtag: {
    type: String,
    required: [true, "please provide a subtag"],
    enum: [
      "casual",
      "evening",
      "occassion",
      "shirt",
      "maxi",
      "denim",
      "knitted",
    ],
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

const ClothingSchema = new mongoose.Schema({
  dress: {
    type: DressSchema,
    required: [true, "please provide the dress data"],
    // add a validate function where requieed if category.name is woman
    // validate: function () {},
  },
});

module.exports = ClothingSchema;

// const DressSchema = new mongoose.Schema({
//   casual: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Casual",
//   },
// });

// dresses: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: "Dress",
// },
