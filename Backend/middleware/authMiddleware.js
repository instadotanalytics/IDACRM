// middleware/authMiddleware.js - COMPLETE FIXED VERSION
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    console.log("🔴 No token provided");
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔐 Token decoded for user ID:", decoded.id);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("🔴 User not found for ID:", decoded.id);
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      console.log("🔴 User account is inactive:", user.email);
      return res.status(401).json({
        success: false,
        message: "Account is inactive",
      });
    }

    console.log("✅ User authenticated:", user.email, "Role:", user.role);
    req.user = user;
    next();
  } catch (error) {
    console.error("🔴 Auth error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

export const superAdminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  if (req.user?.role === "super_admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Super admin access required",
    });
  }
};

// ✅ FIX: authorize() now accepts EITHER call style:
//    authorize("super_admin", "admin_manager")   <- spread args
//    authorize(["super_admin", "admin_manager"]) <- single array
// Previously, passing an array as a single argument with rest params
// produced roles = [["super_admin", ...]] (an array nested inside the
// array), so roles.includes(req.user.role) was ALWAYS false -> every
// request got a 403, regardless of the user's actual role.
export const authorize = (...roles) => {
  // Flatten in case someone passed an array instead of spreading it
  const allowedRoles = roles.flat();

  return (req, res, next) => {
    if (!req.user) {
      console.log("🔴 No user object found in request");
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    console.log("🔐 Authorization check:");
    console.log("  👤 User role:", req.user.role);
    console.log("  📋 Allowed roles:", allowedRoles);
    console.log("  ✅ Is allowed:", allowedRoles.includes(req.user.role));

    if (!allowedRoles.includes(req.user.role)) {
      console.log(`🔴 Access denied for role: ${req.user.role}`);
      return res.status(403).json({
        success: false,
        message: `Access denied. ${req.user.role} cannot access this resource`,
      });
    }

    console.log("✅ Authorization granted for role:", req.user.role);
    next();
  };
};

export const adminManagerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  if (req.user?.role === "admin_manager" || req.user?.role === "super_admin") {
    next();
  } else {
    res
      .status(403)
      .json({ success: false, message: "Admin manager access required" });
  }
};

export const salesOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  if (
    req.user?.role === "sales_executive" ||
    req.user?.role === "admin_manager" ||
    req.user?.role === "super_admin"
  ) {
    next();
  } else {
    res.status(403).json({ success: false, message: "Sales access required" });
  }
};

export const hrOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  if (
    req.user?.role === "hr_executive" ||
    req.user?.role === "admin_manager" ||
    req.user?.role === "super_admin"
  ) {
    next();
  } else {
    res.status(403).json({ success: false, message: "HR access required" });
  }
};

export const trainerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  if (
    req.user?.role === "trainer" ||
    req.user?.role === "admin_manager" ||
    req.user?.role === "super_admin"
  ) {
    next();
  } else {
    res
      .status(403)
      .json({ success: false, message: "Trainer access required" });
  }
};

export const counselorOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  if (
    req.user?.role === "counselor" ||
    req.user?.role === "admin_manager" ||
    req.user?.role === "super_admin"
  ) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Counselor access required",
    });
  }
};
