"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.carouselImagesTable = exports.vendorShipTable = exports.userRanksTable = exports.notificationsTable = exports.bonusWithdrawRequestsTable = exports.userAiSubscriptionsTable = exports.aiSubscriptionsTable = exports.quizSubmissionsTable = exports.quizzesTable = exports.jobPostRequestsRelations = exports.jobProofsTable = exports.jobPostRequestsTable = exports.driveOffersTable = exports.rechargeTable = exports.userBonusWalletTable = exports.walletTable = exports.addMoneyRequestsTable = exports.passwordResetTokens = exports.adminsTable = exports.usersTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.usersTable = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    fullName: (0, pg_core_1.varchar)("full_name", { length: 255 }).notNull(),
    mobileNumber: (0, pg_core_1.varchar)("mobile_number", { length: 15 }).notNull().unique(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    password: (0, pg_core_1.varchar)("password", { length: 255 }).notNull(),
    referCode: (0, pg_core_1.varchar)("refer_code", { length: 50 }).notNull(),
    referredBy: (0, pg_core_1.varchar)("referred_by", { length: 50 }),
    referralBonusGranted: (0, pg_core_1.boolean)("referral_bonus_granted")
        .default(false)
        .notNull(),
    gender: (0, pg_core_1.varchar)("gender", { length: 10 }),
    address: (0, pg_core_1.varchar)("address", { length: 500 }),
    country: (0, pg_core_1.varchar)("country", { length: 100 }),
    profilePicture: (0, pg_core_1.varchar)("profile_picture", { length: 500 }),
    isVerified: (0, pg_core_1.boolean)("is_verified").default(false),
    verificationToken: (0, pg_core_1.varchar)("verification_token", { length: 255 }),
    hasClaimedWelcomeOffer: (0, pg_core_1.boolean)("has_claimed_welcome_offer").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.adminsTable = (0, pg_core_1.pgTable)("admins", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    password: (0, pg_core_1.varchar)("password", { length: 255 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.passwordResetTokens = (0, pg_core_1.pgTable)("password_reset_tokens", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull(),
    token: (0, pg_core_1.varchar)("token", { length: 255 }).notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at").notNull(),
});
exports.addMoneyRequestsTable = (0, pg_core_1.pgTable)("add_money_requests", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id")
        .notNull()
        .references(() => exports.usersTable.id, { onDelete: "cascade" }),
    paymentMethod: (0, pg_core_1.varchar)("payment_method", { length: 20 }).notNull(),
    merchantNumber: (0, pg_core_1.varchar)("merchant_number", { length: 20 }).notNull(),
    senderNumber: (0, pg_core_1.varchar)("sender_number", { length: 20 }).notNull(),
    amount: (0, pg_core_1.numeric)("amount").notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("pending"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.walletTable = (0, pg_core_1.pgTable)("wallets", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id")
        .notNull()
        .unique()
        .references(() => exports.usersTable.id, { onDelete: "cascade" }),
    balance: (0, pg_core_1.numeric)("balance").default("0"),
});
exports.userBonusWalletTable = (0, pg_core_1.pgTable)("user_bonus_wallet", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id")
        .references(() => exports.usersTable.id)
        .notNull(),
    amount: (0, pg_core_1.decimal)("amount", { precision: 10, scale: 5 }).default("0.00000"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.rechargeTable = (0, pg_core_1.pgTable)("mobile_recharges", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id")
        .notNull()
        .references(() => exports.usersTable.id, { onDelete: "cascade" }),
    mobileNumber: (0, pg_core_1.varchar)("mobile_number", { length: 15 }).notNull(),
    operator: (0, pg_core_1.varchar)("operator", { length: 50 }).notNull(),
    simType: (0, pg_core_1.varchar)("sim_type", { length: 50 }).notNull(),
    amount: (0, pg_core_1.numeric)("amount").notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("Pending"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.driveOffersTable = (0, pg_core_1.pgTable)("drive_offers", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    isSimType: (0, pg_core_1.boolean)("is_sim_type").default(false),
    simType: (0, pg_core_1.varchar)("sim_type", { length: 50 }),
    duration: (0, pg_core_1.varchar)("duration", { length: 100 }).notNull(),
    validation: (0, pg_core_1.varchar)("validation", { length: 100 }).notNull(),
    purchaseAmount: (0, pg_core_1.numeric)("purchase_amount").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.jobPostRequestsTable = (0, pg_core_1.pgTable)("job_post_requests", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id")
        .notNull()
        .references(() => exports.usersTable.id, {
        onDelete: "cascade",
    }),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    link: (0, pg_core_1.text)("link").notNull(),
    limit: (0, pg_core_1.numeric)("limit").notNull(),
    costPerLimit: (0, pg_core_1.numeric)("cost_per_limit").notNull(),
    leftLimit: (0, pg_core_1.integer)("left_limit").notNull(),
    totalCost: (0, pg_core_1.numeric)("total_cost").notNull(),
    imageUrl: (0, pg_core_1.text)("image_url").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    status: (0, pg_core_1.varchar)("status", {
        enum: ["pending", "accepted", "rejected"],
    })
        .default("pending")
        .notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
    reviewedAt: (0, pg_core_1.timestamp)("reviewed_at"),
});
exports.jobProofsTable = (0, pg_core_1.pgTable)("job_proofs", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id")
        .notNull()
        .references(() => exports.usersTable.id, { onDelete: "cascade" }),
    jobId: (0, pg_core_1.uuid)("job_id")
        .notNull()
        .references(() => exports.jobPostRequestsTable.id, { onDelete: "cascade" }),
    imageUrls: (0, pg_core_1.text)("image_urls").array().notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("pending"),
    submittedAt: (0, pg_core_1.timestamp)("submitted_at").defaultNow().notNull(),
});
exports.jobPostRequestsRelations = (0, drizzle_orm_1.relations)(exports.jobPostRequestsTable, ({ one }) => ({
    user: one(exports.usersTable, {
        fields: [exports.jobPostRequestsTable.userId],
        references: [exports.usersTable.id],
    }),
}));
exports.quizzesTable = (0, pg_core_1.pgTable)("quizzes", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    question: (0, pg_core_1.text)("question").notNull(),
    optionA: (0, pg_core_1.text)("option_a").notNull(),
    optionB: (0, pg_core_1.text)("option_b").notNull(),
    optionC: (0, pg_core_1.text)("option_c").notNull(),
    optionD: (0, pg_core_1.text)("option_d").notNull(),
    correctAnswer: (0, pg_core_1.text)("correct_answer").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.quizSubmissionsTable = (0, pg_core_1.pgTable)("quiz_submissions", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id")
        .references(() => exports.usersTable.id)
        .notNull(),
    quizId: (0, pg_core_1.uuid)("quiz_id")
        .references(() => exports.quizzesTable.id)
        .notNull(),
    selectedAnswer: (0, pg_core_1.text)("selected_answer").notNull(),
    status: (0, pg_core_1.text)("status").default("pending"),
    bonusAmount: (0, pg_core_1.decimal)("bonus_amount"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.aiSubscriptionsTable = (0, pg_core_1.pgTable)("ai_subscriptions", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    duration: (0, pg_core_1.integer)("duration").notNull(),
    price: (0, pg_core_1.decimal)("price").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.userAiSubscriptionsTable = (0, pg_core_1.pgTable)("user_ai_subscriptions", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id")
        .references(() => exports.usersTable.id)
        .notNull(),
    planId: (0, pg_core_1.uuid)("plan_id")
        .references(() => exports.aiSubscriptionsTable.id)
        .notNull(),
    email: (0, pg_core_1.text)("email").notNull(),
    mobileNumber: (0, pg_core_1.text)("mobile_number").notNull(),
    subscribedAt: (0, pg_core_1.timestamp)("subscribed_at").defaultNow().notNull(),
    status: (0, pg_core_1.text)("status").default("pending").notNull(),
});
exports.bonusWithdrawRequestsTable = (0, pg_core_1.pgTable)("bonus_withdraw_requests", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id")
        .references(() => exports.usersTable.id)
        .notNull(),
    amount: (0, pg_core_1.decimal)("amount").notNull(),
    method: (0, pg_core_1.text)("method").notNull(),
    mobileBankType: (0, pg_core_1.text)("mobile_bank_type"),
    mobileNumber: (0, pg_core_1.text)("mobile_number"),
    accountNumber: (0, pg_core_1.text)("account_number"),
    branchName: (0, pg_core_1.text)("branch_name"),
    accountName: (0, pg_core_1.text)("account_name"),
    bankName: (0, pg_core_1.text)("bank_name"),
    status: (0, pg_core_1.text)("status").default("pending"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.notificationsTable = (0, pg_core_1.pgTable)("notifications", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    description: (0, pg_core_1.text)("description").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.userRanksTable = (0, pg_core_1.pgTable)("user_ranks", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id")
        .references(() => exports.usersTable.id)
        .notNull()
        .unique(),
    rank: (0, pg_core_1.integer)("rank").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.vendorShipTable = (0, pg_core_1.pgTable)("vendor_ship_requests", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id")
        .references(() => exports.usersTable.id)
        .notNull(),
    shopName: (0, pg_core_1.text)("shop_name").notNull(),
    shopAddress: (0, pg_core_1.text)("shop_address").notNull(),
    contactNumber: (0, pg_core_1.text)("contact_number").notNull(),
    email: (0, pg_core_1.text)("email").notNull(),
    status: (0, pg_core_1.text)("status").default("pending").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.carouselImagesTable = (0, pg_core_1.pgTable)("carousel_images", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    url: (0, pg_core_1.varchar)("url", { length: 500 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
