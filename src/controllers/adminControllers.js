import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: "delivered" } }, // only completed orders
      { $group: { _id: null, revenue: { $sum: "$totalPrice" } } }
    ]);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue[0]?.revenue || 0
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats", error: err.message });
  }
};

export const getSalesTrends = async (req, res) => {
    try {
      const monthlySales = await Order.aggregate([
        { $match: { status: "delivered" } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            totalRevenue: { $sum: "$totalPrice" },
            totalOrders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
  
      res.json(monthlySales);
    } catch (err) {
      res.status(500).json({ message: "Error fetching sales trends", error: err.message });
    }
  };
  
