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
const schema_1 = require("../db/schema");
const db_1 = require("../db");
const schema_2 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const adminGetRechargeRequests = express_1.default.Router();
adminGetRechargeRequests.get("/admin/mobile-recharge-requests", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requests = yield db_1.db
            .select({
            id: schema_1.rechargeTable.id,
            mobileNumber: schema_1.rechargeTable.mobileNumber,
            operator: schema_1.rechargeTable.operator,
            simType: schema_1.rechargeTable.simType,
            amount: schema_1.rechargeTable.amount,
            status: schema_1.rechargeTable.status,
            createdAt: schema_1.rechargeTable.createdAt,
            user: {
                fullName: schema_2.usersTable.fullName,
                email: schema_2.usersTable.email,
            },
        })
            .from(schema_1.rechargeTable)
            .leftJoin(schema_2.usersTable, (0, drizzle_orm_1.eq)(schema_1.rechargeTable.userId, schema_2.usersTable.id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.rechargeTable.createdAt));
        res.json(requests);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch recharge requests." });
    }
}));
adminGetRechargeRequests.post("/admin/update-mobile-recharge-status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, status } = req.body;
    if (!["Pending", "Completed", "Rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value." });
    }
    yield db_1.db
        .update(schema_1.rechargeTable)
        .set({ status })
        .where((0, drizzle_orm_1.eq)(schema_1.rechargeTable.id, id));
    res.json({ message: "Status updated successfully." });
}));
exports.default = adminGetRechargeRequests;
