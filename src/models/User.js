import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  country: { type: String },
  type: { type: String, enum: ["shipping", "billing"], default: "shipping" }, // added type
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // improved email regex
    },
    emailVerified: { type: Boolean, default: false },
    
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    photoURL: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
     
    },
    addresses: [addressSchema], // embedded address schema
    preferences: {
      favoriteCategories: [
        {
          type: String,
          enum: ["eyeglasses", "sunglasses", "brands", "sports", "lenses"],
        },
      ],
      newsletter: {
        type: Boolean,
        default: false,
      },
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for Firebase UID
userSchema.index({ firebaseUid: 1 });

// Optional: Pre-save hook to ensure only one default address
userSchema.pre("save", function (next) {
  if (this.addresses && this.addresses.length > 0) {
    let defaultCount = 0;
    this.addresses.forEach((addr) => {
      if (addr.isDefault) defaultCount++;
    });
    if (defaultCount > 1) {
      const firstDefault = this.addresses.find((addr) => addr.isDefault);
      this.addresses.forEach((addr) => {
        addr.isDefault = addr === firstDefault;
      });
    }
  }
  next();
});

export default mongoose.model("User", userSchema);
