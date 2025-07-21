import express from "express";
import passport from "../security/passportconfig";

const adminProtected = express.Router();

adminProtected.get(
  "/admin/protected-data",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.status(200).json({ message: "Secret admin data", admin: req.user });
  }
);

export default adminProtected;
