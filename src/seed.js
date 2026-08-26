import db from "./db.js";
import bcrypt from "bcryptjs";

const users = [
    {
        accountNumber: "ACC1001",
        name: "Rahul Sharma",
        pin: "1234",
        balance: 52340.50,
        email: "shwetasingh01official@gmail.com",
        phone: "9000000001",
        cardLast4: "1234"
    },
    {
        accountNumber: "ACC1002",
        name: "Priya Singh",
        pin: "5678",
        balance: 18750.00,
        email: "priya@example.com",
        phone: "9000000002",
        cardLast4: "5678"
    },
    {
        accountNumber: "ACC1003",
        name: "Amit Kumar",
        pin: "9012",
        balance: 91200.75,
        email: "amit@example.com",
        phone: "9000000003",
        cardLast4: "9012"
    }
];

const insertAccount = db.prepare(`
    INSERT OR IGNORE INTO accounts
    (
        account_number,
        name,
        pin_hash,
        balance,
        email,
        phone
    )
    VALUES (?, ?, ?, ?, ?, ?)
`);

const insertCard = db.prepare(`
    INSERT INTO cards
    (
        account_id,
        last4,
        status
    )
    VALUES (?, ?, 'ACTIVE')
`);

for (const user of users) {

    const pinHash = bcrypt.hashSync(user.pin, 10);

    insertAccount.run(
        user.accountNumber,
        user.name,
        pinHash,
        user.balance,
        user.email,
        user.phone
    );

    const account = db.prepare(`
        SELECT id
        FROM accounts
        WHERE account_number = ?
    `).get(user.accountNumber);

    const existingCard = db.prepare(`
        SELECT id
        FROM cards
        WHERE account_id = ?
    `).get(account.id);

    if (!existingCard) {
        insertCard.run(
            account.id,
            user.cardLast4
        );
    }
}

console.log("Database seeded successfully.");