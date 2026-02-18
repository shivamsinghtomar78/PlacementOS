import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

// Lazy-initialized transporter to avoid crashes when SMTP env vars are missing
let _transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
    if (_transporter) return _transporter;

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return null;
    }

    _transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    return _transporter;
}

export async function sendNotificationEmail(to: string, subject: string, text: string, html?: string) {
    const transporter = getTransporter();
    if (!transporter) {
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
