const express = require("express");
const router = express.Router();

// Hardcoded gym info for now (later we can fetch from DB)
const gymInfo = {
  name: "IRON PARADISE GYM & BADMINTON COURT",
  description: "A premier fitness destination featuring top-tier equipment and a dedicated badminton court. Rated 4.8 stars by our community.",
  address: "skp thottam, 177, Sathy Rd, Lakshmi Nagar, Kurumbapalayam SSKulam, Kovilpalayam, Tamil Nadu 641107",
  openingHours: "Mon-Sat: 5:30 AM - 9:00 PM | Sun: 5-10 AM, 4:30-8:30 PM",
  equipment: {
    treadmills: 5,
    dumbbells: 20,
    benches: 8,
    squatRacks: 3,
    cycles: 6,
    badmintonCourts: 1
  },
  membership: "One-Day Pass | Monthly | Tri-Monthly | Half-yearly | Yearly"
};

// GET /api/gym
router.get("/", (req, res) => {
  res.json(gymInfo);
});

module.exports = router;
