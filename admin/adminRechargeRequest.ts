import express from "express";
import { rechargeTable } from "../db/schema";
import { db } from "../db";
import { usersTable } from "../db/schema";
import { eq, desc } from "drizzle-orm";

const adminGetRechargeRequests = express.Router();

adminGetRechargeRequests.get(
  "/admin/mobile-recharge-requests",
  async (req: any, res: any) => {
    try {
      const requests = await db
        .select({
          id: rechargeTable.id,
          mobileNumber: rechargeTable.mobileNumber,
          operator: rechargeTable.operator,
          simType: rechargeTable.simType,
          amount: rechargeTable.amount,
          status: rechargeTable.status,
          createdAt: rechargeTable.createdAt,
          user: {
            fullName: usersTable.fullName,
            email: usersTable.email,
          },
        })
        .from(rechargeTable)
        .leftJoin(usersTable, eq(rechargeTable.userId, usersTable.id))
        .orderBy(desc(rechargeTable.createdAt));

      res.json(requests);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch recharge requests." });
    }
  }
);

adminGetRechargeRequests.post(
  "/admin/update-mobile-recharge-status",
  async (req: any, res: any) => {
    const { id, status } = req.body;

    if (!["Pending", "Completed", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    await db
      .update(rechargeTable)
      .set({ status })
      .where(eq(rechargeTable.id, id));

    res.json({ message: "Status updated successfully." });
  }
);

export default adminGetRechargeRequests;
