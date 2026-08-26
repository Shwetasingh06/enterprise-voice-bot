# Enterprise Banking Voice Assistant

A secure, agentic voice-based banking assistant built using the **Enterprise Bot AIDA platform**, Node.js, Express, and SQLite.

The assistant allows customers to interact with banking services through voice and supports:

- Customer authentication using account number and PIN
- Account balance lookup
- Lost/compromised card blocking
- Explicit confirmation before card blocking
- Ticket/reference number generation
- Email notification after successful card blocking
- Authentication and backend error handling
- Session-based authorization between API calls

---

## 1. Project Objective

The objective of this project is to build an **agentic voice banking assistant** that can authenticate a customer, retrieve account information, and perform a card-blocking operation through backend APIs.

The Enterprise Bot AIDA platform is used as the voice-agent layer.

The LLM decides when to:

1. Ask the customer for authentication information.
2. Call the authentication tool.
3. Use the returned session token.
4. Call the balance tool.
5. Ask for card information.
6. Ask for confirmation before blocking a card.
7. Call the card-blocking tool.
8. Send an email confirmation after a successful card block.

The backend is separated from the voice agent. The AIDA agent does not directly access the SQLite database.

---

## 2. High-Level Architecture

```text
                         CUSTOMER
                            |
                            | Voice
                            v
                +------------------------+
                | Enterprise Bot AIDA    |
                | Voice AI Agent         |
                +-----------+------------+
                            |
                            | Tool Calls / HTTPS
                            v
                +------------------------+
                | ngrok HTTPS Tunnel     |
                +-----------+------------+
                            |
                            | localhost:3000
                            v
                +------------------------+
                | Node.js + Express API  |
                +-----------+------------+
                            |
              +-------------+-------------+
              |             |             |
              v             v             v
        Authentication   Balance      Card Blocking
              |             |             |
              +-------------+-------------+
                            |
                            v
                      +-----------+
                      |  SQLite   |
                      | Database  |
                      +-----------+
                            |
                            v
                    Notification API
                            |
                            v
                          Email
```

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Voice AI | Enterprise Bot AIDA |
| Backend | Node.js |
| API Framework | Express.js |
| Database | SQLite |
| SQLite Driver | better-sqlite3 |
| Authentication | Account Number + PIN |
| Session Management | In-memory session |
| Notification | Email |
| Public HTTPS Tunnel | ngrok |
| API Testing | PowerShell |
| Source Control | Git / GitHub |

---

## 4. Project Structure

```text
enterprise-voice-bot/
│
├── src/
│   ├── server.js
│   ├── db.js
│   ├── auth.js
│   ├── balance.js
│   ├── card.js
│   ├── notification.js
│   └── session.js
│
├── package.json
├── package-lock.json
├── README.md
└── ...
```

### `src/server.js`

Main Express application. It:

- Starts the HTTP server
- Defines REST endpoints
- Parses JSON requests
- Handles authentication
- Validates sessions
- Calls database/service functions
- Returns API responses

### `src/db.js`

Responsible for the SQLite database connection and database access.

### `src/auth.js`

Contains customer authentication logic and validates account number and PIN.

### `src/balance.js`

Contains the logic for retrieving the authenticated customer's account balance.

### `src/card.js`

Contains card-related functionality including card lookup, validation, blocking, and ticket generation.

### `src/session.js`

Handles session creation and session lookup.

### `src/notification.js`

Handles email notification after successful card blocking.

---

## 5. Database

SQLite is used because this is a lightweight demonstration project. It does not require an external database server and is sufficient for the small dataset required by the assignment.

The database contains synthetic/demo customer data.

---

## 6. Customer Accounts

The application contains three demo accounts.

| ID | Account Number | Name | Email |
|---:|---|---|---|
| 1 | ACC1001 | Rahul Sharma | configured email |
| 2 | ACC1002 | Priya Singh | priya@example.com |
| 3 | ACC1003 | Amit Kumar | amit@example.com |

Credentials and balances are stored in the database.

> **Note:** All customer information is synthetic/demo data.

---

## 7. Cards

The database contains demo cards.

Example:

| ID | Account ID | Last 4 Digits | Status |
|---:|---:|---|---|
| 1 | 1 | 1234 | ACTIVE |
| 2 | 2 | 5678 | ACTIVE |
| 3 | 3 | 9012 | ACTIVE |

Possible card statuses:

```text
ACTIVE
BLOCKED
```

After a successful card-blocking operation, the relevant card changes to `BLOCKED`.

---

## 8. Prerequisites

Install the following:

- Node.js
- npm
- Git
- ngrok
- Access to the Enterprise Bot AIDA platform

Verify Node.js:

```powershell
node --version
```

Verify npm:

```powershell
npm --version
```

Verify ngrok:

```powershell
ngrok version
```

---

## 9. Clone the Repository

```powershell
git clone https://github.com/Shwetasingh06/enterprise-voice-bot.git
```

Move into the project:

```powershell
cd enterprise-voice-bot
```

---

## 10. Install Dependencies

```powershell
npm install
```

---

## 11. Start the Backend

Start the Node.js server:

```powershell
node src/server.js
```

The backend runs on:

```text
http://localhost:3000
```

---

## 12. Verify the Backend

Open:

```text
http://localhost:3000/
```

Expected response:

```json
{
  "message": "Enterprise Voice Bot API is running"
}
```

---

## 13. Verify the Database

Run:

```powershell
node -e "import('./src/db.js').then(({default:db}) => console.log(db.prepare('SELECT id,name,email FROM accounts').all()))"
```

The result should contain three demo users.

---

## 14. API Endpoints

The backend exposes four main API endpoints:

```text
POST /api/authenticate
POST /api/balance
POST /api/block-card
POST /api/notification
```

---

## 15. Authentication API

### Endpoint

```http
POST /api/authenticate
```

### Request

```json
{
  "accountNumber": "ACC1001",
  "pin": "1234"
}
```

The backend:

1. Reads the account number.
2. Reads the PIN.
3. Validates the credentials.
4. Finds the customer.
5. Creates a session.
6. Returns the session token.

### Successful Response

```json
{
  "authenticated": true,
  "sessionToken": "SESSION_TOKEN",
  "user": {
    "userId": 1,
    "accountNumber": "ACC1001",
    "name": "Rahul Sharma"
  }
}
```

---

## 16. Session Management

The session token is created only after successful authentication.

```text
Account Number + PIN
          |
          v
    Authentication
          |
          v
    Valid Credentials
          |
          v
    Create Session
          |
          v
    Session Token
```

The customer does not need to know or provide the session token.

The agent retains it internally and uses it for authenticated operations.

---

## 17. Account Balance API

### Endpoint

```http
POST /api/balance
```

The backend validates the customer's session before returning account information.

The current implementation supports the session token in the request body:

```json
{
  "sessionToken": "SESSION_TOKEN"
}
```

The backend performs:

```text
sessionToken
     |
     v
getSession()
     |
     v
authenticated user ID
     |
     v
getAccountBalance(userId)
     |
     v
account balance
```

### Example Response

```json
{
  "success": true,
  "userId": 1,
  "accountNumber": "ACC1001",
  "name": "Rahul Sharma",
  "balance": 52340.5,
  "currency": "INR"
}
```

> The backend also contains support for a `Bearer` authorization header. The AIDA tool configuration for this demo passes `sessionToken` as the request parameter/body value.

---

## 18. Card Blocking API

### Endpoint

```http
POST /api/block-card
```

### Request

```json
{
  "sessionToken": "SESSION_TOKEN",
  "cardLast4": "1234",
  "reason": "Lost card"
}
```

The backend:

1. Validates the session.
2. Identifies the authenticated customer.
3. Reads the card's last four digits.
4. Checks whether the card belongs to that customer.
5. Checks the card status.
6. Blocks the card.
7. Generates a ticket number.
8. Returns the result.

### Example Response

```json
{
  "success": true,
  "ticketNumber": "CARD-XXXXXXXX",
  "cardLast4": "1234",
  "status": "BLOCKED",
  "reason": "Lost card"
}
```

---

## 19. Notification API

### Endpoint

```http
POST /api/notification
```

### Request

```json
{
  "userId": 1,
  "ticketNumber": "CARD-XXXXXXXX",
  "channel": "email"
}
```

The notification service looks up the customer's email address and sends a confirmation containing:

- Customer name
- Ticket number
- Card-block confirmation

### Example Response

```json
{
  "success": true,
  "channel": "email",
  "recipient": "customer@example.com",
  "ticketNumber": "CARD-XXXXXXXX",
  "messageId": "..."
}
```

---

# 20. AIDA Tools

The AIDA agent uses four backend tools.

## Tool 1 — `authenticate_customer`

**Purpose:** Authenticate the customer.

**HTTP method:**

```text
POST
```

**Endpoint:**

```text
/api/authenticate
```

**Parameters:**

```text
accountNumber
pin
```

---

## Tool 2 — `get_account_balance`

**Purpose:** Retrieve the authenticated customer's balance.

**HTTP method:**

```text
POST
```

**Endpoint:**

```text
/api/balance
```

**Parameter:**

```text
sessionToken
```

The `sessionToken` must be the exact token returned by `authenticate_customer`.

---

## Tool 3 — `block_card`

**Purpose:** Block a lost or compromised card.

**HTTP method:**

```text
POST
```

**Endpoint:**

```text
/api/block-card
```

**Parameters:**

```text
sessionToken
cardLast4
reason
```

---

## Tool 4 — `send_notification`

**Purpose:** Send the card-block confirmation email.

**HTTP method:**

```text
POST
```

**Endpoint:**

```text
/api/notification
```

**Parameters:**

```text
userId
ticketNumber
channel
```

---

# 21. AIDA Agent Instructions

The AIDA agent is configured as a secure Enterprise Banking voice assistant.

Its main responsibilities are:

1. Authenticate customers.
2. Check authenticated account balances.
3. Help authenticated customers block lost or compromised cards.

Security requirements include:

- Authenticate before revealing account information.
- Ask for account number and PIN.
- Never ask for date of birth because it is not required by the authentication API.
- Never reveal the customer's PIN.
- Never reveal the session token.
- Retain the session token internally after authentication.
- Use the session token for subsequent authenticated tools.
- Ask for explicit confirmation before blocking a card.
- Do not block a card when the customer rejects the confirmation.

---

# 22. ngrok Setup

AIDA needs to reach the locally running Node.js server.

Run:

```powershell
ngrok http 3000
```

ngrok provides a public HTTPS URL similar to:

```text
https://example.ngrok-free.dev
```

Use the generated URL as the base URL for the AIDA tools.

For example:

```text
https://example.ngrok-free.dev/api/authenticate
https://example.ngrok-free.dev/api/balance
https://example.ngrok-free.dev/api/block-card
https://example.ngrok-free.dev/api/notification
```

> The ngrok URL is temporary and may change when the tunnel is restarted.

---

# 23. Manual API Testing

## Authentication

```powershell
$auth = Invoke-RestMethod `
  -Uri "https://YOUR-NGROK-URL/api/authenticate" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"accountNumber":"ACC1001","pin":"1234"}'
```

View the result:

```powershell
$auth
```

Expected:

```text
authenticated : True
sessionToken  : ...
user          : ...
```

---

## Balance

Use the returned token:

```powershell
Invoke-RestMethod `
  -Uri "https://YOUR-NGROK-URL/api/balance" `
  -Method Post `
  -ContentType "application/json" `
  -Body (@{
      sessionToken = $auth.sessionToken
  } | ConvertTo-Json)
```

Expected:

```text
success       : True
userId        : 1
accountNumber : ACC1001
name          : Rahul Sharma
balance       : 52340.5
currency      : INR
```

---

## Card Blocking

Authenticate first:

```powershell
$auth = Invoke-RestMethod `
  -Uri "https://YOUR-NGROK-URL/api/authenticate" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"accountNumber":"ACC1001","pin":"1234"}'
```

Then:

```powershell
Invoke-RestMethod `
  -Uri "https://YOUR-NGROK-URL/api/block-card" `
  -Method Post `
  -ContentType "application/json" `
  -Body (@{
      sessionToken = $auth.sessionToken
      cardLast4 = "1234"
      reason = "Lost card"
  } | ConvertTo-Json)
```

---

## Notification

```powershell
Invoke-RestMethod `
  -Uri "https://YOUR-NGROK-URL/api/notification" `
  -Method Post `
  -ContentType "application/json" `
  -Body (@{
      userId = 1
      ticketNumber = "CARD-XXXXXXXX"
      channel = "email"
  } | ConvertTo-Json)
```

---

# 24. End-to-End Balance Flow

```text
Customer
   |
   | "I want to check my balance"
   v
AIDA
   |
   | Ask account number
   v
Customer
   |
   | ACC1001
   v
AIDA
   |
   | Ask PIN
   v
Customer
   |
   | 1234
   v
authenticate_customer
   |
   v
POST /api/authenticate
   |
   v
SQLite
   |
   v
Authentication successful
   |
   v
sessionToken
   |
   v
get_account_balance
   |
   v
POST /api/balance
   |
   v
SQLite
   |
   v
Balance
   |
   v
AIDA voice response
```

---

# 25. End-to-End Card Blocking Flow

```text
Customer requests card block
          |
          v
Authenticate customer
          |
          v
Ask card last 4 digits
          |
          v
Ask reason
          |
          v
Ask for confirmation
          |
       +--+--+
       |     |
      NO    YES
       |     |
       v     v
    Cancel  block_card
              |
              v
        Generate Ticket
              |
              v
       send_notification
              |
              v
             Email
              |
              v
       Final voice response
```

---

# 26. Important Safety Behavior

Card blocking is a destructive action, so the assistant must obtain explicit confirmation.

### Customer says NO

```text
Assistant:
You want to block the card ending in 1234 because it was lost.
Would you like me to proceed?

Customer:
No, don't block it.
```

Expected behavior:

```text
No block_card call
No database update
No ticket generated
No notification sent
```

### Customer says YES

```text
Customer:
Yes, please block it.
```

Expected behavior:

```text
block_card
    |
    v
ticket generated
    |
    v
send_notification
    |
    v
email confirmation
```

---

# 27. Voice Test Scenarios

## Scenario 1 — Successful Balance Lookup

Say:

> I want to check my account balance.

When asked for the account number:

> ACC1001

When asked for the PIN:

> 1234

Expected:

> The assistant authenticates the customer, calls the balance tool, and provides the balance.

---

## Scenario 2 — Wrong PIN

Say:

> I want to check my account balance.

Provide:

```text
ACC1001
9999
```

Expected:

- Authentication fails.
- Balance tool is not called.
- Balance is not revealed.
- Assistant reports authentication failure.

---

## Scenario 3 — Card Block Confirmed

Say:

> I lost my card and want to block it.

Authenticate using the demo account.

Provide the card's last four digits and reason.

When asked for confirmation:

> Yes, please block it.

Expected:

- Card is blocked.
- Ticket is generated.
- Email notification is sent.
- Assistant reads the ticket/reference number.

---

## Scenario 4 — Card Block Rejected

When the assistant asks:

> Would you like me to proceed with blocking the card?

Say:

> No, don't block it.

Expected:

- `block_card` is not called.
- Card remains active.
- No ticket is generated.
- No notification is sent.

---

## Scenario 5 — Session Token Protection

Ask:

> What is my session token?

Expected:

- The assistant must not reveal it.

---

## Scenario 6 — PIN Protection

Ask:

> What PIN did I provide?

Expected:

- The assistant must not reveal the PIN.

---

## Scenario 7 — Unauthorized Balance Request

Start a fresh conversation and say:

> What is my account balance?

Expected:

- The assistant asks for authentication.
- It does not reveal account information before authentication.

---

# 28. Error Handling

The application handles:

### Authentication errors

- Missing account number
- Missing PIN
- Invalid credentials
- Invalid/expired session

### Balance errors

- Authentication required
- Invalid session
- Account not found

### Card errors

- Missing card last four digits
- Card not found
- Card already blocked
- Card does not belong to authenticated user
- Invalid/expired session

### Notification errors

- Notification failure
- Invalid recipient
- Backend/service failure

The assistant should communicate failures clearly and must not claim that an operation succeeded when the backend reports failure.

---

# 29. Why This Is Agentic

The application does not hardcode a fixed conversational flow.

The LLM determines the required action based on the customer's request.

For example:

```text
Customer:
What's my balance?

        ↓

AIDA identifies that balance
requires authentication.

        ↓

Ask account number.

        ↓

Ask PIN.

        ↓

Call authenticate_customer.

        ↓

Authentication succeeds.

        ↓

Retain sessionToken.

        ↓

Call get_account_balance.

        ↓

Respond to customer.
```

For card blocking, the agent similarly determines that authentication and explicit confirmation are required before calling the destructive operation.

---

# 30. Separation of Responsibilities

### AIDA

Responsible for:

- Voice interaction
- Natural language understanding
- Asking questions
- Deciding when tools are required
- Presenting responses

### Node.js API

Responsible for:

- Request validation
- Authentication
- Session validation
- Business logic
- Database access
- Card blocking
- Ticket generation
- Notifications

### SQLite

Responsible for:

- Customer records
- Account information
- Card information
- Card status

The LLM does not directly access or modify the database.

---

# 31. Security Considerations

This is a demonstration project and uses synthetic data.

For production banking usage, the following would be required:

- Stronger multi-factor authentication
- Secure credential storage
- PIN hashing
- Production-grade session storage such as Redis
- PostgreSQL or another production database
- Secrets management
- HTTPS
- Rate limiting
- Account lockout policies
- Audit logging
- Monitoring and alerting
- Automated tests
- Role-based access control
- Strong server-side authorization
- Transaction-level controls
- Production deployment

---

# 32. Future Improvements

With more time, I would:

1. Replace demonstration PIN authentication with stronger MFA such as OTP.
2. Move session management to Redis for multi-instance deployments.
3. Add comprehensive unit, integration, and end-to-end tests.
4. Add structured audit logs for authentication, balance access, and card-blocking operations.
5. Add stronger server-side safeguards around destructive operations.
6. Replace the development ngrok tunnel with a production HTTPS deployment.
7. Add monitoring and alerting for backend and notification failures.

---

# 33. Demo Video

The submitted demo demonstrates the working voice assistant through the Enterprise Bot AIDA platform.

The demo covers:

- Voice input
- Customer authentication
- Account balance retrieval
- Lost/compromised card flow
- Confirmation before card blocking
- Ticket generation
- Email notification
- Error handling

---

# 34. Repository

GitHub:

https://github.com/Shwetasingh06/enterprise-voice-bot

---

# 35. AIDA Agent

Agent ID:

```text
6a8ebe31d8e0cb12a4863f8c
```

---

# 36. Final End-to-End Architecture

```text
                   CUSTOMER
                      |
                      | Voice
                      v
               ENTERPRISE BOT AIDA
                      |
                      |
              Understand Intent
                      |
             +--------+--------+
             |                 |
             v                 v
       Balance Request    Card Request
             |                 |
             +--------+--------+
                      |
                      v
             Authenticate Customer
                      |
                      v
            authenticate_customer
                      |
                      v
               Backend API
                      |
                      v
                  SQLite
                      |
                      v
             Session Created
                      |
                      v
               sessionToken
                      |
              +-------+-------+
              |               |
              v               v
       get_account_balance   Card Flow
              |               |
              v               v
          Balance       Ask Confirmation
                              |
                    +---------+---------+
                    |                   |
                   NO                  YES
                    |                   |
                    v                   v
                 Cancel             block_card
                                        |
                                        v
                                  Generate Ticket
                                        |
                                        v
                                send_notification
                                        |
                                        v
                                      Email
                                        |
                                        v
                                  Voice Response
```

---

## Conclusion

The Enterprise Banking Voice Assistant demonstrates an end-to-end agentic banking workflow using voice interaction and backend tool calls.

The implementation ensures that:

- Customers are authenticated before accessing sensitive information.
- Account balances are retrieved through backend APIs.
- Session tokens are used for authenticated operations.
- Lost or compromised cards require explicit confirmation before blocking.
- Successful card blocks generate a ticket number.
- Customers receive an out-of-band email confirmation.
- Authentication and backend failures are handled gracefully.
- The AIDA agent communicates with the backend through controlled tools rather than directly accessing the database.

This architecture provides a clear separation between the conversational AI layer, backend business logic, and database layer, while providing a foundation for production-grade enhancements.
