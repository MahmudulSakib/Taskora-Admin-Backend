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
const adminAddmoney = express_1.default.Router();
adminAddmoney.get("/admin/add-money-requests", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requests = yield db_1.db
            .select({
            id: schema_1.addMoneyRequestsTable.id,
            paymentMethod: schema_1.addMoneyRequestsTable.paymentMethod,
            merchantNumber: schema_1.addMoneyRequestsTable.merchantNumber,
            senderNumber: schema_1.addMoneyRequestsTable.senderNumber,
            amount: schema_1.addMoneyRequestsTable.amount,
            status: schema_1.addMoneyRequestsTable.status,
            createdAt: schema_1.addMoneyRequestsTable.createdAt,
            user: {
                id: schema_1.usersTable.id,
                fullName: schema_1.usersTable.fullName,
                email: schema_1.usersTable.email,
                mobileNumber: schema_1.usersTable.mobileNumber,
            },
        })
            .from(schema_1.addMoneyRequestsTable)
            .leftJoin(schema_1.usersTable, (0, drizzle_orm_1.eq)(schema_1.addMoneyRequestsTable.userId, schema_1.usersTable.id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.addMoneyRequestsTable.createdAt));
        return res.json({ requests });
    }
    catch (err) {
        console.error("Failed to fetch add money requests:", err);
        return res
            .status(500)
            .json({ error: "Server error while fetching requests." });
    }
}));
adminAddmoney.post("/admin/add-money-requests/:id/approve", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requestId = req.params.id;
    try {
        const request = yield db_1.db
            .select()
            .from(schema_1.addMoneyRequestsTable)
            .where((0, drizzle_orm_1.eq)(schema_1.addMoneyRequestsTable.id, requestId))
            .then((rows) => rows[0]);
        if (!request || request.status !== "pending") {
            return res
                .status(400)
                .json({ error: "Invalid or already processed request." });
        }
        yield db_1.db.transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            yield tx
                .update(schema_1.addMoneyRequestsTable)
                .set({ status: "accepted" })
                .where((0, drizzle_orm_1.eq)(schema_1.addMoneyRequestsTable.id, requestId));
            const existingWallet = yield tx
                .select()
                .from(schema_1.walletTable)
                .where((0, drizzle_orm_1.eq)(schema_1.walletTable.userId, request.userId))
                .then((rows) => rows[0]);
            const requestAmount = parseFloat(request.amount);
            if (existingWallet) {
                const currentBalance = parseFloat((_a = existingWallet.balance) !== null && _a !== void 0 ? _a : "0");
                const newBalance = (currentBalance + requestAmount).toString();
                yield tx
                    .update(schema_1.walletTable)
                    .set({ balance: newBalance })
                    .where((0, drizzle_orm_1.eq)(schema_1.walletTable.userId, request.userId));
            }
            else {
                yield tx.insert(schema_1.walletTable).values({
                    userId: request.userId,
                    balance: requestAmount.toString(),
                });
            }
        }));
        res.json({ message: "Request approved and wallet updated." });
    }
    catch (err) {
        console.error("Error approving request:", err);
        res.status(500).json({ error: "Failed to approve request." });
    }
}));
adminAddmoney.post("/admin/add-money-requests/:id/reject", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requestId = req.params.id;
    try {
        yield db_1.db
            .update(schema_1.addMoneyRequestsTable)
            .set({ status: "rejected" })
            .where((0, drizzle_orm_1.eq)(schema_1.addMoneyRequestsTable.id, requestId));
        res.json({ message: "Request rejected successfully." });
    }
    catch (err) {
        console.error("Error rejecting request:", err);
        res.status(500).json({ error: "Failed to reject request." });
    }
}));
exports.default = adminAddmoney;
