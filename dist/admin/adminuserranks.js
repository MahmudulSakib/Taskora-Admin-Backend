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
const adminUserRanks = express_1.default.Router();
adminUserRanks.get("/admin/user-ranks", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield db_1.db
            .select({
            id: schema_1.usersTable.id,
            fullName: schema_1.usersTable.fullName,
            email: schema_1.usersTable.email,
            mobileNumber: schema_1.usersTable.mobileNumber,
            rank: schema_1.userRanksTable.rank,
        })
            .from(schema_1.usersTable)
            .leftJoin(schema_1.userRanksTable, (0, drizzle_orm_1.eq)(schema_1.usersTable.id, schema_1.userRanksTable.userId));
        res.json(users);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch user ranks" });
    }
}));
adminUserRanks.post("/admin/user-ranks", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, rank } = req.body;
    if (!userId || ![1, 2, 3].includes(rank)) {
        return res.status(400).json({ error: "Invalid rank or user" });
    }
    try {
        const existing = yield db_1.db
            .select()
            .from(schema_1.userRanksTable)
            .where((0, drizzle_orm_1.eq)(schema_1.userRanksTable.userId, userId));
        if (existing.length > 0) {
            yield db_1.db
                .update(schema_1.userRanksTable)
                .set({ rank })
                .where((0, drizzle_orm_1.eq)(schema_1.userRanksTable.userId, userId));
        }
        else {
            yield db_1.db.insert(schema_1.userRanksTable).values({ userId, rank });
        }
        res.json({ message: "Rank assigned successfully" });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to assign rank" });
    }
}));
exports.default = adminUserRanks;
