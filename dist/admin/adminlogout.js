"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminLogout = express_1.default.Router();
adminLogout.post("/admin/log-out", (req, res) => {
    res.clearCookie("admintoken");
    res.status(200).json({ message: "Logged out successfully" });
});
exports.default = adminLogout;
