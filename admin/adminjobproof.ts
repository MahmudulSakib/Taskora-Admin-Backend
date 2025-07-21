import express from "express";
import { db } from "../db";
import {
  jobProofsTable,
  userBonusWalletTable,
  usersTable,
  jobPostRequestsTable,
} from "../db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const adminjobproof = express.Router();

adminjobproof.get("/admin/job-proofs", async (req, res) => {
  try {
    const results = await db
      .select({
        id: jobProofsTable.id,
        jobId: jobProofsTable.jobId,
        userId: jobProofsTable.userId,
        imageUrls: jobProofsTable.imageUrls,
        status: jobProofsTable.status,
        user: {
          fullName: usersTable.fullName,
          email: usersTable.email,
          mobileNumber: usersTable.mobileNumber,
        },
        job: {
          title: jobPostRequestsTable.title,
          link: jobPostRequestsTable.link,
          limit: jobPostRequestsTable.limit,
          costPerLimit: jobPostRequestsTable.costPerLimit,
          leftLimit: jobPostRequestsTable.leftLimit,
        },
      })
      .from(jobProofsTable)
      .leftJoin(usersTable, eq(usersTable.id, jobProofsTable.userId))
      .leftJoin(
        jobPostRequestsTable,
        eq(jobPostRequestsTable.id, jobProofsTable.jobId)
      )
      .orderBy(desc(jobProofsTable.submittedAt));

    res.json(results);
  } catch (err) {
    console.error("Error fetching job proofs:", err);
    res.status(500).json({ error: "Failed to fetch job proofs." });
  }
});

adminjobproof.post(
  "/admin/job-proofs/:id/action",
  async (req: any, res: any) => {
    const { status, bonusAmount } = req.body;
    const proofId = req.params.id;

    try {
      const proof = await db
        .select({
          id: jobProofsTable.id,
          userId: jobProofsTable.userId,
          jobId: jobProofsTable.jobId,
        })
        .from(jobProofsTable)
        .where(eq(jobProofsTable.id, proofId));

      if (!proof.length) {
        return res.status(404).json({ error: "Proof not found" });
      }

      const { userId, jobId } = proof[0];

      const job = await db
        .select({ leftLimit: jobPostRequestsTable.leftLimit })
        .from(jobPostRequestsTable)
        .where(eq(jobPostRequestsTable.id, jobId));

      if (!job.length) {
        return res.status(404).json({ error: "Related job not found." });
      }

      const leftLimit = job[0].leftLimit ?? 0;

      if (status === "accepted" && leftLimit <= 0) {
        return res.status(400).json({ error: "Job has no remaining limit." });
      }

      await db
        .update(jobProofsTable)
        .set({ status })
        .where(eq(jobProofsTable.id, proofId));

      if (status === "accepted") {
        await db
          .update(jobPostRequestsTable)
          .set({
            leftLimit: sql`${jobPostRequestsTable.leftLimit} - 1`,
          })
          .where(eq(jobPostRequestsTable.id, jobId));

        if (bonusAmount && parseFloat(bonusAmount) > 0) {
          const existing = await db
            .select()
            .from(userBonusWalletTable)
            .where(eq(userBonusWalletTable.userId, userId));

          const amountToAdd = parseFloat(bonusAmount);

          if (existing.length > 0) {
            const updated = parseFloat(existing[0].amount || "0") + amountToAdd;

            await db
              .update(userBonusWalletTable)
              .set({ amount: updated.toFixed(2) })
              .where(eq(userBonusWalletTable.userId, userId));
          } else {
            await db.insert(userBonusWalletTable).values({
              id: uuidv4(),
              userId,
              amount: bonusAmount,
            });
          }
        }
      }

      res.json({ message: "Proof handled successfully." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Action failed." });
    }
  }
);

export default adminjobproof;
