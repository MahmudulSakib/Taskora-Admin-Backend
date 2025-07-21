"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passportconfig_1 = __importDefault(require("../security/passportconfig"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const adminLogin = express_1.default.Router();
adminLogin.post("/admin/log-in", (req, res, next) => {
    passportconfig_1.default.authenticate("local", { session: false }, (err, admin, info) => {
        if (err)
            return res.status(500).json({ error: "Server error" });
        if (!admin)
            return res
                .status(400)
                .json({ error: (info === null || info === void 0 ? void 0 : info.message) || "Invalid credentials" });
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("WT_SECRET is missing in environment variables.");
            return res.status(500).json({ error: "Server misconfiguration." });
        }
        const token = jsonwebtoken_1.default.sign({ id: admin.id }, jwtSecret, {
            expiresIn: "6h",
        });
        res.cookie("admintoken", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 6 * 60 * 60 * 1000,
        });
        res.status(200).json({ message: "Logged in successfully" });
    })(req, res, next);
});
exports.default = adminLogin;
