import { Document, Schema, model, Types, Model } from "mongoose";

interface Review extends Document {
  rating: number;
  title: string;
  comment: string;
  user: Types.ObjectId;
  product: Types.ObjectId;
}

// Creating a Mongoose Schema for the Review interface
const ReviewSchema = new Schema<Review>(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "please provide rating"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "please provide title"],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, "please provide review"],
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

// User should leave one review per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Adding a static method to the schema to calculate and update average rating
ReviewSchema.statics.calculateAverageRating = async function (
  productId: Types.ObjectId
): Promise<void> {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);
  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

// Post-save hook to recalculate average rating after saving a review
ReviewSchema.post("save", async function (this: Review) {
  await this.constructor.calculateAverageRating(this.product);
});

// Post-remove hook to recalculate average rating after removing a review
ReviewSchema.post("remove", async function (this: Review) {
  await this.constructor.calculateAverageRating(this.product);
});

export default model<Review>("Review", ReviewSchema);
