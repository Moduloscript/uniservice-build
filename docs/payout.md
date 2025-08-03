
# Automated Payout System: Implementation Guide

This guide provides a comprehensive overview of the architecture and workflow for an automated payout system designed to be secure, scalable, and user-friendly.

---

## 📊 **System Architecture & Data Flow**

The following diagram illustrates the complete end-to-end process, from the provider's initial request to the final payment settlement and notification.

```ascii
Provider Dashboard                                          Backend API Server                                               Admin Dashboard           Payment Gateway (Flutterwave)
┌──────────────────┐                                      ┌──────────────────────────────────────────────────────────────┐  ┌───────────────────┐     ┌───────────────────────┐
│ Initiate Payout  │                                      │                                                              │  │                   │     │                       │
│ (Amount, Method) │──POST /api/payouts──────────────────▶│ 1. RECEIVE & VALIDATE PAYOUT REQUEST                         │  │                   │     │                       │
└──────────────────┘                                      │  - Check for sufficient available balance                    │  │                   │     │                       │
       ▲                                                  │  - Create `Payout` record with `REQUESTED` status            │  │                   │     │                       │
       │                                                  │  - Log initial request                                       │  │                   │     │                       │
       │                                                  └───────────────────────────┬──────────────────────────────────┘  │                   │     │                       │
       │                                                                              ▼                                      │                   │     │                       │
       │                                                  ┌──────────────────────────────────────────────────────────────┐  │                   │     │                       │
       │                                                  │ 2. RISK ASSESSMENT ENGINE                                    │  │                   │     │                       │
       │                                                  │  - Amount Check: Is amount <= ₦50,000?                       │  │                   │     │                       │
       │                                                  │  - Provider History: Is provider verified? Past payouts?     │  │                   │     │                       │
       │                                                  │  - Fraud Flags: Unusual patterns? Velocity checks?           │  │                   │     │                       │
       │                                                  └───────────────────────────┬──────────────────────────────────┘  │                   │     │                       │
       │                                                                              ▼                                      │                   │     │                       │
       │                              ┌───────────────────( Low Risk )────────────────┴──────────────( High Risk )───────┐  │                   │     │                       │
       │                              │                                                                                │  │                   │     │                       │
       │                              ▼                                                                                ▼  │                   │     │                       │
       │  ┌──────────────────────────────────────────────┐                      ┌──────────────────────────────────────────────┐  │                   │     │                       │
       │  │ 3a. [AUTO] AUTOMATED APPROVAL PATH           │                      │ 3b. [MANUAL] MANUAL REVIEW PATH              │  │                   │     │                       │
       │  │  - Update Payout status to `APPROVED`        │                      │  - Flag Payout for manual review             │  │                   │     │                       │
       │  └───────────────────┬──────────────────────────┘                      │  - Notify admin via dashboard/email          │  │                   │     │                       │
       │                      │                                                  └──────────────────────────┬───────────────────┘  │                   │     │                       │
       │                      │                                                                             │                      │ View Flagged      │     │                       │
       │                      │                                                                             │                      │ Payouts           │     │                       │
       │                      └──────────────────────────┐                                                    │ ◀-------------------- │ ┌─────────────────┐ │     │                       │
       │                                                 │                                                   └───────────────────▶ │ │ Manual Approval │ │     │                       │
       │                                                 ▼                                                                         │ └───────┬─────────┘ │     │                       │
       │                                  ┌──────────────────────────────────────────────────────────────┐                         │         │           │     │                       │
       │                                  │ 4. PAYOUT QUEUE & BATCH PROCESSOR                            │                         └─────────┘           │     │                       │
       │                                  │  - Approved payouts added to a queue (e.g., Redis)           │                               (Approve/Reject)      │     │                       │
       │                                  │  - Scheduled job runs every 2 hours to process queue         │                                                     │     │                       │
       │                                  │  - Update Payout status to `PROCESSING`                      │                                                     │     │                       │
       │                                  └──────────────────────────┬───────────────────────────────────┘                                                     │     │                       │
       │                                                             │                                                                                         │     │                       │
       │                                                             │ (Initiate Transfer)                                                                     │     │                       │
       │                                                             └───────────────────────────────────────────────────────────────────────────────────────────▶ │ Flutterwave API │     │
       │                                                                                                                                                         │ (Transfers)     │     │
       │                                                                                                                                                         └─────────┬───────┘     │
       │                                                                                                                                                                   │ (Webhook)         │
       │  ┌──────────────────────────────────────────────────────────────┐                                                                                                 │                 │
       │  │ 6. NOTIFICATION SYSTEM                                       │                                                                                                 │                 │
       │  │  - Payout `COMPLETED`: Send success email/push notification  │                                                                                                 │                 │
       │  │  - Payout `FAILED`: Notify provider with reason and next steps│                                                                                                 │                 │
       │  └──────────────────────────────────────────────────────────────┘                                                                                                 │                 │
       │        ▲                                                                                                                                                          │                 │
       └────────│────────────────────────────────────────────────────────┐                                                                                                 │                 │
                │                                                        │                                                                                                 │                 │
                └────────────────────────────────────────────────────────┼──WEBHOOK /api/payout_status◀───────────────────────────────────────────────────────────────────┘                 │
                                                                         ▼                                                                                                                     │
                                          ┌──────────────────────────────────────────────────────────────┐                                                                                     │
                                          │ 5. WEBHOOK HANDLER & DATABASE UPDATES                        │                                                                                     │
                                          │  - `transfer.success`: Update status to `COMPLETED`          │                                                                                     │
                                          │                      Update `Earning` status to `PAID_OUT`     │                                                                                     │
                                          │  - `transfer.failed`: Update status to `FAILED`              │                                                                                     │
                                          │                     Log reason, trigger retry logic          │                                                                                     │
                                          └──────────────────────────────────────────────────────────────┘                                                                                     │

```

---

## Implementation Steps & Details

#### **1. Receive & Validate Payout Request**
-   **Endpoint**: `POST /api/provider/payouts`
-   **Initial Status**: When a request is received, a new record is created in the `Payout` table with its status set to `REQUESTED`.
-   **Validation**: The system immediately checks if the provider's `availableBalance` in the `Earning` table is greater than or equal to the requested payout amount. If not, the request is rejected with a `400 Bad Request` error.

#### **2. Risk Assessment Engine**
This is a critical, non-blocking step that determines the path for the payout.
-   **Low-Risk Criteria (Auto-Approval)**:
    -   Payout amount is less than or equal to **₦50,000**.
    -   Provider is **verified** and has a history of at least **3 successful payouts**.
    -   No recent high-risk flags (e.g., multiple failed payouts, recent change in bank details).
-   **High-Risk Criteria (Manual Review)**:
    -   Payout amount exceeds **₦50,000**.
    -   Provider has **fewer than 3 successful payouts** or is **unverified**.
    -   The system detects unusual activity, such as a sudden spike in payout frequency or amount.

#### **3. Approval Paths**
-   **3a. Automated Approval Path**: If the request is classified as low-risk, the payout status is automatically updated to `APPROVED`, and it proceeds directly to the Payout Queue.
-   **3b. Manual Review Path**: For high-risk requests, the payout is flagged and its status remains `REQUESTED`. An admin is notified to review it in the **Admin Dashboard**. The admin can then manually approve or reject the request.

#### **4. Payout Queue & Batch Processor**
-   **Technology**: A message queue (like Redis or RabbitMQ) holds all `APPROVED` payout requests.
-   **Process**: A scheduled job (e.g., a cron job running every 2 hours) consumes items from this queue.
-   **Status Update**: When the processor picks up a payout, it updates its status to `PROCESSING` and initiates a transfer request to the **Flutterwave API**.

#### **5. Webhook Handler & Database Updates**
-   **Endpoint**: `POST /api/webhooks/flutterwave/payout_status`
-   **Function**: This endpoint listens for real-time status updates from Flutterwave.
    -   On **`transfer.success`**:
        -   The `Payout` status is updated to `COMPLETED`.
        -   The corresponding `Earning` records are updated to `PAID_OUT`.
        -   The provider's `availableBalance` is recalculated.
    -   On **`transfer.failed`**:
        -   The `Payout` status is updated to `FAILED`.
        -   The reason for failure is logged.
        -   An automated retry can be scheduled (up to 3 times). After that, it requires manual intervention.

#### **6. Notification System**
-   Upon final status updates (`COMPLETED` or `FAILED`), the system triggers notifications to the provider via email and/or push notifications, ensuring transparency and closing the loop.

This structured approach balances speed and security, providing an excellent user experience while protecting the platform from risk.

---

## Redis Configuration & Background Workers

### The Problem Solved

The payout system was experiencing "ERR max number of clients reached" errors due to:
- Multiple Redis connections being created without proper pooling
- Workers being initialized multiple times in serverless/Next.js environments
- No proper connection lifecycle management

### Solution Architecture

1. **Singleton Redis Connections** - Ensures only one connection per type
2. **Worker Manager** - Centralized worker lifecycle management
3. **Environment-based Configuration** - Workers can be disabled in serverless environments
4. **Standalone Worker Process** - Run workers separately from the main app

### Environment Configuration

Add these Redis and worker settings to your `.env` file:

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_USERNAME=default
REDIS_DB=0

# Redis Connection Pool
REDIS_MAX_CLIENTS=50
REDIS_POOL_SIZE=10

# Worker Configuration
# Set to 'false' to disable workers (e.g., in serverless environments)
ENABLE_WORKERS=true

# Worker Concurrency Settings
PAYOUT_WORKER_CONCURRENCY=5
PAYOUT_WORKER_RATE_LIMIT=10
BATCH_WORKER_CONCURRENCY=1
BATCH_WORKER_RATE_LIMIT=1
```

### Running the Workers

#### Option 1: Integrated Mode (Development)

Run everything together (workers will be initialized with the app):
```bash
pnpm dev
```

#### Option 2: Separate Worker Process (Recommended for Production)

**Terminal 1** - Run the main application without workers:
```bash
ENABLE_WORKERS=false pnpm dev
```

**Terminal 2** - Run the standalone worker process:
```bash
pnpm --filter @repo/api worker
# or for development with auto-reload:
pnpm --filter @repo/api worker:dev
```

#### Option 3: Production Deployment

1. **Main Application** (e.g., on Vercel):
   - Set `ENABLE_WORKERS=false` in environment variables
   - Deploy normally

2. **Worker Process** (e.g., on Railway, Fly.io, or dedicated VPS):
   - Deploy the same codebase
   - Run command: `pnpm --filter @repo/api worker`
   - Ensure Redis connection details are configured

### Worker Process Components

1. **Payout Queue Worker** (`payout-queue.ts`)
   - Processes approved payouts from the queue
   - Handles Flutterwave API integration
   - Manages retry logic and error handling

2. **Batch Processor Worker** (`batch-worker.ts`)
   - Runs every 2 hours to process approved payouts
   - Handles bulk processing for efficiency
   - Updates payment statuses and logs

### Monitoring & Troubleshooting

#### Check Redis Connections
```bash
# Check Redis info
redis-cli info clients

# Monitor Redis commands
redis-cli monitor
```

#### Worker Health Checks
The worker process includes automatic health checks every 5 minutes, logging:
- Active Redis connections
- Worker job statistics
- Processing queue status

#### Common Issues

1. **"ERR max number of clients reached"**
   - Ensure `ENABLE_WORKERS=false` in serverless environments
   - Check Redis max clients configuration
   - Verify no duplicate worker processes are running

2. **Workers not processing jobs**
   - Verify Redis connection (`redis-cli ping`)
   - Check worker logs for errors
   - Ensure `ENABLE_WORKERS=true` for worker process

3. **High memory usage**
   - Reduce `PAYOUT_WORKER_CONCURRENCY`
   - Monitor Redis memory usage
   - Check for memory leaks in job processing

### Security Considerations

1. **Redis Security**
   - Always use password authentication in production
   - Use SSL/TLS for Redis connections
   - Restrict network access to Redis server

2. **Worker Security**
   - Validate all job data before processing
   - Implement rate limiting per worker
   - Use structured logging for audit trails
   - Never expose sensitive data in logs


