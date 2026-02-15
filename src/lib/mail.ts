import nodemailer from "nodemailer";

// NOTE: User needs to provide environment variables for this to work
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendNotificationEmail(to: string, subject: string, text: string, html?: string) {
    if (!process.env.SMTP_USER) {
        console.log("SMTP not configured, skipping email notification:", { to, subject });
        return;
    }

    try {
        await transporter.sendMail({
            from: `"PlacementOS" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html: html || text,
        });
        console.log("Email sent successfully to", to);
    } catch (error) {
        console.error("Email sending failed:", error);
    }
}
