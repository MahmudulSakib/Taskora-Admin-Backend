import express from "express";
import { db } from "../db";
import { desc, eq } from "drizzle-orm";
import { jobPostRequestsTable, usersTable } from "../db/schema";
import cloudinary from "../cloudinary";
import streamifier from "streamifier";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const adminjobpost = express.Router();
adminjobpost.get("/admin/job-posts", async (req, res) => {
  try {
    const posts = await db
      .select({
        id: jobPostRequestsTable.id,
        title: jobPostRequestsTable.title,
        link: jobPostRequestsTable.link,
        limit: jobPostRequestsTable.limit,
        costPerLimit: jobPostRequestsTable.costPerLimit,
        totalCost: jobPostRequestsTable.totalCost,
        imageUrl: jobPostRequestsTable.imageUrl,
        description: jobPostRequestsTable.description,
        status: jobPostRequestsTable.status,
        createdAt: jobPostRequestsTable.createdAt,
        updatedAt: jobPostRequestsTable.updatedAt,
        user: {
          id: usersTable.id,
          fullName: usersTable.fullName,
          email: usersTable.email,
        },
      })
      .from(jobPostRequestsTable)
      .orderBy(desc(jobPostRequestsTable.createdAt))
      .leftJoin(usersTable, eq(jobPostRequestsTable.userId, usersTable.id));

    res.json(posts);
  } catch (err) {
    console.error("Fetch admin job posts error:", err);
    res.status(500).json({ error: "Failed to fetch job posts." });
  }
});

adminjobpost.put(
  "/admin/job-posts/:id",
  upload.single("image"),
  async (req: any, res: any) => {
    try {
      const postId = req.params.id;
      const { title, link, description, status } = req.body;
      let imageUrl = req.body.imageUrl;

      if (req.file) {
        const uploadStream = () => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: "image", folder: "job-posts" },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
          });
        };

        const result = await uploadStream();
        if (
          !result ||
          typeof result !== "object" ||
          !("secure_url" in result)
        ) {
          return res.status(500).json({ error: "Image upload failed." });
        }

        imageUrl = (result as any).secure_url;
      }

      await db
        .update(jobPostRequestsTable)
        .set({
          title,
          link,
          description,
          imageUrl,
          status,
          updatedAt: new Date(),
          reviewedAt: new Date(),
        })
        .where(eq(jobPostRequestsTable.id, postId));

      res.json({ message: "Job post updated successfully." });
    } catch (err) {
      console.error("Update job post error:", err);
      res.status(500).json({ error: "Failed to update job post." });
    }
  }
);

export default adminjobpost;
