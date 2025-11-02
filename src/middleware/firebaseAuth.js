import admin from '../config/firebase.js'; // Firebase Admin initialized here

export const verifyFirebaseToken = async (req, res, next) => {
  const token =req.headers.authorization?.split(' ')[1] || req.body.idToken;
 


  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    if (!decodedToken.email_verified) {
      return res.status(403).json({ error: "Email not verified. Please verify your email before continuing." });
    }

    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error("Firebase token verification error:", error);
    res.status(401).json({ error: "Invalid Firebase token" });
  }
};
