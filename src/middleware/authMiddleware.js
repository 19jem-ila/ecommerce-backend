export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
};

  
// // Generate JWTs
// const accessToken = jwt.sign(
//   { userId: user._id, firebaseUid: user.firebaseUid },
//   process.env.JWT_SECRET,
//   { expiresIn: "15m" }
// );

// const refreshToken = jwt.sign(
//   { userId: user._id, firebaseUid: user.firebaseUid },
//   process.env.JWT_REFRESH_SECRET,
//   { expiresIn: "7d" }
// );


// export const loginUser = async (req, res) => {
//   try {
//     const { uid, email, name, picture } = req.firebaseUser;

//     // Find user in MongoDB
//     let user = await User.findOne({ firebaseUid: uid });

//     if (!user) {
//       // Create new user if doesn't exist
//       user = new User({
//         firebaseUid: uid,
//         email,
//         displayName: name || email.split('@')[0],
//         photoURL: picture || '',
//         emailVerified: true, // Mark verified if Firebase email is verified
//       });
//       await user.save();
//     } else {
//  // Check MongoDB emailVerified
// if (!user.emailVerified) {
//         // Sync MongoDB with Firebase email verification
//         const firebaseUser = req.firebaseUser;
//         if (firebaseUser.email_verified) {
//           user.emailVerified = true;
//         } else {
//           return res.status(403).json({ error: 'Email not verified. Please verify your email first.' });
//         }
//       }

//       // Update last login and profile info
//       user.lastLogin = new Date();
//       if (name) user.displayName = name;
//       if (picture) user.photoURL = picture;
//       await user.save();
//     }

//     // Generate JWTs
// const accessToken = jwt.sign(
//   {
//     userId: user._id,
//     firebaseUid: user.firebaseUid,
//     role: user.isAdmin ? "admin" : "user", // 👈 include role
//   },
//   process.env.JWT_SECRET,
//   { expiresIn: "15m" }
// );

// const refreshToken = jwt.sign(
//   {
//     userId: user._id,
//     firebaseUid: user.firebaseUid,
//     role: user.isAdmin ? "admin" : "user",
//   },
//   process.env.JWT_REFRESH_SECRET,
//   { expiresIn: "7d" }
// );

//     res.json({
//       success: true,
//       user: {
//         id: user._id,
//         firebaseUid: user.firebaseUid,
//         email: user.email,
//         displayName: user.displayName,
//         photoURL: user.photoURL,
//         isAdmin: user.isAdmin,
//         emailVerified: user.emailVerified, 
//       },
//       accessToken,
//       refreshToken,
//     });
//     console.log("acessToken", accessToken)
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ error: 'Login failed', details: error.message });
//   }
// };