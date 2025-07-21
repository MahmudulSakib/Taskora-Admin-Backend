// routes/admin/bonusWithdraw.ts
import express from "express";
import { db } from "../db";
import { bonusWithdrawRequestsTable, usersTable } from "../db/schema";
import { eq, desc } from "drizzle-orm";

const adminBonusWithdraw = express.Router();

adminBonusWithdraw.get("/admin/bonus-withdraw-requests", async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 50;
  const offset = (page - 1) * limit;

  const data = await db
    .select({
      id: bonusWithdrawRequestsTable.id,
      amount: bonusWithdrawRequestsTable.amount,
      method: bonusWithdrawRequestsTable.method,
      status: bonusWithdrawRequestsTable.status,
      mobileNumber: bonusWithdrawRequestsTable.mobileNumber,
      mobileBankType: bonusWithdrawRequestsTable.mobileBankType,
      accountNumber: bonusWithdrawRequestsTable.accountNumber,
      branchName: bonusWithdrawRequestsTable.branchName,
      accountName: bonusWithdrawRequestsTable.accountName,
      bankName: bonusWithdrawRequestsTable.bankName,
      createdAt: bonusWithdrawRequestsTable.createdAt,
      user: {
        fullName: usersTable.fullName,
        email: usersTable.email,
      },
    })
    .from(bonusWithdrawRequestsTable)
    .leftJoin(usersTable, eq(bonusWithdrawRequestsTable.userId, usersTable.id))
    .orderBy(desc(bonusWithdrawRequestsTable.createdAt))
    .limit(limit + 1)
    .offset(offset);

  const hasNext = data.length > limit;
  res.json({ requests: data.slice(0, limit), hasNext });
});

adminBonusWithdraw.post(
  "/admin/bonus-withdraw-requests/:id/update",
  async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    await db
      .update(bonusWithdrawRequestsTable)
      .set({ status })
      .where(eq(bonusWithdrawRequestsTable.id, id));

    res.json({ message: "Status updated" });
  }
);

export default adminBonusWithdraw;
