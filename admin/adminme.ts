import express from "express";
import passport from "../security/passportconfig";

const adminMe = express.Router();

adminMe.get(
  "/admin/me",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({ admin: req.user });
  }
);

export default adminMe;
