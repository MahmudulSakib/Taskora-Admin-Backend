import express from "express";
import cors from "cors";
import adminAddmoney from "./admin/adminaddmoney";
import adminLogin from "./admin/login";
import adminLogout from "./admin/adminlogout";
import adminProtected from "./admin/adminprotectedroute";
import passport from "passport";
import cookieParser from "cookie-parser";
import adminGetRechargeRequests from "./admin/adminRechargeRequest";
import admineDriveOffer from "./admin/admindriveoffer";
import adminjobpost from "./admin/adminjobpost";
import adminjobproof from "./admin/adminjobproof";
import adminQuiz from "./admin/adminquiz";
import adminfetchclient from "./admin/clientsdetails";
import adminAiSubs from "./admin/adminaisubspost";
import adminBonusWithdraw from "./admin/adminrequestwithdraw";
import adminNotifications from "./admin/adminnotification";
import adminUserRanks from "./admin/adminuserranks";
import adminVendorShipRequests from "./admin/adminvendor";
import adminCarousel from "./admin/admincarousel";

const app = express();
const port = process.env.PORT || 8080;

app.use(
  cors({
    origin: [
      "https://taskora-admin-ui.vercel.app",
      "https://taskora-main-ui.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use("/", adminLogin);
app.use("/", adminLogout);
app.use("/", adminProtected);
app.use("/", adminAddmoney);
app.use("/", adminGetRechargeRequests);
app.use("/", admineDriveOffer);
app.use("/", adminjobpost);
app.use("/", adminjobproof);
app.use("/", adminQuiz);
app.use("/", adminfetchclient);
app.use("/", adminAiSubs);
app.use("/", adminBonusWithdraw);
app.use("/", adminNotifications);
app.use("/", adminUserRanks);
app.use("/", adminVendorShipRequests);
app.use("/", adminCarousel);

app.listen(port, () => console.log(`Server is listening on port ${port}`));
