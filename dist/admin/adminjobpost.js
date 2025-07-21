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
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../db/schema");
const cloudinary_1 = __importDefault(require("../cloudinary"));
const streamifier_1 = __importDefault(require("streamifier"));
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
const adminjobpost = express_1.default.Router();
adminjobpost.get("/admin/job-posts", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield db_1.db
            .select({
            id: schema_1.jobPostRequestsTable.id,
            title: schema_1.jobPostRequestsTable.title,
            link: schema_1.jobPostRequestsTable.link,
            limit: schema_1.jobPostRequestsTable.limit,
            costPerLimit: schema_1.jobPostRequestsTable.costPerLimit,
            totalCost: schema_1.jobPostRequestsTable.totalCost,
            imageUrl: schema_1.jobPostRequestsTable.imageUrl,
            description: schema_1.jobPostRequestsTable.description,
            status: schema_1.jobPostRequestsTable.status,
            createdAt: schema_1.jobPostRequestsTable.createdAt,
            updatedAt: schema_1.jobPostRequestsTable.updatedAt,
            user: {
                id: schema_1.usersTable.id,
                fullName: schema_1.usersTable.fullName,
                email: schema_1.usersTable.email,
            },
        })
            .from(schema_1.jobPostRequestsTable)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.jobPostRequestsTable.createdAt))
            .leftJoin(schema_1.usersTable, (0, drizzle_orm_1.eq)(schema_1.jobPostRequestsTable.userId, schema_1.usersTable.id));
        res.json(posts);
    }
    catch (err) {
        console.error("Fetch admin job posts error:", err);
        res.status(500).json({ error: "Failed to fetch job posts." });
    }
}));
adminjobpost.put("/admin/job-posts/:id", upload.single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.id;
        const { title, link, description, status } = req.body;
        let imageUrl = req.body.imageUrl;
        if (req.file) {
            const uploadStream = () => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary_1.default.uploader.upload_stream({ resource_type: "image", folder: "job-posts" }, (error, result) => {
                        if (error)
                            return reject(error);
                        resolve(result);
                    });
                    streamifier_1.default.createReadStream(req.file.buffer).pipe(stream);
                });
            };
            const result = yield uploadStream();
            if (!result ||
                typeof result !== "object" ||
                !("secure_url" in result)) {
                return res.status(500).json({ error: "Image upload failed." });
            }
            imageUrl = result.secure_url;
        }
        yield db_1.db
            .update(schema_1.jobPostRequestsTable)
            .set({
            title,
            link,
            description,
            imageUrl,
            status,
            updatedAt: new Date(),
            reviewedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.jobPostRequestsTable.id, postId));
        res.json({ message: "Job post updated successfully." });
    }
    catch (err) {
        console.error("Update job post error:", err);
        res.status(500).json({ error: "Failed to update job post." });
    }
}));
exports.default = adminjobpost;
