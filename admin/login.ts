import express from "express";
import passport from "../security/passportconfig";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { adminsTable } from "../db/schema";

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
        maxAge: 6 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: "Login successful",
        user: {
          id: admin.id,
          email: admin.email,
        },
      });
    }
  )(req, res, next);
});

adminLogin.get(
  "/admin/profile",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    try {
      const adminId = req.user.id;

      const result = await db
        .select()
        .from(adminsTable)
        .where(eq(adminsTable.id, adminId));

      const admin = result[0];

      if (!admin) return res.status(404).json({ error: "Admin not found" });

      res.json({ admin });
    } catch (error) {
      console.error("Admin profile error:", error);
      res.status(500).json({ error: "Failed to fetch admin profile" });
    }
  }
);

export default adminLogin;
