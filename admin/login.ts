import express from "express";
import passport from "../security/passportconfig";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const adminLogin = express.Router();

adminLogin.post("/admin/log-in", (req, res, next) => {
  passport.authenticate(
    "local",
    { session: false },
    (err: any, admin: any, info: any) => {
      if (err) return res.status(500).json({ error: "Server error" });
      if (!admin)
        return res
          .status(400)
          .json({ error: info?.message || "Invalid credentials" });

      const jwtSecret = process.env.JWT_SECRET;

      if (!jwtSecret) {
        console.error("WT_SECRET is missing in environment variables.");
        return res.status(500).json({ error: "Server misconfiguration." });
      }

      const token = jwt.sign({ id: admin.id }, jwtSecret, {
        expiresIn: "6h",
      });

      res.cookie("admintoken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        domain: ".vercel.app",
        maxAge: 6 * 60 * 60 * 1000,
      });

      res.status(200).json({ message: "Logged in successfully" });
    }
  )(req, res, next);
});

export default adminLogin;
