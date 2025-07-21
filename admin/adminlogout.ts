import express from "express";
import passport from "../security/passportconfig";
const adminLogout = express.Router();

adminLogout.post(
  "/admin/log-out",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.clearCookie("admintoken");
    res.status(200).json({ message: "Logged out successfully" });
  }
);

export default adminLogout;
