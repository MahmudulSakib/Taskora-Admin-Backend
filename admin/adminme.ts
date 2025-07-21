import express from "express";
import passport from "../security/passportconfig";

const adminMe = express.Router();

adminMe.get(
  "/admin/me",
  (req, res, next) => {
    console.log("🔍 Request cookies:", req.cookies);
    next();
  },
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log("✅ Authenticated admin:", req.user);
    res.json({ admin: req.user });
  }
);

export default adminMe;
