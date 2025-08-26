import express from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import cors from "cors";
// import bodyParser from "b"


dotenv.config();
const PORT = process.env.PORT || 8000;
const app = express();
app.use(express.json());

// app.use(bodyParser.json());

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


// 📩 POST API for subscription
app.post("/subscribe", async (req, res) => {
    const { email } = req.body;
    console.log(email)
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    try {
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

        // Email content (format)
        let mailOptions = {
            from: `"My Website" <${email}>`,
            to: process.env.RECEIVER_EMAIL, // where you receive notifications
            subject: "New Subscription Alert ",
            html: `
        <h2>🎉 New Subscriber!</h2>
        <p>A new user has subscribed to your website.</p>
        <table border="1" cellpadding="5" cellspacing="0">
          <tr><td>📧 Email</td><td>${email}</td></tr>
          <tr><td>📅 Date</td><td>${new Date().toLocaleString()}</td></tr>
        </table>
        <p> Keep growing your subscribers!</p>
      `,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: "Subscription email sent!" });
        console.log("email send successfully ")
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ success: false, message: "Error sending email" });
    }
});

app.get("/", (req, res) => {
    res.send("API is running...");
});
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));