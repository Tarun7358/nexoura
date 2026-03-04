const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { db, auth } = require("../services/firebaseService");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const sanitizeGamerTag = (value = "player") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20) || "player";

const generateUniqueGamerTag = async (seed) => {
  let candidate = sanitizeGamerTag(seed);
  let attempts = 0;

  while (attempts < 20) {
    const exists = await db
      .collection("users")
      .where("gamerTag", "==", candidate)
      .limit(1)
      .get();

    if (exists.empty) return candidate;

    candidate = `${sanitizeGamerTag(seed).slice(0, 14)}${Math.floor(1000 + Math.random() * 9000)}`;
    attempts += 1;
  }

  return `player${Date.now().toString().slice(-6)}`;
};

// ================= REGISTER =================

router.post("/register", async (req, res) => {
  try {
    const { gamerTag, username, email, password, gamingUID } = req.body;
    const finalUsername = username || gamerTag;

    if (!finalUsername || !email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    // Check existing email
    const emailSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (!emailSnapshot.empty) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check existing gamerTag
    const gamerTagSnapshot = await db
      .collection("users")
      .where("gamerTag", "==", finalUsername)
      .get();

    if (!gamerTagSnapshot.empty) {
      return res.status(400).json({ message: "GamerTag already taken" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userRef = db.collection("users").doc();

    const userData = {
      username: finalUsername,
      gamerTag: finalUsername,
      email,
      profileImage: null,
      gamingUID: gamingUID || "",
      password: hashedPassword,
      provider: "password",
      balance: 100,
      tournamentsJoined: 0,
      wins: 0,
      kills: 0,
      earnings: 0,
      stats: {
        wins: 0,
        matches: 0,
        points: 0,
      },
      role: "user",
      createdAt: new Date(),
    };

    await userRef.set(userData);

    // Create wallet
    const walletRef = db.collection("wallets").doc(userRef.id);

    await walletRef.set({
      userId: userRef.id,
      balance: 100,
      createdAt: new Date(),
    });

    const token = generateToken(userRef.id);

    res.status(201).json({
      token,
      userId: userRef.id,
      user: {
        id: userRef.id,
        username: finalUsername,
        gamerTag: finalUsername,
        email,
        gamingUID: gamingUID || "",
        balance: 100,
        walletId: walletRef.id,
        role: "user",
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= LOGIN =================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const snapshot = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    if (!user.password) {
      return res.status(401).json({ message: "This account uses Google login" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(userDoc.id);

    res.json({
      token,
      userId: userDoc.id,
      user: {
        id: userDoc.id,
        username: user.username || user.gamerTag,
        gamerTag: user.gamerTag,
        email: user.email,
        gamingUID: user.gamingUID || "",
        tournamentsJoined: Number(user.tournamentsJoined || 0),
        wins: Number(user.wins || 0),
        kills: Number(user.kills || 0),
        earnings: Number(user.earnings || 0),
        balance: user.balance,
        stats: user.stats,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= GOOGLE LOGIN =================

router.post("/google-login", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Missing Google ID token" });
    }

    if (!auth) {
      return res.status(500).json({ message: "Firebase Auth is not configured on backend" });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    if (!uid || !email) {
      return res.status(400).json({ message: "Invalid Google token payload" });
    }

    const userRef = db.collection("users").doc(uid);
    const existingUser = await userRef.get();

    let userData;

    if (!existingUser.exists) {
      const baseName = decodedToken.name || email.split("@")[0] || "player";
      const gamerTag = await generateUniqueGamerTag(baseName);

      userData = {
        username: gamerTag,
        gamerTag,
        email,
        profileImage: decodedToken.picture || null,
        gamingUID: "",
        provider: "google",
        balance: 100,
        tournamentsJoined: 0,
        wins: 0,
        kills: 0,
        earnings: 0,
        stats: {
          wins: 0,
          matches: 0,
          points: 0,
        },
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await userRef.set(userData);

      await db.collection("wallets").doc(uid).set({
        userId: uid,
        balance: 100,
        createdAt: new Date(),
      });
    } else {
      userData = existingUser.data();

      const walletRef = db.collection("wallets").doc(uid);
      const walletDoc = await walletRef.get();
      if (!walletDoc.exists) {
        await walletRef.set({
          userId: uid,
          balance: userData.balance ?? 100,
          createdAt: new Date(),
        });
      }

      await userRef.update({
        profileImage: decodedToken.picture || userData.profileImage || null,
        updatedAt: new Date(),
      });
    }

    const token = generateToken(uid);

    res.json({
      token,
      userId: uid,
      user: {
        id: uid,
        username: userData.username || userData.gamerTag,
        gamerTag: userData.gamerTag,
        email,
        profileImage: decodedToken.picture || userData.profileImage || null,
        gamingUID: userData.gamingUID || "",
        tournamentsJoined: Number(userData.tournamentsJoined || 0),
        wins: Number(userData.wins || 0),
        kills: Number(userData.kills || 0),
        earnings: Number(userData.earnings || 0),
        balance: userData.balance ?? 100,
        stats: userData.stats || { wins: 0, matches: 0, points: 0 },
        role: userData.role || "user",
      },
    });
  } catch (err) {
    res.status(401).json({ message: err.message || "Google authentication failed" });
  }
});

// ================= GET USER =================

router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const doc = await db.collection("users").doc(req.params.userId).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = doc.data();
    delete user.password;

    res.json({
      id: doc.id,
      ...user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= UPDATE USER =================

router.put("/:userId", authMiddleware, async (req, res) => {
  try {
    if (req.userId !== req.params.userId && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { gamerTag, username, profileImage, gamingUID, avatar, phone } = req.body;

    const userRef = db.collection("users").doc(req.params.userId);

    await userRef.update({
      gamerTag: gamerTag || username,
      username: username || gamerTag,
      profileImage: profileImage || avatar || null,
      gamingUID: gamingUID || "",
      phone,
      updatedAt: new Date(),
    });

    const updatedUser = await userRef.get();

    res.json({
      id: updatedUser.id,
      ...updatedUser.data(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= LEADERBOARD =================

router.get("/", async (req, res) => {
  try {
    const snapshot = await db
      .collection("users")
      .orderBy("stats.points", "desc")
      .limit(50)
      .get();

    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      password: undefined,
    }));

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
