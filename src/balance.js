import db from "./db.js";

function getAccountBalance(userId) {
    const account = db.prepare(`
        SELECT
            id,
            account_number,
            name,
            balance
        FROM accounts
        WHERE id = ?
    `).get(userId);

    if (!account) {
        return {
            success: false,
            reason: "ACCOUNT_NOT_FOUND"
        };
    }

    return {
        success: true,
        userId: account.id,
        accountNumber: account.account_number,
        name: account.name,
        balance: account.balance,
        currency: "INR"
    };
}

export {
    getAccountBalance
};