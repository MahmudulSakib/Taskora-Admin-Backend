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
// routes/adminCarousel.ts
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const cloudinary_1 = __importDefault(require("../cloudinary"));
const streamifier_1 = __importDefault(require("streamifier"));
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_orm_2 = require("drizzle-orm");
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const adminCarousel = express_1.default.Router();
adminCarousel.post("/admin/carousel-upload", upload.single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            return res.status(400).json({ error: "Image is required" });
        const streamUpload = () => new Promise((resolve, reject) => {
            const stream = cloudinary_1.default.uploader.upload_stream({ folder: "carousel" }, (err, result) => {
                if (err || !result)
                    return reject(err);
                resolve(result);
            });
            streamifier_1.default.createReadStream(req.file.buffer).pipe(stream);
        });
        const result = yield streamUpload();
        yield db_1.db.insert(schema_1.carouselImagesTable).values({ url: result.secure_url });
        res.json({ success: true, url: result.secure_url });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Upload failed" });
    }
}));
adminCarousel.get("/admin/carousel-images", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const images = yield db_1.db
            .select()
            .from(schema_1.carouselImagesTable)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.carouselImagesTable.createdAt));
        res.json(images);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch images" });
    }
}));
adminCarousel.delete("/admin/carousel-images/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        yield db_1.db.delete(schema_1.carouselImagesTable).where((0, drizzle_orm_2.eq)(schema_1.carouselImagesTable.id, id));
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to delete image" });
    }
}));
exports.default = adminCarousel;
