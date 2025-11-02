import Wishlist from "../models/wishlist.js";
import Product from "../models/Product.js";
import Cart from "../models/cart.js"

export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;



    if (!productId) 
      return res.status(400).json({ success: false, error: "Product ID is required" });

    const product = await Product.findById(productId);
    if (!product) 
      return res.status(404).json({ success: false, error: "Product not found" });

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      // Create a new wishlist with the product
      wishlist = await Wishlist.create({ user: userId, products: [product._id] });
    } else {
      // Convert ObjectIds to strings to compare
      const productIds = wishlist.products.map(p => p.toString());

      if (!productIds.includes(productId)) {
        wishlist.products.push(product._id);
        await wishlist.save();
      } 
      // If already exists, just return wishlist without error
    }

    res.status(200).json({ success: true, wishlist });
  } catch (err) {
    console.error("Error adding to wishlist:", err);
    res.status(500).json({ success: false, error: "Failed to add product to wishlist" });
  }
};
// Remove a product from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) return res.status(404).json({ success: false, error: "Wishlist not found" });

    const index = wishlist.products.indexOf(productId);
    if (index === -1) return res.status(404).json({ success: false, error: "Product not in wishlist" });

    wishlist.products.splice(index, 1);
    await wishlist.save();

    res.status(200).json({ success: true, wishlist });
  } catch (err) {
    console.error("Error removing from wishlist:", err);
    res.status(500).json({ success: false, error: "Failed to remove product from wishlist" });
  }
};

// Get current user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const wishlist = await Wishlist.findOne({ user: userId }).populate("products");

    if (!wishlist) return res.status(404).json({ success: false, error: "Wishlist not found" });

    res.status(200).json({ success: true, wishlist });
  } catch (err) {
    console.error("Error fetching wishlist:", err);
    res.status(500).json({ success: false, error: "Failed to fetch wishlist" });
  }
};


// Move items from wishlist to cart
export const moveToCart = async (req, res) => {
    try {
      const userId = req.user.userId;
      const { productIds } = req.body; // Array of product IDs to move
  
      if (!productIds || productIds.length === 0) {
        return res.status(400).json({ success: false, error: "No products selected" });
      }
  
      // Fetch wishlist
      const wishlist = await Wishlist.findOne({ user: userId });
      if (!wishlist) {
        return res.status(404).json({ success: false, error: "Wishlist not found" });
      }
  
      // Fetch or create user's cart
      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }
  
      // Process each product
      for (const productId of productIds) {
        const product = await Product.findById(productId);
        if (!product || !product.inStock) continue; // Skip unavailable products
  
        // Check if product already in cart
        const existingItem = cart.items.find(item => item.product.toString() === productId);
        if (existingItem) {
          existingItem.quantity += 1; // Increment quantity if already in cart
        } else {
          cart.items.push({ product: product._id, quantity: 1 });
        }
  
        // Remove product from wishlist
        wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
      }
  
      await cart.save();
      await wishlist.save();
  
      res.json({ success: true, message: "Selected items moved to cart", cart, wishlist });
    } catch (err) {
      console.error("Move to cart error:", err);
      res.status(500).json({ success: false, error: "Failed to move items to cart" });
    }
  };