// import Order from "../models/Order.js";
// import Product from "../models/Product.js";

// // Create new order
// export const createOrder = async (req, res) => {
//   try {
//     const { items, shippingAddress, billingAddress, paymentMethod, notes } = req.body;

//     if (!items || items.length === 0)
//       return res.status(400).json({ error: "Order must contain at least one item" });

//     if (!shippingAddress)
//       return res.status(400).json({ error: "Shipping address is required" });

//     const orderItems = [];
//     let subtotal = 0;

//     for (const item of items) {
//       const product = await Product.findById(item.product);
//       if (!product) return res.status(400).json({ error: `Product ${item.product} not found` });

//       if (!product.inStock || product.stockQuantity < item.quantity)
//         return res.status(400).json({ error: `Insufficient stock for ${product.name}` });

//       subtotal += product.price * item.quantity;

//       orderItems.push({
//         product: product._id,
//         quantity: item.quantity,
//         price: product.price,
//         color: item.color,
//       });

//       // Update stock
//       product.stockQuantity -= item.quantity;
//       if (product.stockQuantity === 0) product.inStock = false;
//       await product.save();
//     }

//     const shippingCost = subtotal > 1000 ? 0 : 200;
//     const tax = subtotal * 0.15;
//     const total = subtotal + shippingCost + tax;

//     const order = new Order({
//       user: req.user.userId,
//       items: orderItems,
//       shippingAddress,
//       billingAddress: billingAddress || shippingAddress,
//       paymentMethod,
//       subtotal,
//       shippingCost,
//       tax,
//       total,
//       notes,
//     });

//     await order.save();
//     await order.populate("items.product");

//     res.status(201).json({ success: true, order });
//   } catch (error) {
//     console.error("Order creation error:", error);
//     res.status(500).json({ error: "Failed to create order" });
//   }
// };

// // Get user orders
// export const getUserOrders = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, status } = req.query;
//     const filter = { user: req.user.userId };
//     if (status) filter.orderStatus = status;

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const orders = await Order.find(filter)
//       .populate("items.product", "name images price")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit))
//       .lean();

//     const total = await Order.countDocuments(filter);

//     res.json({
//       success: true,
//       orders,
//       pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / limit), totalOrders: total },
//     });
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     res.status(500).json({ error: "Failed to fetch orders" });
//   }
// };

// // Cancel order
// export const cancelOrder = async (req, res) => {
//   try {
//     const order = await Order.findOne({ _id: req.params.orderId, user: req.user.userId });
//     if (!order) return res.status(404).json({ error: "Order not found" });
//     if (order.orderStatus !== "pending") return res.status(400).json({ error: "Only pending orders can be cancelled" });

//     // Restore stock
//     for (const item of order.items) {
//       const product = await Product.findById(item.product);
//       if (product) {
//         product.stockQuantity += item.quantity;
//         if (!product.inStock) product.inStock = true;
//         await product.save();
//       }
//     }

//     order.orderStatus = "cancelled";
//     await order.save();

//     res.json({ success: true, message: "Order cancelled successfully", orderStatus: order.orderStatus });
//   } catch (error) {
//     console.error("Error cancelling order:", error);
//     res.status(500).json({ error: "Failed to cancel order" });
//   }
// };

// // Admin: Get all orders
// export const getAllOrders = async (req, res) => {
//   try {
//     const { page = 1, limit = 20, status, paymentStatus } = req.query;
//     const filter = {};
//     if (status) filter.orderStatus = status;
//     if (paymentStatus) filter.paymentStatus = paymentStatus;

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const orders = await Order.find(filter)
//       .populate("user", "displayName email")
//       .populate("items.product", "name images price")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit))
//       .lean();

//     const total = await Order.countDocuments(filter);

//     res.json({
//       success: true,
//       orders,
//       pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / limit), totalOrders: total },
//     });
//   } catch (error) {
//     console.error("Error fetching admin orders:", error);
//     res.status(500).json({ error: "Failed to fetch orders" });
//   }
// };

// // Admin: Update order status
// export const updateOrderStatus = async (req, res) => {
//   try {
//     const { orderStatus, trackingNumber, estimatedDelivery } = req.body;
//     const order = await Order.findById(req.params.orderId);
//     if (!order) return res.status(404).json({ error: "Order not found" });

//     if (orderStatus) order.orderStatus = orderStatus;
//     if (trackingNumber) order.trackingNumber = trackingNumber;
//     if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;

//     await order.save();

//     res.json({ success: true, message: "Order updated successfully", order });
//   } catch (error) {
//     console.error("Error updating order:", error);
//     res.status(500).json({ error: "Failed to update order" });
//   }
// };

import Order from "../models/Order.js";
import Product from "../models/Product.js";

// ------------------------------
// Create new order
// ------------------------------
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, billingAddress, paymentMethod, notes } = req.body;
    console.log("Incoming order body:", req.body); 

    if (!items || items.length === 0)
      return res.status(400).json({ error: "Order must contain at least one item" });

    if (!shippingAddress)
      return res.status(400).json({ error: "Shipping address is required" });

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(400).json({ error: `Product ${item.product} not found` });

      if (!product.inStock || product.stockQuantity < item.quantity)
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });

      subtotal += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        color: item.color,
      });

      // Update stock
      product.stockQuantity -= item.quantity;
      if (product.stockQuantity === 0) product.inStock = false;
      await product.save();
    }

    const shippingCost = subtotal > 1000 ? 0 : 200;
    const tax = subtotal * 0.15;
    const total = subtotal + shippingCost + tax;

    // Generate payment reference for Telebirr
    let paymentReference = "";
    if (paymentMethod === "telebirr") {
      paymentReference = `TEL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    const order = new Order({
      user: req.user.userId,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      paymentReference, // Added
      paymentStatus: paymentMethod === "telebirr" ? "pending" : "completed",
      subtotal,
      shippingCost,
      tax,
      total,
      notes,
    });

    await order.save();
    await order.populate("items.product");

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

// ------------------------------
// Initiate Telebirr Payment
// ------------------------------
export const initiatePayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.paymentStatus === "completed")
      return res.status(400).json({ error: "Order already paid" });

    // Mock Telebirr transaction
    const mockTransactionId = `TEL-${Date.now()}`;
    order.telebirrTransactionId = mockTransactionId;
    order.paymentExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
    await order.save();

    res.json({
      success: true,
      message: "Payment initiated (demo)",
      paymentUrl: `https://demo.telebirr/payment/${mockTransactionId}`,
      order,
    });
  } catch (error) {
    console.error("Error initiating payment:", error);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
};

// ------------------------------
// Confirm Telebirr Payment (Webhook / Callback)
// ------------------------------
export const confirmPayment = async (req, res) => {
  try {
    const { transactionId, status, data } = req.body; // status: success/failed
    const order = await Order.findOne({ telebirrTransactionId: transactionId });
    if (!order) return res.status(404).json({ error: "Order not found" });

    console.log("Confirm payment route hit!");

    order.paymentStatus = status === "success" ? "completed" : "failed";
    order.paymentDetails = data;
    await order.save();

    res.json({ success: true, message: "Payment status updated", order });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({ error: "Failed to confirm payment" });
  }
};


// ------------------------------
// Get user orders
// ------------------------------
export const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { user: req.user.userId };
    if (status) filter.orderStatus = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate("items.product", "name images price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      orders,
      pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / limit), totalOrders: total },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// ------------------------------
// Cancel order
// ------------------------------
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user.userId });
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.orderStatus !== "pending") return res.status(400).json({ error: "Only pending orders can be cancelled" });

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stockQuantity += item.quantity;
        if (!product.inStock) product.inStock = true;
        await product.save();
      }
    }

    order.orderStatus = "cancelled";
    await order.save();

    res.json({ success: true, message: "Order cancelled successfully", orderStatus: order.orderStatus });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ error: "Failed to cancel order" });
  }
};

// ------------------------------
// Admin: Get all orders
// ------------------------------
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus } = req.query;
    const filter = {};
    if (status) filter.orderStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate("user", "displayName email")
      .populate("items.product", "name images price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      orders,
      pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / limit), totalOrders: total },
    });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// ------------------------------
// Admin: Update order status
// ------------------------------
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, trackingNumber, estimatedDelivery } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (orderStatus) order.orderStatus = orderStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;

    await order.save();

    res.json({ success: true, message: "Order updated successfully", order });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
};
