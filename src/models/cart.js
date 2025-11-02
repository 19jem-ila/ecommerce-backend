import mongoose from "mongoose";

// Optional: Variant schema to match Product variants
const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, default: 1, min: 1 },
  // Optional variant details for products with color/lens/frame options
  variant: {
    color: { type: String },
    lensType: { type: String },
    frameSize: { type: String }
  },
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [cartItemSchema],
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Update `updatedAt` whenever items are modified
cartSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for quick lookup by user
cartSchema.index({ user: 1 });

export default mongoose.model("Cart", cartSchema);
