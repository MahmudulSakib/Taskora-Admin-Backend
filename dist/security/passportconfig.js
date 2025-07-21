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
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const passport_jwt_1 = require("passport-jwt");
const bcrypt_1 = __importDefault(require("bcrypt"));
const schema_1 = require("../db/schema");
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error("JWT_SECRET is missing in environment variables.");
}
passport_1.default.use(new passport_local_1.Strategy({
    usernameField: "email",
    passwordField: "password",
}, (email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield db_1.db
            .select()
            .from(schema_1.adminsTable)
            .where((0, drizzle_orm_1.eq)(schema_1.adminsTable.email, email));
        const admin = admins[0];
        if (!admin)
            return done(null, false, { message: "Admin not found" });
        const match = yield bcrypt_1.default.compare(password, admin.password);
        if (!match)
            return done(null, false, { message: "Incorrect password" });
        return done(null, admin);
    }
    catch (err) {
        return done(err);
    }
})));
passport_1.default.use(new passport_jwt_1.Strategy({
    jwtFromRequest: (req) => { var _a; return ((_a = req === null || req === void 0 ? void 0 : req.cookies) === null || _a === void 0 ? void 0 : _a.admintoken) || null; },
    secretOrKey: jwtSecret,
}, (jwt_payload, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield db_1.db
            .select()
            .from(schema_1.adminsTable)
            .where((0, drizzle_orm_1.eq)(schema_1.adminsTable.id, jwt_payload.id));
        const admin = admins[0];
        if (!admin)
            return done(null, false);
        return done(null, admin);
    }
    catch (err) {
        return done(err);
    }
})));
exports.default = passport_1.default;
