import express from "express";
import { db } from "../db";
import {
  userAiSubscriptionsTable,
  usersTable,
  aiSubscriptionsTable,
} from "../db/schema";
import { eq, desc } from "drizzle-orm";

const adminAiSubs = express.Router();

export default adminAiSubs;
