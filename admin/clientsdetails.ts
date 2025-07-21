import express from "express";
import { db } from "../db";
import { usersTable, userBonusWalletTable, walletTable } from "../db/schema";
import { eq, and, like, ilike, or } from "drizzle-orm";
import passport from "../security/passportconfig";

const adminfetchclient = express.Router();

adminfetchclient.get("/admin/user/details", async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const search = (req.query.search as string)?.toLowerCase() || "";

  try {
    const offset = (page - 1) * limit;

    let whereClause = undefined;
    if (search) {
      whereClause = or(
        ilike(usersTable.mobileNumber, `%${search}%`),
        ilike(usersTable.email, `%${search}%`)
      );
    }

    const users = await db
      .select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        email: usersTable.email,
        mobileNumber: usersTable.mobileNumber,
        address: usersTable.address,
        referCode: usersTable.referCode,
        fund: walletTable.balance,
        bonus: userBonusWalletTable.amount,
      })
      .from(usersTable)
      .leftJoin(walletTable, eq(usersTable.id, walletTable.userId))
      .leftJoin(
        userBonusWalletTable,
        eq(usersTable.id, userBonusWalletTable.userId)
      )
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: usersTable.id })
      .from(usersTable)
      .where(whereClause);

    const totalCount = countResult.length;
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: users,
      totalCount,
      totalPages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default adminfetchclient;
