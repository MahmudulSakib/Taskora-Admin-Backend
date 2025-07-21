import express from "express";
import { db } from "../db";
import {
  quizzesTable,
  quizSubmissionsTable,
  userBonusWalletTable,
  usersTable,
} from "../db/schema";
import { eq, desc } from "drizzle-orm";
import passport from "../security/passportconfig";

const adminQuiz = express.Router();

adminQuiz.post(
  "/admin/post-quiz",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { question, optionA, optionB, optionC, optionD, correctAnswer } =
      req.body;
    await db
      .insert(quizzesTable)
      .values({ question, optionA, optionB, optionC, optionD, correctAnswer });
    res.json({ message: "Quiz created" });
  }
);

adminQuiz.get(
  "/admin/submitted-answers",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const results = await db.select().from(quizSubmissionsTable);
    res.json(results);
  }
);

adminQuiz.post(
  "/admin/approve-quiz",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    const { submissionId, bonusAmount } = req.body;

    const submission = await db
      .select()
      .from(quizSubmissionsTable)
      .where(eq(quizSubmissionsTable.id, submissionId));

    if (!submission.length)
      return res.status(404).json({ error: "Submission not found" });

    const { userId } = submission[0];
    await db
      .insert(userBonusWalletTable)
      .values({ userId, amount: bonusAmount });
    await db
      .update(quizSubmissionsTable)
      .set({ status: "approved", bonusAmount })
      .where(eq(quizSubmissionsTable.id, submissionId));

    res.json({ message: "Approved and bonus sent" });
  }
);

adminQuiz.get(
  "/admin/all-quizzes",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const total = await db.select().from(quizzesTable);
    const quizzes = await db
      .select()
      .from(quizzesTable)
      .orderBy(desc(quizzesTable.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      data: quizzes,
      total: total.length,
      page,
      totalPages: Math.ceil(total.length / limit),
    });
  }
);

adminQuiz.delete(
  "/admin/delete-quiz/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { id } = req.params;
    await db.delete(quizzesTable).where(eq(quizzesTable.id, id));
    res.json({ message: "Deleted" });
  }
);

adminQuiz.get(
  "/admin/quiz-submissions",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const all = await db.select().from(quizSubmissionsTable);

    const paginated = await db
      .select({
        id: quizSubmissionsTable.id,
        selectedAnswer: quizSubmissionsTable.selectedAnswer,
        correctAnswer: quizzesTable.correctAnswer,
        status: quizSubmissionsTable.status,
        bonusAmount: quizSubmissionsTable.bonusAmount,
        userName: usersTable.fullName,
        userEmail: usersTable.email,
        userMobileNo: usersTable.mobileNumber,
        quizQuestion: quizzesTable.question,
      })
      .from(quizSubmissionsTable)
      .leftJoin(usersTable, eq(quizSubmissionsTable.userId, usersTable.id))
      .leftJoin(quizzesTable, eq(quizSubmissionsTable.quizId, quizzesTable.id))
      .orderBy(desc(quizSubmissionsTable.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      data: paginated,
      totalPages: Math.ceil(all.length / limit),
    });
  }
);

adminQuiz.post(
  "/admin/quiz-submissions/:id/action",
  passport.authenticate("jwt", { session: false }),
  async (req: any, res: any) => {
    const { id } = req.params;
    const { status, bonusAmount } = req.body;

    const submission = await db
      .select()
      .from(quizSubmissionsTable)
      .where(eq(quizSubmissionsTable.id, id));

    if (!submission.length)
      return res.status(404).json({ error: "Submission not found" });

    const { userId } = submission[0];

    await db
      .update(quizSubmissionsTable)
      .set({ status, bonusAmount })
      .where(eq(quizSubmissionsTable.id, id));

    if (status === "accepted" && bonusAmount) {
      const existingWallet = await db
        .select()
        .from(userBonusWalletTable)
        .where(eq(userBonusWalletTable.userId, userId));

      if (existingWallet.length) {
        const total =
          parseFloat(existingWallet[0].amount || "0") + parseFloat(bonusAmount);
        await db
          .update(userBonusWalletTable)
          .set({ amount: total.toString(), updatedAt: new Date() })
          .where(eq(userBonusWalletTable.userId, userId));
      } else {
        await db.insert(userBonusWalletTable).values({
          userId,
          amount: bonusAmount,
        });
      }
    }

    res.json({ message: "Updated successfully" });
  }
);

export default adminQuiz;

// // /client/quiz.ts
// import express from "express";
// import { db } from "../db";
// import { quizzesTable, quizSubmissionsTable } from "../db/schema";
// import { eq, and } from "drizzle-orm";

// const clientQuiz = express.Router();

// clientQuiz.get("/client/quiz-today", async (req, res) => {
//   const userId = req.user.id;
//   const quiz = await db.select().from(quizzesTable).orderBy(quizzesTable.createdAt).limit(1);
//   const submitted = await db
//     .select()
//     .from(quizSubmissionsTable)
//     .where(and(eq(quizSubmissionsTable.userId, userId), eq(quizSubmissionsTable.quizId, quiz[0]?.id)));

//   if (submitted.length) return res.status(403).json({ error: "Already submitted" });
//   return res.json(quiz[0]);
// });

// clientQuiz.post("/client/submit-quiz", async (req, res) => {
//   const { quizId, selectedAnswer } = req.body;
//   const userId = req.user.id;

//   const exists = await db
//     .select()
//     .from(quizSubmissionsTable)
//     .where(and(eq(quizSubmissionsTable.userId, userId), eq(quizSubmissionsTable.quizId, quizId)));

//   if (exists.length) return res.status(400).json({ error: "Already submitted!" });

//   await db.insert(quizSubmissionsTable).values({ userId, quizId, selectedAnswer });
//   res.json({ message: "Submitted" });
// });

// export default clientQuiz;
