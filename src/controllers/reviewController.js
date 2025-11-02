import Review from "../models/review.js";
import Product from "../models/Product.js";

// Add or update a review
export const addOrUpdateReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.userId;

    if (!productId || !rating) {
      return res.status(400).json({ success: false, error: "Product and rating are required" });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    // Create or update review
    let review = await Review.findOne({ user: userId, product: productId });
    if (review) {
      review.rating = rating;
      review.comment = comment || "";
      await review.save();
    } else {
      review = await Review.create({ user: userId, product: productId, rating, comment });
    }

    // Update product rating
    await Review.updateProductRating(productId);

    res.status(200).json({ success: true, review });
  } catch (err) {
    console.error("Error adding/updating review:", err);
    res.status(500).json({ success: false, error: "Failed to add/update review" });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    const review = await Review.findOne({ _id: reviewId, user: userId });
    if (!review) return res.status(404).json({ success: false, error: "Review not found" });

    await Review.findByIdAndDelete(reviewId);

    // Update product rating
    await Review.updateProductRating(review.product);

    res.json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ success: false, error: "Failed to delete review" });
  }
};

// Get all reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate("user", "displayName email")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (err) {
    console.error("Error fetching product reviews:", err);
    res.status(500).json({ success: false, error: "Failed to fetch reviews" });
  }
};

// Get current user's review for a product
export const getUserReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    const review = await Review.findOne({ product: productId, user: userId });
    res.json({ success: true, review });
  } catch (err) {
    console.error("Error fetching user review:", err);
    res.status(500).json({ success: false, error: "Failed to fetch review" });
  }
};
