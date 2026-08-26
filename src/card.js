import db from "./db.js";

function generateTicketNumber() {
    const timestamp = Date.now();

    return `CARD-${timestamp}`;
}

function blockCard(userId, cardLast4, reason) {
    // 1. Find the card and make sure it belongs to the user
    const card = db.prepare(`
        SELECT
            cards.id,
            cards.last4,
            cards.status,
            accounts.id AS account_id,
            accounts.name
        FROM cards
        INNER JOIN accounts
            ON cards.account_id = accounts.id
        WHERE cards.account_id = ?
          AND cards.last4 = ?
    `).get(userId, cardLast4);

    // Card not found
    if (!card) {
        return {
            success: false,
            reason: "CARD_NOT_FOUND"
        };
    }

    // Card is already blocked
    if (card.status === "BLOCKED") {
        return {
            success: false,
            reason: "CARD_ALREADY_BLOCKED"
        };
    }

    // 2. Block the card
    db.prepare(`
        UPDATE cards
        SET status = 'BLOCKED'
        WHERE id = ?
    `).run(card.id);

    // 3. Generate a ticket
    const ticketNumber = generateTicketNumber();

    // 4. Save ticket
    db.prepare(`
        INSERT INTO tickets (
            ticket_number,
            account_id,
            type,
            status,
            created_at
        )
        VALUES (?, ?, ?, ?, ?)
    `).run(
        ticketNumber,
        card.account_id,
        "CARD_BLOCK",
        "SUCCESS",
        new Date().toISOString()
    );

    return {
        success: true,
        ticketNumber,
        cardLast4: card.last4,
        status: "BLOCKED",
        reason: reason || "Card reported lost or compromised"
    };
}

export {
    blockCard
};