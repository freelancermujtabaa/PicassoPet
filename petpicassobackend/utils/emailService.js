import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Email template for PIN verification
const createPinEmailTemplate = (pin, userName) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2>Email Verification</h2>
        <p>Hello ${userName || 'there'},</p>
        <p>Your verification code is:</p>
        <div style="text-align: center; margin: 20px 0;">
          <h1 style="color: #ff6b35; letter-spacing: 8px;">${pin}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
      </div>
    </div>
  `;
};

export const sendPinVerificationEmail = async (email, pin, userName = '') => {
  try {
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM, // must be verified in SendGrid
      subject: 'PetPicasso - Email Verification Code',
      html: createPinEmailTemplate(pin, userName),
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending email via SendGrid API:', error);
    return { success: false, error: error.message };
  }
};

export const sendPinResendEmail = async (email, pin, userName = '') => {
  try {
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM, // must be verified in SendGrid
      subject: 'PetPicasso - New Verification Code',
      html: createPinEmailTemplate(pin, userName),
    };

    await sgMail.send(msg);
    console.log(`✅ Resend email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending resend email via SendGrid API:', error);
    return { success: false, error: error.message };
  }
};


export const sendContactEmail = async ({ firstName, lastName, email, subject, message }) => {
  try {
    const msg = {
      to: email, // send confirmation to the user
      from: process.env.EMAIL_FROM,
      subject: `Thanks for contacting Pet Picasso – ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;max-width: 600px; margin: 0 auto; background-color: #f9f9f9;">
          <h2>Hi ${firstName} ${lastName},</h2>
          <p>Thank you for reaching out to Pet Picasso! 🎨</p>
          <p>We’ve received your message:</p>
          <blockquote style="border-left: 3px solid #4DB2E2; padding-left: 10px; color: #555;">
            ${message || "(no message provided)"}
          </blockquote>
          <p>Our team will get back to you shortly.</p>
          <br/>
          <p>Best,</p>
          <p><b>Pet Picasso Team</b></p>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log(`✅ Contact email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending contact email:", error);
    return { success: false, error: error.message };
  }
};
