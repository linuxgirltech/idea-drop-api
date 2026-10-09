import e from "express";
const router = e.Router();

// @route         GET /api/ideas
// @description   Get all Ideas
// @access        PUBLIC
router.get("/", (req, res) => {
  const ideas = [
    { id: 1, title: "Idea 1", description: "This is idea 1" },
    { id: 2, title: "Idea 2", description: "This is idea 2" },
    { id: 3, title: "Idea 3", description: "This is idea 3" },
    { id: 4, title: "Idea 4", description: "This is idea 4" },
  ];

  res.status(400);
  throw new Error("This is an error");

  res.json(ideas);
});

// @route         POST /api/ideas
// @description   Create all Ideas
// @access        PUBLIC
router.post("/", (req, res) => {
  const { title, description } = req.body;

  res.send(`Processed! The title is ${title}, with ${description}`);
});

export default router;
