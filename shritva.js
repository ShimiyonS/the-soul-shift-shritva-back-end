import express from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import cors from "cors";
import routes from "./routes/index.js";

dotenv.config();
const PORT = process.env.PORT || 8000;
const app = express();
app.use(express.json());

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// API routes (includes /api/auth/login, /api/auth/refresh, /api/auth/logout)
app.use('/api', routes);

// Error handler (e.g. auth 401/403)
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Something went wrong'
  });
});

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
            from: `"${process.env.SMTP_NAME}" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
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

        res.json({ success: true, message: "Message sent successfully " });
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


        // indian time format
        const dateIndia = new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
        });

        // Email content (format)
        let mailOptions = {
            from: `"My Website" <${email}>`,
            to: email, // where you receive notifications
            subject: "New Subscription Alert ",
            html: `
        <h2>🎉 New Subscriber!</h2>
        <p>A new user has subscribed to your website.</p>
        <table border="1" cellpadding="5" cellspacing="0">
          <tr><td>📧 Email</td><td>${email}</td></tr>
          <tr><td>📅 Date</td><td>${dateIndia}</td></tr>
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

// 📅 Appointment API with Email and Google Sheets (via Google Apps Script)
// 
// Google Apps Script Setup (Simple - No Google Cloud needed):
// 1. Open your Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Paste the provided script (see comments below)
// 4. Save and deploy as Web App
// 5. Copy the Web App URL and set GOOGLE_APPS_SCRIPT_URL in .env
// 
// Environment Variable Required:
// - GOOGLE_APPS_SCRIPT_URL: Your Google Apps Script Web App URL
//
app.post("/api/appointment", async (req, res) => {
    try {
        const { fullName, email, phone, service, preferredDate, preferredTime, duration, message } = req.body;

        // 1. Setup email transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // 2. Send email notification
        const mailOptions = {
            from: `"${process.env.SMTP_NAME || 'Shritva'}" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: `New Appointment Request: ${service}`,
            html: `
                <h3>New Appointment Request</h3>
                <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                    <tr><td><strong>Full Name:</strong></td><td>${fullName}</td></tr>
                    <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
                    <tr><td><strong>Phone:</strong></td><td>${phone}</td></tr>
                    <tr><td><strong>Service:</strong></td><td>${service}</td></tr>
                    <tr><td><strong>Preferred Date:</strong></td><td>${preferredDate || 'Not specified'}</td></tr>
                    <tr><td><strong>Message:</strong></td><td>${message || 'No additional notes'}</td></tr>
                </table>
            `,
        };

        await transporter.sendMail(mailOptions);

        // 3. Update Google Sheets via Google Apps Script (Simple alternative)
        try {
            const googleAppsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

            console.log("googleAppsScriptUrl", googleAppsScriptUrl);

            if (googleAppsScriptUrl) {
                const sheetData = {
                    fullName: fullName,
                    email: email,
                    phone: phone,
                    service: service,
                    preferredDate: preferredDate || 'Not specified',
                    preferredTime: preferredTime || 'Not specified',
                    duration: `${duration} minutes`,
                    message: message || 'No additional notes'
                };

                // Use native fetch (Node 18+) or node-fetch
                let fetchFunction;
                if (typeof globalThis.fetch === 'function') {
                    fetchFunction = globalThis.fetch;
                } else {
                    const nodeFetch = await import('node-fetch');
                    fetchFunction = nodeFetch.default;
                }

                // Send data to Google Apps Script web app
                const response = await fetchFunction(googleAppsScriptUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(sheetData),
                });

                const responseText = await response.text();

                if (response.ok) {
                    console.log("✅ Appointment saved to Google Sheets via Apps Script");
                } else {
                    console.error("Google Apps Script response error:", response.status, response.statusText);
                    console.error("Response body:", responseText);

                    if (response.status === 401 || responseText.includes('Unauthorized')) {
                        console.error("⚠️ Authorization Error: Please authorize the Google Apps Script:");
                        console.error("1. Open your Google Apps Script project");
                        console.error("2. Run the testDoPost() function once to trigger authorization");
                        console.error("3. Click 'Review Permissions' and authorize");
                        console.error("4. Redeploy the web app (Deploy > Manage deployments > Edit > Deploy)");
                    }
                }
            }
        } catch (sheetsError) {
            console.error("Google Sheets error (non-critical):", sheetsError);
            // Continue even if Sheets update fails
        }

        res.json({
            success: true,
            message: "Appointment request submitted successfully. We will connect with you shortly."
        });
    } catch (error) {
        console.error("Appointment error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again."
        });
    }
});

app.get("/", (req, res) => {
    res.send("API is running...");
});
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));