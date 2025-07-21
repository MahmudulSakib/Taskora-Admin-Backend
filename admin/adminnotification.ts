import express from "express";
import { db } from "../db";
import { notificationsTable } from "../db/schema";
import { desc, eq } from "drizzle-orm";
import passport from "../security/passportconfig";

const adminNotifications = express.Router();

adminNotifications.get(
  "/admin/notifications",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const data = await db
        .select()
        .from(notificationsTable)
        .orderBy(desc(notificationsTable.createdAt));
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  }
);

adminNotifications.post(
  "/admin/notifications",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    const { description } = req.body;
    if (!description)
      return res.status(400).json({ error: "Description is required" });

    try {
      const result = await db
        .insert(notificationsTable)
        .values({ description });
      res.json({ message: "Notification posted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to post notification" });
    }
  }
);

adminNotifications.delete(
  "/admin/notifications/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { id } = req.params;
    try {
      await db.delete(notificationsTable).where(eq(notificationsTable.id, id));
      res.json({ message: "Deleted" });
    } catch {
      res.status(500).json({ error: "Failed to delete notification" });
    }
  }
);

export default adminNotifications;
