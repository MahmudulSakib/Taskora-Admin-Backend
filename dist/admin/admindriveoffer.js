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
const admineDriveOffer = express_1.default.Router();
admineDriveOffer.post("/admin/create-drive-offer", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, isSimType, simType, duration, validation, purchaseAmount } = req.body;
        yield db_1.db.insert(schema_1.driveOffersTable).values({
            title,
            isSimType,
            simType: isSimType ? simType : null,
            duration,
            validation,
            purchaseAmount,
        });
        res.json({ message: "Drive offer created successfully." });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create drive offer." });
    }
}));
admineDriveOffer.get("/admin/drive-offers", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const [offers, [{ count }]] = yield Promise.all([
            db_1.db
                .select()
                .from(schema_1.driveOffersTable)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.driveOffersTable.createdAt))
                .limit(limit)
                .offset(offset),
            db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.driveOffersTable),
        ]);
        res.json({ offers, total: count });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch drive offers." });
    }
}));
exports.default = admineDriveOffer;
