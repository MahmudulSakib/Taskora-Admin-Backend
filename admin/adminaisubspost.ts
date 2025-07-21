import express from "express";
import { db } from "../db";
import {
  aiSubscriptionsTable,
  userAiSubscriptionsTable,
  usersTable,
} from "../db/schema";
import { eq, desc } from "drizzle-orm";
import passport from "../security/passportconfig";

const adminAiSubs = express.Router();

adminAiSubs.get(
  "/admin/ai-subscriptions",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const data = await db
        .select()
        .from(aiSubscriptionsTable)
        .orderBy(desc(aiSubscriptionsTable.createdAt));
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch plans" });
    }
  }
);

adminAiSubs.post("/admin/ai-subscriptions", async (req: any, res: any) => {
  const { title, description, duration, price } = req.body;

  if (!title || !description || !duration || !price) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    await db.insert(aiSubscriptionsTable).values({
      title,
      description,
      duration: parseInt(duration),
      price,
    });

    res.json({ message: "Plan created" });
  } catch (err) {
    res.status(500).json({ error: "Failed to create plan" });
  }
});

adminAiSubs.delete("/admin/ai-subscriptions/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db
      .delete(aiSubscriptionsTable)
      .where(eq(aiSubscriptionsTable.id, id));

    res.json({ message: "Plan deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete plan" });
  }
});

adminAiSubs.get("/admin/ai-subscription-requests", async (req, res) => {
  try {
    const subscriptions = await db
      .select({
        id: userAiSubscriptionsTable.id,
        status: userAiSubscriptionsTable.status,
        subscribedAt: userAiSubscriptionsTable.subscribedAt,
        email: userAiSubscriptionsTable.email,
        mobileNumber: userAiSubscriptionsTable.mobileNumber,
        user: {
          id: usersTable.id,
          fullName: usersTable.fullName,
        },
        plan: {
          title: aiSubscriptionsTable.title,
          price: aiSubscriptionsTable.price,
          duration: aiSubscriptionsTable.duration,
        },
      })
      .from(userAiSubscriptionsTable)
      .leftJoin(usersTable, eq(userAiSubscriptionsTable.userId, usersTable.id))
      .leftJoin(
        aiSubscriptionsTable,
        eq(userAiSubscriptionsTable.planId, aiSubscriptionsTable.id)
      )
      .orderBy(desc(userAiSubscriptionsTable.subscribedAt));

    res.json(subscriptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
});

adminAiSubs.patch(
  "/admin/ai-subscription-status/:id",
  async (req: any, res: any) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    try {
      await db
        .update(userAiSubscriptionsTable)
        .set({ status })
        .where(eq(userAiSubscriptionsTable.id, id));

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update status" });
    }
  }
);

export default adminAiSubs;
