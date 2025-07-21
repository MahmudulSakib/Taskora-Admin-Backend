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
// routes/adminVendorShipRequests.ts
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const passportconfig_1 = __importDefault(require("../security/passportconfig"));
const adminVendorShipRequests = express_1.default.Router();
adminVendorShipRequests.get("/admin/vendor-requests", passportconfig_1.default.authenticate("jwt", { session: false }), (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield db_1.db
            .select({
            id: schema_1.vendorShipTable.id,
            shopName: schema_1.vendorShipTable.shopName,
            shopAddress: schema_1.vendorShipTable.shopAddress,
            contactNumber: schema_1.vendorShipTable.contactNumber,
            email: schema_1.vendorShipTable.email,
            status: schema_1.vendorShipTable.status,
            createdAt: schema_1.vendorShipTable.createdAt,
            user: {
                fullName: schema_1.usersTable.fullName,
                email: schema_1.usersTable.email,
                mobileNumber: schema_1.usersTable.mobileNumber,
            },
        })
            .from(schema_1.vendorShipTable)
            .leftJoin(schema_1.usersTable, (0, drizzle_orm_1.eq)(schema_1.vendorShipTable.userId, schema_1.usersTable.id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.vendorShipTable.createdAt));
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch vendor requests" });
    }
}));
adminVendorShipRequests.patch("/admin/vendor-requests/status", passportconfig_1.default.authenticate("jwt", { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, status } = req.body;
    if (!id || !["pending", "accepted", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid input" });
    }
    try {
        yield db_1.db
            .update(schema_1.vendorShipTable)
            .set({ status })
            .where((0, drizzle_orm_1.eq)(schema_1.vendorShipTable.id, id));
        res.json({ message: "Status updated" });
    }
    catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
}));
exports.default = adminVendorShipRequests;
