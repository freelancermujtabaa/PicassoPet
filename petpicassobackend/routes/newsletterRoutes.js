import express from "express";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const router = express.Router();

router.post("/", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });

  const msg = {
    to: email,
    from: process.env.EMAIL_FROM, // must be a verified sender in SendGrid
    subject: "🎨 Thanks for subscribing to PetPicasso!",
    text: "You’re now subscribed to our newsletter. Stay tuned for new art styles, limited releases, and exclusive discounts.",
    html: `
      <h2 style="color:#4A90A4">Welcome to PetPicasso!</h2>
      <p>Thanks for subscribing to our newsletter 🐾</p>
      <p>You’ll be the first to hear about new art styles, limited releases, and exclusive discounts.</p>
      <br/>
      <p>– The PetPicasso Team</p>
    `,
  };

  try {
    await sgMail.send(msg);
    res.json({ message: "Subscription successful" });
  } catch (error) {
    console.error("SendGrid error:", error.response?.body || error.message);
    res.status(500).json({ error: "Failed to send confirmation email" });
  }
});

export default router;
