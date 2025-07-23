import express from "express";
import passport from "../security/passportconfig";
const adminLogout = express.Router();

adminLogout.post("/admin/log-out", (req, res) => {
  res.clearCookie("admintoken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

export default adminLogout;
