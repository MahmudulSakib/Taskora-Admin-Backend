// routes/adminCarousel.ts
import express from "express";
import multer from "multer";
import { db } from "../db";
import { carouselImagesTable } from "../db/schema";
import cloudinary from "../cloudinary";
import streamifier from "streamifier";
import { desc } from "drizzle-orm";
import { eq } from "drizzle-orm";

const upload = multer({ storage: multer.memoryStorage() });
const adminCarousel = express.Router();

adminCarousel.post(
  "/admin/carousel-upload",
  upload.single("image"),
  async (req: any, res: any) => {
    try {
      if (!req.file)
        return res.status(400).json({ error: "Image is required" });

      const streamUpload = () =>
        new Promise<{ secure_url: string }>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "carousel" },
            (err, result) => {
              if (err || !result) return reject(err);
              resolve(result as any);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

      const result = await streamUpload();

      await db.insert(carouselImagesTable).values({ url: result.secure_url });
      res.json({ success: true, url: result.secure_url });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);

adminCarousel.get("/admin/carousel-images", async (_, res) => {
  try {
    const images = await db
      .select()
      .from(carouselImagesTable)
      .orderBy(desc(carouselImagesTable.createdAt));
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

adminCarousel.delete("/admin/carousel-images/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await db.delete(carouselImagesTable).where(eq(carouselImagesTable.id, id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete image" });
  }
});

export default adminCarousel;
