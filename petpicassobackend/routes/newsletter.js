import express from 'express';
import Newsletter from '../models/Newsletter.js';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const router = express.Router();

// @route   POST /api/newsletter/subscribe
// @desc    Subscribe to newsletter (save to DB + send email)
// @access  Public
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Check if email already exists
    const existingSubscriber = await Newsletter.findByEmail(email);
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(400).json({
          success: false,
          error: 'Email is already subscribed to our newsletter'
        });
      } else {
        // Reactivate subscription
        existingSubscriber.isActive = true;
        existingSubscriber.subscribedAt = new Date();
        await existingSubscriber.save();
        
        // Send welcome back email
        await sendWelcomeEmail(email);
        
        return res.json({
          success: true,
          message: 'You have successfully subscribed to our newsletter!'
        });
      }
    }

    // Create new subscription
    const newsletter = new Newsletter({
      email
    });

    await newsletter.save();

    // Send welcome email
    await sendWelcomeEmail(email);

    res.status(201).json({
      success: true,
      message: 'You have successfully subscribed to our newsletter!'
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error during subscription'
    });
  }
});

// Helper function to send welcome email
const sendWelcomeEmail = async (email) => {
  try {
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM, // must be a verified sender in SendGrid
      subject: "🎨 Thanks for subscribing to PetPicasso!",
      text: "You're now subscribed to our newsletter. Stay tuned for new art styles, limited releases, and exclusive discounts.",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color:#4A90A4; text-align: center;">Welcome to PetPicasso!</h2>
          <p style="font-size: 16px; color: #333;">Thanks for subscribing to our newsletter 🐾</p>
          <p style="font-size: 16px; color: #333;">You'll be the first to hear about:</p>
          <ul style="color: #333;">
            <li>New art styles and techniques</li>
            <li>Limited-edition releases</li>
            <li>Exclusive discounts and offers</li>
            <li>Pet art tips and inspiration</li>
          </ul>
          <br/>
          <p style="color: #666;">– The PetPicasso Team</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log('Welcome email sent to:', email);
  } catch (error) {
    console.error('SendGrid error:', error.response?.body || error.message);
    // Don't throw error here - we still want to save to database even if email fails
  }
};

// @route   POST /api/newsletter/unsubscribe
// @desc    Unsubscribe from newsletter
// @access  Public


export default router;