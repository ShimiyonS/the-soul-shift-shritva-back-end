import express from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import cors from "cors";


dotenv.config();
const PORT = process.env.PORT || 8000;
const app = express();
app.use(express.json());

app.use(cors({
    origin: "*",            // allow any origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));


// 📩 Contact API
app.post("/api/contact", async (req, res) => {
    try {
        const { fullName, email, service, message } = req.body;

        // 1. Setup transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST, // e.g., "smtp.gmail.com"
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for 587
            auth: {
                user: process.env.SMTP_USER, // your email
                pass: process.env.SMTP_PASS, // your email password or app password
            },
        });

        // 2. Mail options
        const mailOptions = {
            from: `"${fullName}" <${email}>`,
            to: process.env.RECEIVER_EMAIL,
            subject: `New Contact Form: ${service}`,
            text: `
        Full Name: ${fullName}
        Email: ${email}
        Service: ${service}
        Message: ${message}
      `,
            html: `
        <h3>New Contact Request</h3>
        <p><strong>Full Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
        };


        // 3. Send email
        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: "Message sent successfully ✅" });
    } catch (error) {
        console.error("Email error:", error);
        res.status(500).json({ success: false, message: "Something went wrong ❌" });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));