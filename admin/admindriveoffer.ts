import express from "express";
import { db } from "../db";
import { driveOffersTable } from "../db/schema";
import { sql, desc } from "drizzle-orm";

const admineDriveOffer = express.Router();

admineDriveOffer.post("/admin/create-drive-offer", async (req, res) => {
  try {
    const { title, isSimType, simType, duration, validation, purchaseAmount } =
      req.body;

    await db.insert(driveOffersTable).values({
      title,
      isSimType,
      simType: isSimType ? simType : null,
      duration,
      validation,
      purchaseAmount,
    });

    res.json({ message: "Drive offer created successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create drive offer." });
  }
});

admineDriveOffer.get("/admin/drive-offers", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const [offers, [{ count }]] = await Promise.all([
      db
        .select()
        .from(driveOffersTable)
        .orderBy(desc(driveOffersTable.createdAt))
        .limit(limit)
        .offset(offset),

      db.select({ count: sql<number>`count(*)` }).from(driveOffersTable),
    ]);

    res.json({ offers, total: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch drive offers." });
  }
});

export default admineDriveOffer;
