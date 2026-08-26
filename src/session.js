import crypto from "crypto";

const sessions = new Map();

function createSession(userId) {
    const token = crypto.randomBytes(32).toString("hex");

    sessions.set(token, {
        userId,
        createdAt: Date.now()
    });

    return token;
}

function getSession(token) {
    if (!token) {
        return null;
    }

    return sessions.get(token) || null;
}

function deleteSession(token) {
    sessions.delete(token);
}

export {
    createSession,
    getSession,
    deleteSession
};