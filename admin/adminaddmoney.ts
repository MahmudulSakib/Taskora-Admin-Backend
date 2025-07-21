import express from "express";
import { db } from "../db";
import { addMoneyRequestsTable, walletTable, usersTable } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import passport from "../security/passportconfig";

const adminAddmoney = express.Router();

adminAddmoney.get(
  "/admin/add-money-requests",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    try {
      const requests = await db
        .select({
          id: addMoneyRequestsTable.id,
          paymentMethod: addMoneyRequestsTable.paymentMethod,
          merchantNumber: addMoneyRequestsTable.merchantNumber,
          senderNumber: addMoneyRequestsTable.senderNumber,
          amount: addMoneyRequestsTable.amount,
          status: addMoneyRequestsTable.status,
          createdAt: addMoneyRequestsTable.createdAt,
          user: {
            id: usersTable.id,
            fullName: usersTable.fullName,
            email: usersTable.email,
            mobileNumber: usersTable.mobileNumber,
          },
        })
        .from(addMoneyRequestsTable)
        .leftJoin(usersTable, eq(addMoneyRequestsTable.userId, usersTable.id))
        .orderBy(desc(addMoneyRequestsTable.createdAt));

      return res.json({ requests });
    } catch (err) {
      console.error("Failed to fetch add money requests:", err);
      return res
        .status(500)
        .json({ error: "Server error while fetching requests." });
    }
  }
);

adminAddmoney.post(
  "/admin/add-money-requests/:id/approve",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    const requestId = req.params.id;

    try {
      const request = await db
        .select()
        .from(addMoneyRequestsTable)
        .where(eq(addMoneyRequestsTable.id, requestId))
        .then((rows) => rows[0]);

      if (!request || request.status !== "pending") {
        return res
          .status(400)
          .json({ error: "Invalid or already processed request." });
      }

      await db.transaction(async (tx) => {
        await tx
          .update(addMoneyRequestsTable)
          .set({ status: "accepted" })
          .where(eq(addMoneyRequestsTable.id, requestId));

        const existingWallet = await tx
          .select()
          .from(walletTable)
          .where(eq(walletTable.userId, request.userId))
          .then((rows) => rows[0]);

        const requestAmount = parseFloat(request.amount);

        if (existingWallet) {
          const currentBalance = parseFloat(existingWallet.balance ?? "0");
          const newBalance = (currentBalance + requestAmount).toString();

          await tx
            .update(walletTable)
            .set({ balance: newBalance })
            .where(eq(walletTable.userId, request.userId));
        } else {
          await tx.insert(walletTable).values({
            userId: request.userId,
            balance: requestAmount.toString(),
          });
        }
      });

      res.json({ message: "Request approved and wallet updated." });
    } catch (err) {
      console.error("Error approving request:", err);
      res.status(500).json({ error: "Failed to approve request." });
    }
  }
);

adminAddmoney.post(
  "/admin/add-money-requests/:id/reject",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const requestId = req.params.id;

    try {
      await db
        .update(addMoneyRequestsTable)
        .set({ status: "rejected" })
        .where(eq(addMoneyRequestsTable.id, requestId));

      res.json({ message: "Request rejected successfully." });
    } catch (err) {
      console.error("Error rejecting request:", err);
      res.status(500).json({ error: "Failed to reject request." });
    }
  }
);

export default adminAddmoney;
