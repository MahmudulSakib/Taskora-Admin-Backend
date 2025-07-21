import express from "express";
import { db } from "../db";
import { usersTable, userRanksTable } from "../db/schema";
import { eq } from "drizzle-orm";

const adminUserRanks = express.Router();

adminUserRanks.get("/admin/user-ranks", async (req, res) => {
  try {
    const users = await db
      .select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        email: usersTable.email,
        mobileNumber: usersTable.mobileNumber,
        rank: userRanksTable.rank,
      })
      .from(usersTable)
      .leftJoin(userRanksTable, eq(usersTable.id, userRanksTable.userId));

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user ranks" });
  }
});

adminUserRanks.post("/admin/user-ranks", async (req: any, res: any) => {
  const { userId, rank } = req.body;

  if (!userId || ![1, 2, 3].includes(rank)) {
    return res.status(400).json({ error: "Invalid rank or user" });
  }

  try {
    const existing = await db
      .select()
      .from(userRanksTable)
      .where(eq(userRanksTable.userId, userId));

    if (existing.length > 0) {
      await db
        .update(userRanksTable)
        .set({ rank })
        .where(eq(userRanksTable.userId, userId));
    } else {
      await db.insert(userRanksTable).values({ userId, rank });
    }

    res.json({ message: "Rank assigned successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to assign rank" });
  }
});

export default adminUserRanks;
