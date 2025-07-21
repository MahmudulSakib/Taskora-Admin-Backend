import express from "express";

const adminLogout = express.Router();

adminLogout.post("/admin/log-out", (req, res) => {
  res.clearCookie("admintoken");
  res.status(200).json({ message: "Logged out successfully" });
});

export default adminLogout;
