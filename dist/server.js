"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const adminaddmoney_1 = __importDefault(require("./admin/adminaddmoney"));
const login_1 = __importDefault(require("./admin/login"));
const adminlogout_1 = __importDefault(require("./admin/adminlogout"));
const adminprotectedroute_1 = __importDefault(require("./admin/adminprotectedroute"));
const passport_1 = __importDefault(require("passport"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const adminRechargeRequest_1 = __importDefault(require("./admin/adminRechargeRequest"));
const admindriveoffer_1 = __importDefault(require("./admin/admindriveoffer"));
const adminjobpost_1 = __importDefault(require("./admin/adminjobpost"));
const adminjobproof_1 = __importDefault(require("./admin/adminjobproof"));
const adminquiz_1 = __importDefault(require("./admin/adminquiz"));
const clientsdetails_1 = __importDefault(require("./admin/clientsdetails"));
const adminaisubspost_1 = __importDefault(require("./admin/adminaisubspost"));
const adminrequestwithdraw_1 = __importDefault(require("./admin/adminrequestwithdraw"));
const adminnotification_1 = __importDefault(require("./admin/adminnotification"));
const adminuserranks_1 = __importDefault(require("./admin/adminuserranks"));
const adminvendor_1 = __importDefault(require("./admin/adminvendor"));
const admincarousel_1 = __importDefault(require("./admin/admincarousel"));
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(passport_1.default.initialize());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
app.use("/", login_1.default);
app.use("/", adminlogout_1.default);
app.use("/", adminprotectedroute_1.default);
app.use("/", adminaddmoney_1.default);
app.use("/", adminRechargeRequest_1.default);
app.use("/", admindriveoffer_1.default);
app.use("/", adminjobpost_1.default);
app.use("/", adminjobproof_1.default);
app.use("/", adminquiz_1.default);
app.use("/", clientsdetails_1.default);
app.use("/", adminaisubspost_1.default);
app.use("/", adminrequestwithdraw_1.default);
app.use("/", adminnotification_1.default);
app.use("/", adminuserranks_1.default);
app.use("/", adminvendor_1.default);
app.use("/", admincarousel_1.default);
app.listen(port, () => console.log(`Server is listening on port ${port}`));
