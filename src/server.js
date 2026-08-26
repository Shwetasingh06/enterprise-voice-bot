import "dotenv/config";
import express from "express";
import cors from "cors";

import { authenticateUser } from "./auth.js";
import { getAccountBalance } from "./balance.js";
import { blockCard } from "./card.js";
import { sendNotification } from "./notification.js";
import { createSession, getSession } from "./session.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Enterprise Voice Bot API is running",
  });
});

app.post("/api/authenticate", (req, res) => {
  const { accountNumber, pin } = req.body;
  console.log("Received authentication request:", { accountNumber, pin });

  if (!accountNumber || !pin) {
    return res.status(400).json({
      authenticated: false,
      reason: "ACCOUNT_NUMBER_AND_PIN_REQUIRED",
    });
  }

  const result = authenticateUser(accountNumber, pin);

  if (!result.authenticated) {
    return res.status(401).json(result);
  }

  const sessionToken = createSession(result.userId);

  return res.status(200).json({
    authenticated: true,
    sessionToken,
    user: {
      userId: result.userId,
      accountNumber: result.accountNumber,
      name: result.name,
    },
  });
});

app.post("/api/balance", (req, res) => {
    const authHeader = req.headers.authorization;

    let token = null;

    // Support Bearer token
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
    }

    // Also support sessionToken from request body
    if (!token && req.body.sessionToken) {
        token = req.body.sessionToken;
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            reason: "AUTHENTICATION_REQUIRED"
        });
    }

    const session = getSession(token);

    if (!session) {
        return res.status(401).json({
            success: false,
            reason: "INVALID_OR_EXPIRED_SESSION"
        });
    }

    const result = getAccountBalance(session.userId);

    if (!result.success) {
        return res.status(404).json(result);
    }

    return res.status(200).json(result);
});

app.post("/api/block-card", (req, res) => {
    const authHeader = req.headers.authorization;

    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
    }

    if (!token && req.body.sessionToken) {
        token = req.body.sessionToken;
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            reason: "AUTHENTICATION_REQUIRED"
        });
    }

    const session = getSession(token);

    if (!session) {
        return res.status(401).json({
            success: false,
            reason: "INVALID_OR_EXPIRED_SESSION"
        });
    }

    const {
        cardLast4,
        reason
    } = req.body;

    if (!cardLast4) {
        return res.status(400).json({
            success: false,
            reason: "CARD_LAST4_REQUIRED"
        });
    }

    const result = blockCard(
        session.userId,
        cardLast4,
        reason
    );

    if (!result.success) {
        return res.status(400).json(result);
    }

    return res.status(200).json(result);
});

app.post("/api/notification", async (req, res) => {
  const { userId, ticketNumber, channel } = req.body;

  if (!userId || !ticketNumber) {
    return res.status(400).json({
      success: false,
      reason: "USER_ID_AND_TICKET_NUMBER_REQUIRED",
    });
  }

  const result = await sendNotification(userId, ticketNumber, channel || "email");

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(200).json(result);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
