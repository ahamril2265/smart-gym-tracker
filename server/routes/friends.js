const express = require("express");
const router = express.Router();
const { Friend, User, Workout } = require("../models");
const auth = require("../middleware/auth");

// Get pending friend requests (for logged-in user)
router.get("/pending", auth, async (req, res) => {
  const requests = await Friend.findAll({
    where: { friendid: req.user.id, status: "pending" },
    include: [{ model: User, as: "user", attributes: ["id", "username", "email"] }]
  });
  res.json(requests);
});

// Accept friend request
router.post("/accept/:requestId", auth, async (req, res) => {
  const request = await Friend.findByPk(req.params.requestId);
  if (!request) return res.status(404).json({ error: "Request not found" });
  if (request.friendid !== req.user.id) return res.status(403).json({ error: "Not authorized" });

  await request.update({ status: "accepted" });
  res.json({ message: "Friend request accepted" });
});

// Reject friend request
router.post("/reject/:requestId", auth, async (req, res) => {
  const request = await Friend.findByPk(req.params.requestId);
  if (!request) return res.status(404).json({ error: "Request not found" });
  if (request.friendid !== req.user.id) return res.status(403).json({ error: "Not authorized" });

  await request.update({ status: "rejected" });
  res.json({ message: "Friend request rejected" });
});

module.exports = router;
