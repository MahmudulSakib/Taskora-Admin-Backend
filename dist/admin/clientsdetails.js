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
const adminfetchclient = express_1.default.Router();
adminfetchclient.get("/admin/user/details", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = ((_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "";
    try {
        const offset = (page - 1) * limit;
        let whereClause = undefined;
        if (search) {
            whereClause = (0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.usersTable.mobileNumber, `%${search}%`), (0, drizzle_orm_1.ilike)(schema_1.usersTable.email, `%${search}%`));
        }
        const users = yield db_1.db
            .select({
            id: schema_1.usersTable.id,
            fullName: schema_1.usersTable.fullName,
            email: schema_1.usersTable.email,
            mobileNumber: schema_1.usersTable.mobileNumber,
            address: schema_1.usersTable.address,
            referCode: schema_1.usersTable.referCode,
            fund: schema_1.walletTable.balance,
            bonus: schema_1.userBonusWalletTable.amount,
        })
            .from(schema_1.usersTable)
            .leftJoin(schema_1.walletTable, (0, drizzle_orm_1.eq)(schema_1.usersTable.id, schema_1.walletTable.userId))
            .leftJoin(schema_1.userBonusWalletTable, (0, drizzle_orm_1.eq)(schema_1.usersTable.id, schema_1.userBonusWalletTable.userId))
            .where(whereClause)
            .limit(limit)
            .offset(offset);
        const countResult = yield db_1.db
            .select({ count: schema_1.usersTable.id })
            .from(schema_1.usersTable)
            .where(whereClause);
        const totalCount = countResult.length;
        const totalPages = Math.ceil(totalCount / limit);
        res.json({
            data: users,
            totalCount,
            totalPages,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
}));
exports.default = adminfetchclient;
