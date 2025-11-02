
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["eyeglasses", "sunglasses", "lenses", "sports", "brands"],
    },
    brand: { type: String, default: "Generic" },
    price: { type: Number, required: true, min: 0 },
    images: {
      type: [String], // still an array under the hood
      default: [],
      validate: {
        validator: function (val) {
          // Allow string or array
          return Array.isArray(val) || typeof val === "string";
        },
        message: "Images must be a string (single image) or an array of strings."
      },
      set: function (val) {
        // If a single string is provided, convert it into an array
        if (typeof val === "string") {
          return [val];
        }
        return val;
      }
    },
    
    colors: [{ type: String, required: true }],
    prescriptionEligible: { type: Boolean, default: false },
    includeLenses: { type: Boolean, default: true },
    description: { type: String, default: "High-quality eyewear product" },
    frameMaterial: {
      type: String,
      enum: ["Metal", "Plastic", "Titanium"],
      default: "Metal",
    },
    lensType: {
      type: String,
      enum: ["Standard", "Polarized", "Photochromic"],
      default: "Standard",
    },
    inStock: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 100 },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    recentSales: { type: Number, default: 0 }, // changed to Number for calculations
    variants: [
      {
        color: String,
        lensType: String,
        stockQuantity: Number,
        price: Number,
      },
    ],
  },
  { timestamps: true }
);

// Index for search
productSchema.index({ name: "text", category: "text", brand: "text" });

const Product = mongoose.model("Product", productSchema);

export default Product;
