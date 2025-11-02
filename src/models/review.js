import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

// Optional: Ensure one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Update product rating after review is added/updated/deleted
reviewSchema.statics.updateProductRating = async function(productId) {
  const stats = await this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } }, // ✅ fixed
    { $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 }
    }}
  ]);

  const Product = mongoose.model("Product");
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: stats[0].avgRating,
      reviewCount: stats[0].reviewCount
    });
  }
};

export default mongoose.model("Review", reviewSchema);
