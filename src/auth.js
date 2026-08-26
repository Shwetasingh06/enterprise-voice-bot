import db from "./db.js";
import bcrypt from "bcryptjs";

function authenticateUser(accountNumber, pin) {
    const account = db.prepare(`
        SELECT id, account_number, name, pin_hash
        FROM accounts
        WHERE account_number = ?
    `).get(accountNumber);

    if (!account) {
        return {
            authenticated: false,
            reason: "ACCOUNT_NOT_FOUND"
        };
    }

    const isValidPin = bcrypt.compareSync(
        pin,
        account.pin_hash
    );

    if (!isValidPin) {
        return {
            authenticated: false,
            reason: "INVALID_CREDENTIALS"
        };
    }

    return {
        authenticated: true,
        userId: account.id,
        accountNumber: account.account_number,
        name: account.name
    };
}

export {
    authenticateUser
};