import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { addToBlacklist } from '../middleware/jwtAuth.js';
import admin from '../config/firebase.js';
import { 
  sendVerificationEmail, 
  sendPasswordResetEmail 
} from '../services/emaiService.js';

// 🔹 Register (with email verification)
export const registerUser = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
      emailVerified: false,
    });

    const actionCodeSettings = {
      url: `${process.env.FRONTEND_URL}/verify-email?uid=${userRecord.uid}`,
      handleCodeInApp: true,
    };
    const verificationLink = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);

    await sendVerificationEmail(email, verificationLink);

    const user = new User({
      firebaseUid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || email.split('@')[0],
      emailVerified: false,
    });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      user: { id: user._id, email: user.email, displayName: user.displayName },
    });
  } catch (error) {
    console.error("❌ Register error:", error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "uid is required" });
    }

    // Get user from Firebase
    const userRecord = await admin.auth().getUser(uid);

    if (!userRecord) {
      return res.status(404).json({ error: "User not found in Firebase" });
    }

    const email = userRecord.email;

    // If not already verified, update it
    if (!userRecord.emailVerified) {
      await admin.auth().updateUser(uid, { emailVerified: true });
    }

    // Update MongoDB user to mark emailVerified
    await User.findOneAndUpdate({ email }, { emailVerified: true });

    res.json({ success: true, message: "Email verified successfully" });

  } catch (error) {
    console.error("❌ Email verification failed:", error);
    res.status(500).json({
      error: "Email verification failed",
      details: error.message,
    });
  }
};



// 🔹 Resend verification email
export const resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.emailVerified) return res.status(400).json({ error: "Email already verified" });

    const actionCodeSettings = {
      url: `${process.env.FRONTEND_URL}/verify-email`, // Firebase will append ?oobCode automatically
      handleCodeInApp: true,
    };

    const verificationLink = await admin.auth().generateEmailVerificationLink(
      user.email,
      actionCodeSettings
    );

    await sendVerificationEmail(user.email, verificationLink);

    res.json({ success: true, message: "Verification email resent" });
  } catch (error) {
    console.error("❌ Failed to resend verification email:", error);
    res.status(500).json({ error: "Failed to resend verification email", details: error.message });
  }
};

// 🔹 Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const resetLink = await admin.auth().generatePasswordResetLink(email);
    await sendPasswordResetEmail(email, resetLink);

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send password reset', details: error.message });
  }
};

// 🔹 Reset password (via Firebase)
export const resetPassword = async (req, res) => {
  try {
    const { oobCode, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    await admin.auth().confirmPasswordReset(oobCode, newPassword);

    // ✅ Instead of JSON, redirect to login page with success message
    return res.redirect("/login?reset=success");
  } catch (error) {
    res.status(500).json({ error: "Failed to reset password", details: error.message });
  }
};


// 🔹 Change password (authenticated)
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const uid = req.user.firebaseUid;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // ✅ Re-authenticate user with old password
    const user = await admin.auth().getUser(uid);
    const email = user.email;

    try {
      // Sign in again with old password to verify
      await firebase.auth().signInWithEmailAndPassword(email, oldPassword);
    } catch {
      return res.status(401).json({ error: "Old password is incorrect" });
    }

    // ✅ Update password
    await admin.auth().updateUser(uid, { password: newPassword });

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to change password", details: error.message });
  }
};




// 🔹 Login / Register (Google or Firebase token login)

export const loginUser = async (req, res) => {
  try {
    const { uid, email, name, picture } = req.firebaseUser;

    // Find user in MongoDB
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        firebaseUid: uid,
        email,
        displayName: name || email.split('@')[0],
        photoURL: picture || '',
        emailVerified: true, // Mark verified if Firebase email is verified
        role: "customer",    // 👈 default role
      });
      await user.save();
    } else {
      // Check MongoDB emailVerified
      if (!user.emailVerified) {
        const firebaseUser = req.firebaseUser;
        if (firebaseUser.email_verified) {
          user.emailVerified = true;
        } else {
          return res
            .status(403)
            .json({ error: "Email not verified. Please verify your email first." });
        }
      }

      // Update last login and profile info
      user.lastLogin = new Date();
      if (name) user.displayName = name;
      if (picture) user.photoURL = picture;
      await user.save();
    }

    // 🔑 Generate JWTs with role
    const accessToken = jwt.sign(
      {
        userId: user._id,
        firebaseUid: user.firebaseUid,
        role: user.role, // 👈 use role directly
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      {
        userId: user._id,
        firebaseUid: user.firebaseUid,
        role: user.role,
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.role,                 // 👈 send role to frontend
        emailVerified: user.emailVerified,
      },
      accessToken,
      refreshToken,
    });

    console.log("✅ accessToken payload:", {
      userId: user._id,
      role: user.role,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};


// 🔹 Get profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-__v');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ success: true, user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// 🔹 Update profile
export const updateProfile = async (req, res) => {
  try {
    const { displayName, phoneNumber, addresses, preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { displayName, phoneNumber, addresses, preferences },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ success: true, user });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Profile update failed' });
  }
};

// 🔹 Logout with blacklist
export const logoutUser = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      const expiresInSeconds = decoded.exp - Math.floor(Date.now() / 1000);
      addToBlacklist(token, expiresInSeconds);
    }
  }

  res.json({ success: true, message: 'Logged out successfully' });
};

// 🔹 Create Admin
export const createAdmin = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Check if any admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    // Only existing admins can create a new admin
    if (!req.user || req.user.role !== 'admin') {
      if (adminExists) {
        return res.status(403).json({ error: 'Only existing admins can create new admins' });
      }
      // If no admin exists yet, allow creation (first admin)
    }

    // Create user in Firebase
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
      emailVerified: true,
    });

    // Save to MongoDB
    const user = new User({
      firebaseUid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || email.split('@')[0],
      role: 'admin',       // <-- only role now
      emailVerified: true,
    });
    await user.save();

    // Create JWT
    const token = jwt.sign(
      { userId: user._id, firebaseUid: user.firebaseUid, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ success: true, user, token });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Admin creation failed', details: error.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body; // read from request body
    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token provided" });
    }

    // Verify the refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({ error: "Invalid or expired refresh token" });
    }

    // Find the user
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Issue a new access token
    const accessToken = jwt.sign(
      { userId: user._id, firebaseUid: user.firebaseUid },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // short-lived access token
    );

    res.json({ success: true, accessToken });

  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ error: "Failed to refresh token", details: error.message });
  }
};