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
const passportconfig_1 = __importDefault(require("../security/passportconfig"));
const adminAiSubs = express_1.default.Router();
adminAiSubs.get("/admin/ai-subscriptions", passportconfig_1.default.authenticate("jwt", { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield db_1.db
            .select()
            .from(schema_1.aiSubscriptionsTable)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.aiSubscriptionsTable.createdAt));
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch plans" });
    }
}));
adminAiSubs.post("/admin/ai-subscriptions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, duration, price } = req.body;
    if (!title || !description || !duration || !price) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        yield db_1.db.insert(schema_1.aiSubscriptionsTable).values({
            title,
            description,
            duration: parseInt(duration),
            price,
        });
        res.json({ message: "Plan created" });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to create plan" });
    }
}));
adminAiSubs.delete("/admin/ai-subscriptions/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield db_1.db
            .delete(schema_1.aiSubscriptionsTable)
            .where((0, drizzle_orm_1.eq)(schema_1.aiSubscriptionsTable.id, id));
        res.json({ message: "Plan deleted" });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to delete plan" });
    }
}));
adminAiSubs.get("/admin/ai-subscription-requests", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subscriptions = yield db_1.db
            .select({
            id: schema_1.userAiSubscriptionsTable.id,
            status: schema_1.userAiSubscriptionsTable.status,
            subscribedAt: schema_1.userAiSubscriptionsTable.subscribedAt,
            email: schema_1.userAiSubscriptionsTable.email,
            mobileNumber: schema_1.userAiSubscriptionsTable.mobileNumber,
            user: {
                id: schema_1.usersTable.id,
                fullName: schema_1.usersTable.fullName,
            },
            plan: {
                title: schema_1.aiSubscriptionsTable.title,
                price: schema_1.aiSubscriptionsTable.price,
                duration: schema_1.aiSubscriptionsTable.duration,
            },
        })
            .from(schema_1.userAiSubscriptionsTable)
            .leftJoin(schema_1.usersTable, (0, drizzle_orm_1.eq)(schema_1.userAiSubscriptionsTable.userId, schema_1.usersTable.id))
            .leftJoin(schema_1.aiSubscriptionsTable, (0, drizzle_orm_1.eq)(schema_1.userAiSubscriptionsTable.planId, schema_1.aiSubscriptionsTable.id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.userAiSubscriptionsTable.subscribedAt));
        res.json(subscriptions);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
}));
adminAiSubs.patch("/admin/ai-subscription-status/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status } = req.body;
    if (!["pending", "accepted", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
    }
    try {
        yield db_1.db
            .update(schema_1.userAiSubscriptionsTable)
            .set({ status })
            .where((0, drizzle_orm_1.eq)(schema_1.userAiSubscriptionsTable.id, id));
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update status" });
    }
}));
exports.default = adminAiSubs;
