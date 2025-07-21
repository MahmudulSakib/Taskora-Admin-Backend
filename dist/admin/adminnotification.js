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
const adminNotifications = express_1.default.Router();
adminNotifications.get("/admin/notifications", passportconfig_1.default.authenticate("jwt", { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield db_1.db
            .select()
            .from(schema_1.notificationsTable)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.notificationsTable.createdAt));
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
}));
adminNotifications.post("/admin/notifications", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { description } = req.body;
    if (!description)
        return res.status(400).json({ error: "Description is required" });
    try {
        const result = yield db_1.db.insert(schema_1.notificationsTable).values({ description });
        res.json({ message: "Notification posted" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to post notification" });
    }
}));
adminNotifications.delete("/admin/notifications/:id", passportconfig_1.default.authenticate("jwt", { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield db_1.db.delete(schema_1.notificationsTable).where((0, drizzle_orm_1.eq)(schema_1.notificationsTable.id, id));
        res.json({ message: "Deleted" });
    }
    catch (_a) {
        res.status(500).json({ error: "Failed to delete notification" });
    }
}));
exports.default = adminNotifications;
