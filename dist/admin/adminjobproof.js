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
const uuid_1 = require("uuid");
const adminjobproof = express_1.default.Router();
adminjobproof.get("/admin/job-proofs", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield db_1.db
            .select({
            id: schema_1.jobProofsTable.id,
            jobId: schema_1.jobProofsTable.jobId,
            userId: schema_1.jobProofsTable.userId,
            imageUrls: schema_1.jobProofsTable.imageUrls,
            status: schema_1.jobProofsTable.status,
            user: {
                fullName: schema_1.usersTable.fullName,
                email: schema_1.usersTable.email,
                mobileNumber: schema_1.usersTable.mobileNumber,
            },
            job: {
                title: schema_1.jobPostRequestsTable.title,
                link: schema_1.jobPostRequestsTable.link,
                limit: schema_1.jobPostRequestsTable.limit,
                costPerLimit: schema_1.jobPostRequestsTable.costPerLimit,
                leftLimit: schema_1.jobPostRequestsTable.leftLimit,
            },
        })
            .from(schema_1.jobProofsTable)
            .leftJoin(schema_1.usersTable, (0, drizzle_orm_1.eq)(schema_1.usersTable.id, schema_1.jobProofsTable.userId))
            .leftJoin(schema_1.jobPostRequestsTable, (0, drizzle_orm_1.eq)(schema_1.jobPostRequestsTable.id, schema_1.jobProofsTable.jobId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.jobProofsTable.submittedAt));
        res.json(results);
    }
    catch (err) {
        console.error("Error fetching job proofs:", err);
        res.status(500).json({ error: "Failed to fetch job proofs." });
    }
}));
adminjobproof.post("/admin/job-proofs/:id/action", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { status, bonusAmount } = req.body;
    const proofId = req.params.id;
    try {
        const proof = yield db_1.db
            .select({
            id: schema_1.jobProofsTable.id,
            userId: schema_1.jobProofsTable.userId,
            jobId: schema_1.jobProofsTable.jobId,
        })
            .from(schema_1.jobProofsTable)
            .where((0, drizzle_orm_1.eq)(schema_1.jobProofsTable.id, proofId));
        if (!proof.length) {
            return res.status(404).json({ error: "Proof not found" });
        }
        const { userId, jobId } = proof[0];
        const job = yield db_1.db
            .select({ leftLimit: schema_1.jobPostRequestsTable.leftLimit })
            .from(schema_1.jobPostRequestsTable)
            .where((0, drizzle_orm_1.eq)(schema_1.jobPostRequestsTable.id, jobId));
        if (!job.length) {
            return res.status(404).json({ error: "Related job not found." });
        }
        const leftLimit = (_a = job[0].leftLimit) !== null && _a !== void 0 ? _a : 0;
        if (status === "accepted" && leftLimit <= 0) {
            return res.status(400).json({ error: "Job has no remaining limit." });
        }
        yield db_1.db
            .update(schema_1.jobProofsTable)
            .set({ status })
            .where((0, drizzle_orm_1.eq)(schema_1.jobProofsTable.id, proofId));
        if (status === "accepted") {
            yield db_1.db
                .update(schema_1.jobPostRequestsTable)
                .set({
                leftLimit: (0, drizzle_orm_1.sql) `${schema_1.jobPostRequestsTable.leftLimit} - 1`,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.jobPostRequestsTable.id, jobId));
            if (bonusAmount && parseFloat(bonusAmount) > 0) {
                const existing = yield db_1.db
                    .select()
                    .from(schema_1.userBonusWalletTable)
                    .where((0, drizzle_orm_1.eq)(schema_1.userBonusWalletTable.userId, userId));
                const amountToAdd = parseFloat(bonusAmount);
                if (existing.length > 0) {
                    const updated = parseFloat(existing[0].amount || "0") + amountToAdd;
                    yield db_1.db
                        .update(schema_1.userBonusWalletTable)
                        .set({ amount: updated.toFixed(2) })
                        .where((0, drizzle_orm_1.eq)(schema_1.userBonusWalletTable.userId, userId));
                }
                else {
                    yield db_1.db.insert(schema_1.userBonusWalletTable).values({
                        id: (0, uuid_1.v4)(),
                        userId,
                        amount: bonusAmount,
                    });
                }
            }
        }
        res.json({ message: "Proof handled successfully." });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Action failed." });
    }
}));
exports.default = adminjobproof;
