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
// routes/admin/bonusWithdraw.ts
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const adminBonusWithdraw = express_1.default.Router();
adminBonusWithdraw.get("/admin/bonus-withdraw-requests", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const offset = (page - 1) * limit;
    const data = yield db_1.db
        .select({
        id: schema_1.bonusWithdrawRequestsTable.id,
        amount: schema_1.bonusWithdrawRequestsTable.amount,
        method: schema_1.bonusWithdrawRequestsTable.method,
        status: schema_1.bonusWithdrawRequestsTable.status,
        mobileNumber: schema_1.bonusWithdrawRequestsTable.mobileNumber,
        mobileBankType: schema_1.bonusWithdrawRequestsTable.mobileBankType,
        accountNumber: schema_1.bonusWithdrawRequestsTable.accountNumber,
        branchName: schema_1.bonusWithdrawRequestsTable.branchName,
        accountName: schema_1.bonusWithdrawRequestsTable.accountName,
        bankName: schema_1.bonusWithdrawRequestsTable.bankName,
        createdAt: schema_1.bonusWithdrawRequestsTable.createdAt,
        user: {
            fullName: schema_1.usersTable.fullName,
            email: schema_1.usersTable.email,
        },
    })
        .from(schema_1.bonusWithdrawRequestsTable)
        .leftJoin(schema_1.usersTable, (0, drizzle_orm_1.eq)(schema_1.bonusWithdrawRequestsTable.userId, schema_1.usersTable.id))
        .orderBy((0, drizzle_orm_1.desc)(schema_1.bonusWithdrawRequestsTable.createdAt))
        .limit(limit + 1)
        .offset(offset);
    const hasNext = data.length > limit;
    res.json({ requests: data.slice(0, limit), hasNext });
}));
adminBonusWithdraw.post("/admin/bonus-withdraw-requests/:id/update", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status } = req.body;
    yield db_1.db
        .update(schema_1.bonusWithdrawRequestsTable)
        .set({ status })
        .where((0, drizzle_orm_1.eq)(schema_1.bonusWithdrawRequestsTable.id, id));
    res.json({ message: "Status updated" });
}));
exports.default = adminBonusWithdraw;
