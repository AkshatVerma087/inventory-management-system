# Inventory Management System

A simple, race-condition-free inventory management system built with Next.js, Prisma, PostgreSQL, and Redis.

## Setup & Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root. You'll need a Postgres database and a Redis instance (I used Neon and Upstash).
   ```env
   DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
   DIRECT_URL="postgresql://user:password@host/db?sslmode=require"
   UPSTASH_REDIS_REST_URL="https://your-upstash-url.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="your_token"
   CRON_SECRET="your_custom_secret"
   ```

3. **Database Setup:**
   Run migrations and seed the database with initial products and warehouses.
   ```bash
   npx prisma db push
   npm run prisma:seed
   ```

4. **Run the app:**
   ```bash
   npm run dev
   ```

## How the Expiry Mechanism Works in Production

Reservations are valid for 15 minutes. To make sure abandoned reservations don't lock up stock forever, there's a background cleanup process:

- I built a dedicated API endpoint at `/api/cron/release-expired`.
- When hit, it finds all `PENDING` reservations where the expiry time has passed and releases the stock back to the database.
- In production, there is a `vercel.json` config that tells Vercel to hit this endpoint automatically every minute via a Cron Job.
- To prevent random people from triggering it, the endpoint checks for a specific authorization header matching the `CRON_SECRET` environment variable.

## Correctness Under Concurrency

Inventory systems live or die by how they handle concurrent requests. If 100 people click "Reserve" on the last item at the exact same millisecond, the database shouldn't let 100 people reserve it.

To solve this, I used a **Redis Distributed Lock**. 
When a reservation request comes in, it tries to acquire a lock using a key specific to that item (`productID--warehouseID`). 
- If someone else is currently checking out that exact item, the request waits in line.
- Once it has the lock, it queries the database, verifies there is enough stock available, increments the reserved stock, and saves the reservation.
- Finally, it releases the lock.

This guarantees that stock checking and stock decrementing happen strictly one at a time for the same item, completely eliminating race conditions.

## Trade-offs & What I'd Do With More Time

I prioritized getting a robust, concurrency-safe backend over a perfect, feature-rich frontend. Here are some decisions I made and things I'd improve:

1. **Redis Locks vs Database Locks:** 
   Initially, I tried using native Postgres row-level locks (`SELECT ... FOR UPDATE` inside a database transaction). However, deploying this to serverless Postgres (using a connection pooler) caused transaction timeouts. Poolers just don't play nicely with long-running interactive transactions. I opted to rely entirely on the Redis lock, which is extremely fast and works perfectly in a serverless environment. Ideally, with more time, I'd add a database constraint as a final fallback (e.g., `CHECK (totalUnits - reservedUnits >= 0)`).

2. **Cron Job Precision:**
   The Vercel cron runs every minute. This means a reservation might technically hold stock for 15 minutes and 59 seconds. For a small app this is totally fine, but at a massive scale, an event-driven approach (like pushing a message to an AWS SQS queue with a strict 15-minute delay to release the stock) would be more precise than polling the database every minute.

3. **Server Refetching vs Optimistic UI:**
   Right now, the frontend relies heavily on Next.js Server Components and `revalidatePath` to refresh stock numbers after you make a reservation. This ensures the data is always perfectly in sync with the database, but it means you see a tiny loading delay. With more time, I'd implement full optimistic updates on the client side so the buttons feel instantly snappy.

4. **Testing:**
   Given more time, I would write automated load tests (e.g., using Artillery or K6) firing hundreds of concurrent requests at the API to definitively prove the system holds up under heavy stress.
