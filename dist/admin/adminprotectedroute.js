"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passportconfig_1 = __importDefault(require("../security/passportconfig"));
const adminProtected = express_1.default.Router();
adminProtected.get("/admin/protected-data", passportconfig_1.default.authenticate("jwt", { session: false }), (req, res) => {
    res.status(200).json({ message: "Secret admin data", admin: req.user });
});
exports.default = adminProtected;
