// routes/contact.js
import express from "express";
import { sendContactEmail } from "../utils/emailService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { firstName, lastName, email, subject, message } = req.body;

  if (!firstName || !lastName || !email || !subject) {
    return res.status(400).json({ success: false, error: "All required fields must be filled." });
  }

  try {
    const result = await sendContactEmail({ firstName, lastName, email, subject, message });

    if (result.success) {
      res.json({ success: true, message: "Your message has been sent successfully!" });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    console.error("❌ Error in /api/contact route:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
