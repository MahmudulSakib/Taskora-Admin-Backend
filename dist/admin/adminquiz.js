"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const adminQuiz = express_1.default.Router();
adminQuiz.post("/admin/post-quiz", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { question, optionA, optionB, optionC, optionD, correctAnswer } = req.body;
    yield db_1.db
        .insert(schema_1.quizzesTable)
        .values({ question, optionA, optionB, optionC, optionD, correctAnswer });
    res.json({ message: "Quiz created" });
}));
adminQuiz.get("/admin/submitted-answers", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield db_1.db.select().from(schema_1.quizSubmissionsTable);
    res.json(results);
}));
adminQuiz.post("/admin/approve-quiz", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { submissionId, bonusAmount } = req.body;
    const submission = yield db_1.db
        .select()
        .from(schema_1.quizSubmissionsTable)
        .where((0, drizzle_orm_1.eq)(schema_1.quizSubmissionsTable.id, submissionId));
    if (!submission.length)
        return res.status(404).json({ error: "Submission not found" });
    const { userId } = submission[0];
    yield db_1.db.insert(schema_1.userBonusWalletTable).values({ userId, amount: bonusAmount });
    yield db_1.db
        .update(schema_1.quizSubmissionsTable)
        .set({ status: "approved", bonusAmount })
        .where((0, drizzle_orm_1.eq)(schema_1.quizSubmissionsTable.id, submissionId));
    res.json({ message: "Approved and bonus sent" });
}));
adminQuiz.get("/admin/all-quizzes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const total = yield db_1.db.select().from(schema_1.quizzesTable);
    const quizzes = yield db_1.db
        .select()
        .from(schema_1.quizzesTable)
        .orderBy((0, drizzle_orm_1.desc)(schema_1.quizzesTable.createdAt))
        .limit(limit)
        .offset(offset);
    res.json({
        data: quizzes,
        total: total.length,
        page,
        totalPages: Math.ceil(total.length / limit),
    });
}));
adminQuiz.delete("/admin/delete-quiz/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield db_1.db.delete(schema_1.quizzesTable).where((0, drizzle_orm_1.eq)(schema_1.quizzesTable.id, id));
    res.json({ message: "Deleted" });
}));
adminQuiz.get("/admin/quiz-submissions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const all = yield db_1.db.select().from(schema_1.quizSubmissionsTable);
    const paginated = yield db_1.db
        .select({
        id: schema_1.quizSubmissionsTable.id,
        selectedAnswer: schema_1.quizSubmissionsTable.selectedAnswer,
        correctAnswer: schema_1.quizzesTable.correctAnswer,
        status: schema_1.quizSubmissionsTable.status,
        bonusAmount: schema_1.quizSubmissionsTable.bonusAmount,
        userName: schema_1.usersTable.fullName,
        userEmail: schema_1.usersTable.email,
        userMobileNo: schema_1.usersTable.mobileNumber,
        quizQuestion: schema_1.quizzesTable.question,
    })
        .from(schema_1.quizSubmissionsTable)
        .leftJoin(schema_1.usersTable, (0, drizzle_orm_1.eq)(schema_1.quizSubmissionsTable.userId, schema_1.usersTable.id))
        .leftJoin(schema_1.quizzesTable, (0, drizzle_orm_1.eq)(schema_1.quizSubmissionsTable.quizId, schema_1.quizzesTable.id))
        .orderBy((0, drizzle_orm_1.desc)(schema_1.quizSubmissionsTable.createdAt))
        .limit(limit)
        .offset(offset);
    res.json({
        data: paginated,
        totalPages: Math.ceil(all.length / limit),
    });
}));
adminQuiz.post("/admin/quiz-submissions/:id/action", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status, bonusAmount } = req.body;
    const submission = yield db_1.db
        .select()
        .from(schema_1.quizSubmissionsTable)
        .where((0, drizzle_orm_1.eq)(schema_1.quizSubmissionsTable.id, id));
    if (!submission.length)
        return res.status(404).json({ error: "Submission not found" });
    const { userId } = submission[0];
    yield db_1.db
        .update(schema_1.quizSubmissionsTable)
        .set({ status, bonusAmount })
        .where((0, drizzle_orm_1.eq)(schema_1.quizSubmissionsTable.id, id));
    if (status === "accepted" && bonusAmount) {
        const existingWallet = yield db_1.db
            .select()
            .from(schema_1.userBonusWalletTable)
            .where((0, drizzle_orm_1.eq)(schema_1.userBonusWalletTable.userId, userId));
        if (existingWallet.length) {
            const total = parseFloat(existingWallet[0].amount || "0") + parseFloat(bonusAmount);
            yield db_1.db
                .update(schema_1.userBonusWalletTable)
                .set({ amount: total.toString(), updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(schema_1.userBonusWalletTable.userId, userId));
        }
        else {
            yield db_1.db.insert(schema_1.userBonusWalletTable).values({
                userId,
                amount: bonusAmount,
            });
        }
    }
    res.json({ message: "Updated successfully" });
}));
exports.default = adminQuiz;
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
