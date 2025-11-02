import Product from "../models/Product.js";
import cloudinary from "../config/cloundinary.js";
import { validationResult } from "express-validator";

// Create a new product (Admin only)
export const createProduct = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    // Upload images to Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products", // optional folder in Cloudinary
        });
        imageUrls.push(result.secure_url);
      }
    }

    // Create product with image URLs
    const product = new Product({
      ...req.body,
      images: imageUrls, // store Cloudinary URLs
    });

    await product.save();

    res.status(201).json({
      success: true,
      data: product,
      message: "Product created successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all products with filtering, search, pagination, and sorting
export const getProducts = async (req, res) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    // Build filter
    const filter = {};
    if (category) filter.category = category;
    if (brand) filter.brand = { $regex: brand, $options: "i" };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Build search query
    let searchQuery = {};
    if (search) searchQuery = { $text: { $search: search } };

    const finalFilter = { ...filter, ...searchQuery };

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const products = await Product.find(finalFilter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Product.countDocuments(finalFilter);

    res.json({
      success: true,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        hasNext: skip + products.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update product (Admin only)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });
    res.json({ success: true, data: product, message: "Product updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete product (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find({ category })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Product.countDocuments({ category });

    res.json({
      success: true,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Search products
export const searchProducts = async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    const products = await Product.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(parseInt(limit))
      .lean();

    res.json({ success: true, products, query });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get featured products
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ rating: { $gte: 4.5 } })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(8)
      .lean();

    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


