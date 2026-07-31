// middleware/socketAuthMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectSocket = async (socket, next) => {
  try {
    // Get token from handshake auth
    const token = socket.handshake.auth.token;

    if (!token) {
      console.log("❌ Socket connection denied: No token provided");
      return next(new Error("Authentication error: No token provided"));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      console.log("❌ Socket connection denied: Invalid token");
      return next(new Error("Authentication error: Invalid token"));
    }

    // Find user
    const user = await User.findById(decoded.id).select(
      "-password -loginAttempts -lockUntil",
    );

    if (!user) {
      console.log("❌ Socket connection denied: User not found");
      return next(new Error("Authentication error: User not found"));
    }

    if (!user.isActive) {
      console.log("❌ Socket connection denied: Account inactive");
      return next(new Error("Authentication error: Account inactive"));
    }

    // Attach user to socket
    socket.userId = user._id.toString();
    socket.userRole = user.role;
    socket.user = user;

    console.log(`✅ Socket authenticated: ${user.name} (${user.role})`);
    next();
  } catch (error) {
    console.error("❌ Socket authentication error:", error.message);
    return next(new Error("Authentication error: Invalid token"));
  }
};
