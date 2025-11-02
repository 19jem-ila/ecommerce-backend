import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Update `updatedAt` whenever items are modified
wishlistSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for quick lookup by user
wishlistSchema.index({ user: 1 });

export default mongoose.model("Wishlist", wishlistSchema);
