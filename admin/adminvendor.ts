// routes/adminVendorShipRequests.ts
import express from "express";
import { db } from "../db";
import { vendorShipTable, usersTable } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import passport from "../security/passportconfig";

const adminVendorShipRequests = express.Router();

adminVendorShipRequests.get(
  "/admin/vendor-requests",
  passport.authenticate("jwt", { session: false }),
  async (_req, res) => {
    try {
      const data = await db
        .select({
          id: vendorShipTable.id,
          shopName: vendorShipTable.shopName,
          shopAddress: vendorShipTable.shopAddress,
          contactNumber: vendorShipTable.contactNumber,
          email: vendorShipTable.email,
          status: vendorShipTable.status,
          createdAt: vendorShipTable.createdAt,
          user: {
            fullName: usersTable.fullName,
            email: usersTable.email,
            mobileNumber: usersTable.mobileNumber,
          },
        })
        .from(vendorShipTable)
        .leftJoin(usersTable, eq(vendorShipTable.userId, usersTable.id))
        .orderBy(desc(vendorShipTable.createdAt));
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch vendor requests" });
    }
  }
);

adminVendorShipRequests.patch(
  "/admin/vendor-requests/status",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    const { id, status } = req.body;
    if (!id || !["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    try {
      await db
        .update(vendorShipTable)
        .set({ status })
        .where(eq(vendorShipTable.id, id));
      res.json({ message: "Status updated" });
    } catch (err) {
      res.status(500).json({ error: "Update failed" });
    }
  }
);

export default adminVendorShipRequests;
