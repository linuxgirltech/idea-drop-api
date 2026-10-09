import e from "express";
const router = e.Router();

import mongoose from "mongoose";

import Idea from "../models/Idea.js";

// @route         GET /api/ideas
// @description   Get all Ideas
// @access        PUBLIC
router.get("/", async (req, res, next) => {
  try {
    const limit = parseInt(req.query._limit);
    const query = Idea.find().sort({ createdAt: -1 });

    if (!isNaN(limit)) {
      query.limit(limit);
    }

    const ideas = await query.exec();
    res.json(ideas);
  } catch (err) {
    next(err);
  }
});

// @route         GET /api/ideas/:id
// @description   Get a single Idea
// @access        PUBLIC
// @query         _limit (optional limit for ideas returned)
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Idea not found");
    }

    const idea = await Idea.findById(id);

    if (!idea) {
      res.status(404);
      throw new Error("Idea not found");
    }

    res.json(idea);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// @route         POST /api/ideas
// @description   Create an Idea
// @access        PUBLIC
router.post("/", async (req, res, next) => {
  try {
    const { title, summary, description, tags } = req.body;

    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(400);
      throw new Error("Title, summary, and/or description are required!");
    }

    const newIdea = new Idea({
      title,
      summary,
      description,
      tags:
        typeof tags === "string"
          ? tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : Array.isArray(tags)
            ? tags
            : [],
    });

    const savedIdea = await newIdea.save();
    res.status(201).json(savedIdea);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// @route         DELETE /api/ideas/:id
// @description   Delete a single Idea
// @access        PUBLIC
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Idea not found");
    }

    const idea = await Idea.findByIdAndDelete(id);

    if (!idea) {
      res.status(404);
      throw new Error("Idea not found");
    }

    res.json({
      message: "Idea deleted successfully!",
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// @route         PUT /api/ideas/:id
// @description   Update a single Idea
// @access        PUBLIC

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Idea not found");
    }

    const { title, summary, description, tags } = req.body;

    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(400);
      throw new Error("Title, summary, and/or description are required!");
    }

    const updatedIdea = await Idea.findByIdAndUpdate(
      id,
      {
        title,
        summary,
        description,
        tags: Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim()),
      },
      { new: true, runValidators: true },
    );

    if (!updatedIdea) {
      res.status(404);
      throw new Error("Idea not found");
    }

    res.json(updatedIdea);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

export default router;
