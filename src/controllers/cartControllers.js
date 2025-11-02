
import Cart from "../models/cart.js";
import Product from "../models/Product.js";

// Get current user's cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId }).populate(
      "items.product",
      "name images price stockQuantity"
    );

    if (!cart) {
      return res.status(200).json({ success: true, items: [] });
    }

    res.json({ success: true, items: cart.items });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ success: false, error: "Failed to fetch cart" });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, variant } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      cart = new Cart({ user: req.user.userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        JSON.stringify(item.variant) === JSON.stringify(variant || {})
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, variant });
    }

    await cart.save();
    await cart.populate("items.product", "name images price stockQuantity");

    res.status(200).json({ success: true, items: cart.items });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ success: false, error: "Failed to add item to cart" });
  }
};

// Update item quantity in cart
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    

    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({ success: false, error: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, error: "Item not found in cart" });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    await cart.populate("items.product", "name images price stockQuantity");

    res.json({ success: true, items: cart.items });
  } catch (err) {
    console.error("Error updating cart item:", err);
    res.status(500).json({ success: false, error: "Failed to update cart item" });
  }
};


// Remove item from cart
export const removeCartItem = async (req, res) => {
  try {
    const { productId, variant } = req.body;
    

    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) return res.status(404).json({ success: false, error: "Cart not found" });

    cart.items = cart.items.filter(
      (item) =>
        item.product.toString() !== productId ||
        JSON.stringify(item.variant) !== JSON.stringify(variant || {})
    );

    await cart.save();
    await cart.populate("items.product", "name images price stockQuantity");

    res.json({ success: true, items: cart.items });
  } catch (err) {
    console.error("Error removing cart item:", err);
    res.status(500).json({ success: false, error: "Failed to remove cart item" });
  }
};

// Clear entire cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) return res.status(404).json({ success: false, error: "Cart not found" });

    cart.items = [];
    await cart.save();

    res.json({ success: true, items: [] });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ success: false, error: "Failed to clear cart" });
  }
};
