import User from "../models/User.js";

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-__v");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      success: true,
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        addresses: user.addresses,
        preferences: user.preferences,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { displayName, phoneNumber, addresses, preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { displayName, phoneNumber, addresses, preferences },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Failed to update user profile" });
  }
};

// Add new address
export const addAddress = async (req, res) => {
  try {
    const { street, city, state, zipCode, country, isDefault } = req.body;

    if (!street || !city || !state || !zipCode || !country)
      return res.status(400).json({ error: "All address fields are required" });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.addresses.length === 0) req.body.isDefault = true;

    if (isDefault) user.addresses.forEach(addr => (addr.isDefault = false));

    user.addresses.push({
      street, city, state, zipCode, country, isDefault: isDefault || false
    });

    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    console.error("Error adding address:", err);
    res.status(500).json({ error: "Failed to add address" });
  }
};

// Update address
export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { street, city, state, zipCode, country, isDefault } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const index = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (index === -1) return res.status(404).json({ error: "Address not found" });

    Object.assign(user.addresses[index], { street, city, state, zipCode, country });

    if (isDefault) {
      user.addresses.forEach((addr, idx) => { if (idx !== index) addr.isDefault = false; });
      user.addresses[index].isDefault = true;
    }

    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    console.error("Error updating address:", err);
    res.status(500).json({ error: "Failed to update address" });
  }
};

// Delete address
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const index = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (index === -1) return res.status(404).json({ error: "Address not found" });

    user.addresses.splice(index, 1);

    // Ensure at least one default address
    if (user.addresses.length > 0 && !user.addresses.some(addr => addr.isDefault))
      user.addresses[0].isDefault = true;

    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    console.error("Error deleting address:", err);
    res.status(500).json({ error: "Failed to delete address" });
  }
};

// Update preferences
export const updatePreferences = async (req, res) => {
  try {
    const { favoriteCategories, newsletter } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.preferences.favoriteCategories = favoriteCategories || [];
    if (newsletter !== undefined) user.preferences.newsletter = newsletter;

    await user.save();
    res.json({ success: true, preferences: user.preferences });
  } catch (err) {
    console.error("Error updating preferences:", err);
    res.status(500).json({ error: "Failed to update preferences" });
  }
};

// Admin: Get all users
export const getAllUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser || currentUser.role !== "admin")
      return res.status(403).json({ error: "Admin access required" });

    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (search) filter.$or = [{ displayName: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(filter).select("-__v").sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await User.countDocuments(filter);

    res.json({ success: true, users, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), totalUsers: total } });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Admin: Update user role
export const updateUserRole = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser || currentUser.role !== "admin")
      return res.status(403).json({ error: "Admin access required" });

    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true, runValidators: true }).select("-__v");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ success: true, user: { id: user._id, displayName: user.displayName, email: user.email, role: user.role } });
  } catch (err) {
    console.error("Error updating user role:", err);
    res.status(500).json({ error: "Failed to update user role" });
  }
};

// Admin: Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser || currentUser.role !== "admin")
      return res.status(403).json({ error: "Admin access required" });

    const { userId } = req.params;
    const user = await User.findById(userId).select("-__v");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// Admin: Delete user
export const deleteUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser || currentUser.role !== "admin")
      return res.status(403).json({ error: "Admin access required" });

    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// Admin: Ban / deactivate user
export const toggleUserActive = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser || currentUser.role !== "admin")
      return res.status(403).json({ error: "Admin access required" });

    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    user.isActive = !user.isActive; // add this field to schema
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user status" });
  }
};
