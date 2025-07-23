// routes/admin/adminprofile.ts
import express, { Request, Response } from "express";
import passport from "../security/passportconfig";
import { db } from "../db";
import { adminsTable } from "../db/schema";
import { eq } from "drizzle-orm";

const adminProfile = express.Router();

adminProfile.get(
  "/admin/profile",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: Response) => {
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

export default adminProfile;
