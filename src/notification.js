import { Resend } from "resend";
import db from "./db.js";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendNotification(
    userId,
    ticketNumber,
    channel = "email"
) {
    const account = db.prepare(`
        SELECT
            id,
            name,
            email,
            phone
        FROM accounts
        WHERE id = ?
    `).get(userId);

    if (!account) {
        return {
            success: false,
            reason: "ACCOUNT_NOT_FOUND"
        };
    }

    if (channel !== "email") {
        return {
            success: false,
            reason: "UNSUPPORTED_NOTIFICATION_CHANNEL"
        };
    }

    if (!account.email) {
        return {
            success: false,
            reason: "EMAIL_NOT_FOUND"
        };
    }

    if (!process.env.RESEND_API_KEY) {
        return {
            success: false,
            reason: "RESEND_API_KEY_NOT_CONFIGURED"
        };
    }

    const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: [account.email],
        subject: "Card Block Confirmation",
        html: `
            <h2>Card Block Confirmation</h2>

            <p>Hello ${account.name},</p>

            <p>Your card has been successfully blocked.</p>

            <p>
                <strong>Ticket Number:</strong>
                ${ticketNumber}
            </p>

            <p>
                If you did not request this action,
                please contact customer support immediately.
            </p>
        `
    });

    if (error) {
        console.error("Resend error:", error);

        return {
            success: false,
            reason: "NOTIFICATION_FAILED",
            error: error.message
        };
    }

    return {
        success: true,
        channel: "email",
        recipient: account.email,
        ticketNumber,
        messageId: data.id
    };
}

export {
    sendNotification
};