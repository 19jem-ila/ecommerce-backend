import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        color: {
          type: String,
          required: true,
        },
      },
    ],

    // --- Address Info ---
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },

    // --- Payment Info ---
    paymentMethod: {
      type: String,
      required: true,
      enum: ["paypal", "telebirr", "cod"],
    },

    paymentStatus: {
      type: String,
      required: true,
      enum: ["initiated", "pending", "completed", "failed", "refunded"],
      default: "pending",
    },

    // Unique internal reference for Telebirr (or other gateways)
    paymentReference: {
      type: String,
      unique: true,
      required: function () {
        return this.paymentMethod === "telebirr";
      },
    },

    // Optional internal order reference
    paymentId: {
      type: String,
      default: "",
    },

    // Telebirr transaction ID returned from their API
    telebirrTransactionId: {
      type: String,
      default: "",
    },

    // Store raw Telebirr callback data
    paymentDetails: {
      type: Object,
      default: {},
    },

    // Optional expiry for pending payment
    paymentExpiresAt: {
      type: Date,
    },

    // --- Order Info ---
    orderStatus: {
      type: String,
      required: true,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    subtotal: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      required: true,
      default: 0,
    },
    tax: {
      type: Number,
      required: true,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },

    trackingNumber: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    estimatedDelivery: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Auto calculate subtotal + total before save
orderSchema.pre("save", function (next) {
  if (
    this.isModified("items") ||
    this.isModified("shippingCost") ||
    this.isModified("tax")
  ) {
    this.subtotal = this.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    this.total = this.subtotal + this.shippingCost + this.tax;
  }
  next();
});

// Indexes for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ telebirrTransactionId: 1 });
orderSchema.index({ paymentReference: 1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;

