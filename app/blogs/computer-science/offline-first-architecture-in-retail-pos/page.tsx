import type { Metadata } from "next"
import PageShell from "@/components/PageShell"

export const metadata: Metadata = {
  title: "Building an Offline-First Architecture for a Retail POS",
  description: "A deep-dive into the layered offline system powering StoreOS — covering service workers, IndexedDB, web workers, state machines, and the engineering decisions behind a POS that never goes down.",
  alternates: { canonical: "/blogs/computer-science/offline-first-architecture-in-retail-pos" },
  authors: [{ name: "Suraj Singh" }],
  keywords: [
    "offline-first", "PWA", "IndexedDB", "Dexie", "Service Worker", "Web Worker",
    "BullMQ", "React", "POS", "retail", "Workbox", "background sync"
  ],
  openGraph: {
    title: "Building an Offline-First Architecture for a Retail POS",
    description: "A deep-dive into the layered offline system powering StoreOS — covering service workers, IndexedDB, web workers, state machines, and the engineering decisions behind a POS that never goes down.",
    url: "/blogs/computer-science/offline-first-architecture-in-retail-pos",
    type: "article",
    siteName: "Suraj Singh",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Offline-First POS Architecture — Suraj Singh" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Building an Offline-First Architecture for a Retail POS",
    description: "A deep-dive into the layered offline system powering StoreOS — covering service workers, IndexedDB, web workers, state machines, and the engineering decisions behind a POS that never goes down.",
    creator: "@__SurajSingh__",
    images: ["/opengraph-image"],
  },
}

const OfflineFirstPOS = () => (
  <PageShell>

    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Building an Offline-First Architecture for a Retail POS",
          description: "A deep-dive into the layered offline system powering StoreOS — covering service workers, IndexedDB, web workers, state machines, and the engineering decisions behind a POS that never goes down.",
          url: "https://notasecondhandlife.com/blogs/computer-science/offline-first-architecture-in-retail-pos",
          datePublished: "2026-04-11",
          dateModified: "2026-04-11",
          author: {
            "@type": "Person",
            name: "Suraj Singh",
            url: "https://notasecondhandlife.com",
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": "https://notasecondhandlife.com/blogs/computer-science/offline-first-architecture-in-retail-pos",
          },
        }),
      }}
    />

    <h1 className="font-semibold text-2xl mb-2 tracking-tighter text-neutral-900 dark:text-neutral-100">
      Building an Offline-First Architecture for a Retail POS
    </h1>
    <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-10">April 2026 · 15 min read</p>

    <div className="flex flex-col gap-6 text-neutral-700 dark:text-neutral-300 leading-relaxed">

      {/* ── INTRO ── */}
      <p>
        A Point-of-Sale terminal going offline in the middle of a busy shopping shift is not a minor
        inconvenience — it is a queue of frustrated customers, blocked cashiers, and potentially lost revenue.
        When I was building StoreOS at Fynd, this was the constraint that shaped every architectural decision
        from day one.
      </p>
      <p>
        Retail stores in India present a specific challenge: internet connectivity is unpredictable. It can
        vanish mid-transaction, throttle to near-zero during peak hours, or simply not exist in remote store
        locations. The system had to keep working regardless — processing orders, searching the catalog,
        accepting payments — and then silently reconcile all of that data once the network came back.
      </p>
      <p>
        This post is a full breakdown of the offline system I engineered for StoreOS: the layered
        architecture, every technology involved, and the reasoning behind each decision.
      </p>

      {/* ── ARCHITECTURE ── */}
      <h2 className="font-medium text-lg mt-4 text-neutral-900 dark:text-neutral-100">The Layered Architecture</h2>
      <p>
        The offline system isn&apos;t a single feature — it&apos;s a stack of four cooperating layers, each with
        a distinct responsibility.
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">Service Worker</span> — intercepts
          all network requests; serves assets and critical API responses from cache when offline
        </li>
        <li>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">IndexedDB (via Dexie)</span> — the
          local database; stores catalog, carts, orders, users, and analytics events
        </li>
        <li>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">Offline API Client</span> — a set
          of domain clients that mirror the online API surface but route all calls to IndexedDB
        </li>
        <li>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">Web Workers</span> — background
          threads that sync offline orders and download the product catalog without blocking the UI
        </li>
      </ul>
      <p>
        The backend (BullMQ queues with exponential backoff) closes the loop by making the server-side
        resilient to the same connectivity problems. Together, these layers mean the app handles everything
        from a brief network blip to a multi-hour outage with the same code path.
      </p>

      {/* ── STATE MACHINE ── */}
      <h2 className="font-medium text-lg mt-4 text-neutral-900 dark:text-neutral-100">A Three-State Machine at the Center</h2>
      <p>
        The most important file in the entire offline system is <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">IDataSource.js</code>.
        It manages a singleton state machine with three explicit operational modes:
      </p>
      <pre className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-xs overflow-auto">
        {`READY ─────────────────────────────→ IN_OFFLINE_MODE
                (network lost / manual toggle)
                         │
                         ↓
                   IN_ONLINE_MODE
                (transitioning back, sync running)
                         │
                         ↓
                       READY`}
      </pre>
      <p>
        A boolean <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">isOffline</code> flag
        would have been simpler, but it can only represent two states. The three-mode machine lets the UI
        represent the transitioning state — syncing a large order backlog can take minutes, and the cashier
        needs to know the system is working, not stuck.
      </p>

      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Going Offline</h3>
      <p>When the mode switches to <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">IN_OFFLINE_MODE</code>, the system does five things:</p>
      <ol className="list-decimal pl-5 space-y-2">
        <li>Requests the <strong>File System Access API</strong> — gives the app a directory handle for exporting end-of-day reports without internet</li>
        <li>Generates a <strong>unique offline session hash</strong> (<code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">OFFLINE_DB_HASH</code>) written to localStorage — this becomes the correlation key for every order and event in this offline window</li>
        <li>Removes the active cart — avoids carrying half-state into offline mode</li>
        <li>Clears extensions — only core POS functionality is available offline</li>
        <li>Calls <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">createOfflineSession()</code> on the backend, if still reachable</li>
      </ol>

      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Coming Back Online</h3>
      <p>When connectivity returns, the system transitions through <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">IN_ONLINE_MODE</code> before reaching <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">READY</code>. During this window, the order sync worker runs and the analytics queue is flushed. The native Android bridge is also notified on every transition, so hardware integrations (barcode scanners, receipt printers, payment terminals) can adjust accordingly.</p>

      {/* ── SERVICE WORKER ── */}
      <h2 className="font-medium text-lg mt-4 text-neutral-900 dark:text-neutral-100">Service Worker Caching Strategies</h2>
      <p>
        The service worker (<code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">sw.js</code>, using Workbox 7.3.0) uses different
        strategies for different resource types. One size does not fit all.
      </p>
      <table className="w-full text-sm border-collapse border border-neutral-300 dark:border-neutral-700">
        <thead>
          <tr className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
            <th className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-left">Resource</th>
            <th className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-left">Strategy</th>
            <th className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-left">Why</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">HTML documents</td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">NetworkFirst</td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">Always prefer fresh markup</td>
          </tr>
          <tr>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">JS / CSS bundles</td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">NetworkFirst, 3s timeout</td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">Fresh on fast networks; cached on slow ones</td>
          </tr>
          <tr>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">Fonts, CDN assets</td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">CacheFirst (30 days)</td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">Immutable; no reason to hit the network</td>
          </tr>
          <tr>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">Critical API responses</td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">Custom cache-first</td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">App must boot even without network</td>
          </tr>
        </tbody>
      </table>
      <p>
        The 3-second timeout on JS/CSS bundles is the key heuristic for low-bandwidth environments.
        A pure NetworkFirst strategy would stall indefinitely on a throttled connection.
        A pure CacheFirst strategy would leave users running stale code for days after a deployment.
        Three seconds is the negotiated middle ground — responsive enough, fresh enough.
      </p>
      <p>
        The following API endpoints are explicitly cached so the app can initialize and authenticate
        without a network round-trip:
      </p>
      <pre className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-xs overflow-auto">
        {`service/panel/authentication/v1.0/profile
service/platform/company-profile/v1.0/company
service/platform/stos-config/v1.0/company
staff/current/access
service/application/configuration/v1.0/feature
storeos/asia-south1/api-storeos/internal/appVersion`}
      </pre>
      <p>
        On service worker activation, 41 icon assets, fonts, and 10 CDN images are proactively
        cached — front-loading the cache so users never hit a cold-cache miss on first offline use.
      </p>

      {/* ── INDEXEDDB ── */}
      <h2 className="font-medium text-lg mt-4 text-neutral-900 dark:text-neutral-100">IndexedDB via Dexie — The Offline Database</h2>
      <p>
        While the service worker handles the network layer, IndexedDB is the local persistence layer.
        I used Dexie as the wrapper — its transaction API and versioned schema migrations make it
        significantly more ergonomic than the raw IndexedDB API.
      </p>
      <pre className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-xs overflow-auto">
        {`db.version(N).stores({
  items:    'id, type, name, slug, brand, price, variants',
  cart:     'id, user_id, items, total_quantity, status',
  orders:   'id, user_id, is_sync_online, fynd_order_id',
  users:    'id, username, emails, phone_numbers',
  addresses:'_id, app_id, user_id, is_default_address',
  analytics_events: 'id, event_name, status, retries',
  offline_session_info: 'id, offline_hash_id, is_sync_online',
});`}
      </pre>

      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">The Two Most Important Fields</h3>
      <p>
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">orders.is_sync_online</code> and <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">orders.fynd_order_id</code> are
        the backbone of the entire sync mechanism. Every order created offline starts with <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">is_sync_online = false</code>.
        When the web worker successfully posts the order to the Fynd platform, it writes the returned <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">fynd_order_id</code> and
        flips the flag to <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">true</code>. The worker checks this flag before processing any
        order — idempotency built into the data model.
      </p>

      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Resilience on Android WebViews</h3>
      <p>
        Android WebViews occasionally throw transient errors on IndexedDB writes. Every write in
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded"> DatabaseManager.js</code> is wrapped in a retry loop with exponential backoff:
      </p>
      <pre className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-xs overflow-auto">
        {`async function withRetry(operation, maxAttempts = 3) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (err) {
      if (attempt === maxAttempts - 1) throw err;
      await sleep(200 * Math.pow(2, attempt)); // 200ms → 400ms → 800ms
    }
  }
}`}
      </pre>
      <p>
        Three other patterns keep the database layer solid: a singleton instance prevents multiple Dexie
        connections racing on the same database; atomic <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">db.put()</code> upserts
        eliminate the check-then-act race condition; and cursor-based pagination returns{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">{"{ has_next, has_previous, next_id }"}</code> — intentionally
        matching the online API response shape, so the UI layer never needs to know which mode it&apos;s in.
      </p>

      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Offline Catalog Search</h3>
      <p>
        When offline, the product search is powered by Fuse.js running against the local IndexedDB catalog:
      </p>
      <pre className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-xs overflow-auto">
        {`const fuse = new Fuse(localItems, {
  keys: ['name', 'slug', 'brand'],
  threshold: 0.4, // tolerant of minor typos
});`}
      </pre>
      <p>
        Threshold 0.4 was tuned to tolerate the kind of quick-entry typos cashiers make without
        returning irrelevant results. Too tight (0.1) and it misses obvious matches. Too loose (0.6)
        and every search returns noise.
      </p>

      {/* ── OFFLINE API CLIENT ── */}
      <h2 className="font-medium text-lg mt-4 text-neutral-900 dark:text-neutral-100">The Offline API Client Layer</h2>
      <p>
        The offline API client is the piece that makes the UI completely unaware of which mode it&apos;s running in.
        It&apos;s a set of domain-specific clients — <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">CartPlatformClient</code>, <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">CatalogPlatformClient</code>, <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">OrderPlatformClient</code>, and others — that mirror
        the online API surface exactly but route all calls to IndexedDB.
      </p>
      <p>
        When the mode switches, the app swaps the active client. The UI components call the same
        methods with the same signatures and get the same response shapes. The abstraction is clean
        enough that adding a new offline-capable feature is mostly a matter of implementing the
        right method in the offline client.
      </p>
      <p>
        One non-trivial piece is cart pricing. The <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">CartPlatformClient</code> recomputes
        the full price breakup locally — marked price, effective price, GST, discount amounts — using
        the same calculation logic as the server. Pricing is consistent whether or not the network is present.
      </p>

      {/* ── WEB WORKERS ── */}
      <h2 className="font-medium text-lg mt-4 text-neutral-900 dark:text-neutral-100">Web Workers for Background Sync</h2>
      <p>
        Two dedicated web workers handle synchronization on background threads, keeping the main
        thread — and the cashier&apos;s UI — completely unblocked.
      </p>

      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Order Sync Worker</h3>
      <p>
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">syncOrdersOnline.js</code> (532 lines) processes all unsynced orders from
        IndexedDB and posts them to the Fynd platform. For each order, it:
      </p>
      <ol className="list-decimal pl-5 space-y-2">
        <li>Checks <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">fynd_order_id</code> — if it exists, the order was already synced; skip it</li>
        <li>Looks up the customer on the online platform; falls back to the local DB if that fails</li>
        <li>Transforms the local order format to the Fynd platform payload format — item charges, GST, billing addresses, seller identifiers</li>
        <li>Posts the order, writes back <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">fynd_order_id</code>, sets <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">is_sync_online = true</code></li>
      </ol>
      <p>
        The worker emits structured progress messages back to the main thread, driving the real-time
        progress UI in the Settings panel:
      </p>
      <pre className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-xs overflow-auto">
        {`postMessage({ type: 'start', total: N })
postMessage({ type: 'update_order_status', orderId, status })
postMessage({ type: 'file_sync_complete', elapsed })
postMessage({ type: 'error', orderId, error })`}
      </pre>

      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Catalog Sync Worker</h3>
      <p>
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">syncProductsOffline.js</code> (389 lines) downloads the full product catalog into
        IndexedDB. For each page of products, variant details, size details, and price details are
        fetched concurrently:
      </p>
      <pre className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-xs overflow-auto">
        {`// For each product page, fetch all supplementary data in parallel
const [variants, sizes, prices] = await Promise.all([
  fetchVariants(pageItems),
  fetchSizes(pageItems),
  fetchPrices(pageItems),
]);`}
      </pre>
      <p>
        This parallelism significantly reduces total catalog download time compared to sequential
        fetching. Per-item errors are caught and logged but don&apos;t abort the sync — the catalog
        always completes even if a handful of items fail.
      </p>
      <p>
        I deliberately chose explicit web workers over the Background Sync API (available in service
        workers) for two reasons: Background Sync has inconsistent support on older Android WebViews
        used in POS hardware, and explicit workers let the UI show real-time sync progress — something
        Background Sync&apos;s browser-managed timing cannot provide.
      </p>

      {/* ── NETWORK DETECTION ── */}
      <h2 className="font-medium text-lg mt-4 text-neutral-900 dark:text-neutral-100">Network Detection & UI</h2>
      <p>
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">useOfflinePopup.jsx</code> listens to the browser&apos;s <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">offline</code> and <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">online</code> events,
        but the <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">online</code> event alone isn&apos;t trusted. It triggers a verification loop:
      </p>
      <pre className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-xs overflow-auto">
        {`// 3 attempts, 2-second delay between checks
// Only declares "back online" after all checks pass navigator.onLine
// Prevents false positives from brief connectivity blips`}
      </pre>
      <p>
        One subtle detail: the offline modal&apos;s illustration image is converted to base64 and stored
        in localStorage. This ensures the modal renders correctly even when the service worker hasn&apos;t
        cached that particular image. The offline UI must work reliably offline — it would be ironic
        for it not to.
      </p>

      {/* ── TOKEN RENEWAL ── */}
      <h2 className="font-medium text-lg mt-4 text-neutral-900 dark:text-neutral-100">Proactive Token Renewal</h2>
      <p>
        Every API call goes through a <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">withTokenCheck()</code> wrapper that renews the
        auth token 120 seconds before it expires:
      </p>
      <pre className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-xs overflow-auto">
        {`async function withTokenCheck(requestFn) {
  const expiresIn = getTokenExpiresIn(); // seconds until expiry
  if (expiresIn < 120) {
    await renewAccessToken();
  }
  return requestFn();
}`}
      </pre>
      <p>
        120 seconds was chosen to be safely above the 95th-percentile API latency in tested retail
        environments. A token expiring mid-request and causing a 401 in the middle of a checkout
        flow is a terrible experience. The buffer makes it structurally impossible.
      </p>

      {/* ── BULLMQ ── */}
      <h2 className="font-medium text-lg mt-4 text-neutral-900 dark:text-neutral-100">Backend Resilience — BullMQ Queues</h2>
      <p>
        The offline resilience pattern continues on the server side. All async jobs (invoice generation,
        payment processing) run through BullMQ (Redis-backed) with exponential backoff:
      </p>
      <pre className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-xs overflow-auto">
        {`defaultJobOptions: {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000, // 1s → 2s → 4s
  },
},
limiter: {
  max: 1000,
  duration: 5000, // 1000 jobs / 5 seconds
}`}
      </pre>
      <p>
        The rate limiter is as important as the retry logic. When connectivity is restored after
        a long outage, every store that was offline will attempt to sync simultaneously — a thundering
        herd. The 1000 jobs/5s limit keeps that from overwhelming downstream services.
      </p>
      <p>
        All job consumers are idempotent. Before processing, they check the <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">correlationId</code> against
        a <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">ProcessedEvent</code> MongoDB collection. BullMQ can redeliver a job more than once
        under failure scenarios — without idempotency checks, a payment could be registered twice. This
        is not a hypothetical concern in a system that handles thousands of transactions daily.
      </p>

      {/* ── TRADEOFFS ── */}
      <h2 className="font-medium text-lg mt-4 text-neutral-900 dark:text-neutral-100">The Core Trade-offs</h2>
      <p>Several decisions in this system were genuinely non-obvious. Here are the ones worth examining:</p>

      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Optimistic local writes, pessimistic remote sync</h3>
      <p>
        Orders are written to IndexedDB immediately and confirmed to the cashier right away. The
        platform sync is a background concern. This matches the retail expectation: a POS should never
        make a customer wait for a network round-trip to confirm a sale. The risk is that a sync failure
        leaves an order unrecorded on the platform — mitigated by the sync worker&apos;s retry logic and
        the <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">is_sync_online</code> flag that makes every unsynced order visible.
      </p>

      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Session hash as correlation key</h3>
      <p>
        The <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">OFFLINE_DB_HASH</code> generated at the start of each offline session is
        attached to every order, event, and session record created in that window. This makes debugging
        practical: you can query the backend for all data from a specific offline session in one shot.
        Without this, correlating offline data to a specific time window and store would require
        reconstructing it from timestamps — unreliable if device clocks drift.
      </p>

      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Extensions get reload-on-reconnect, not full offline</h3>
      <p>
        The supplementary extensions (AR try-on, QSR ordering, scan-and-go) simply reload on reconnect
        rather than implementing offline state management. The complexity of offline mode for features
        that are already optional wasn&apos;t justified. This keeps the core POS offline system focused and
        the extension code simple.
      </p>

      {/* ── WHAT WORKS ── */}
      <h2 className="font-medium text-lg mt-4 text-neutral-900 dark:text-neutral-100">What Works Offline vs What Doesn&apos;t</h2>
      <table className="w-full text-sm border-collapse border border-neutral-300 dark:border-neutral-700">
        <thead>
          <tr className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
            <th className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-left">Feature</th>
            <th className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-left">Offline?</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">App loads and authenticates</td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-green-700 dark:text-green-400">Yes — Service Worker cache</td>
          </tr>
          <tr>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">Browse product catalog</td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-green-700 dark:text-green-400">Yes — IndexedDB + Fuse.js</td>
          </tr>
          <tr>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">Create cart, process order</td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-green-700 dark:text-green-400">Yes — IndexedDB clients</td>
          </tr>
          <tr>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">Accept cash payment</td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-green-700 dark:text-green-400">Yes — local order, synced later</td>
          </tr>
          <tr>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">Export session data</td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-green-700 dark:text-green-400">Yes — File System Access API</td>
          </tr>
          <tr>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">Online payment (card / UPI)</td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-red-600 dark:text-red-400">No — requires payment gateway</td>
          </tr>
          <tr>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">Real-time inventory updates</td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-red-600 dark:text-red-400">No — requires Fynd platform API</td>
          </tr>
          <tr>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">Extension features (AR, QSR)</td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-red-600 dark:text-red-400">No — blocked; reload on reconnect</td>
          </tr>
          <tr>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">Analytics</td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-yellow-700 dark:text-yellow-400">Queued — synced on reconnect</td>
          </tr>
        </tbody>
      </table>

      {/* ── CLOSING ── */}
      <h2 className="font-medium text-lg mt-4 text-neutral-900 dark:text-neutral-100">Closing Thoughts</h2>
      <p>
        The most important insight from building this system is that offline-first is not a feature
        you add at the end — it&apos;s an architectural constraint that shapes every layer of the stack.
        The data model (sync flags, correlation hashes), the API layer (identical interface for online
        and offline clients), the state machine (three modes, not two), the backend (idempotent consumers,
        rate-limited retry) — all of it exists because the network is assumed to be unreliable from the start.
      </p>
      <p>
        If you are building for environments where connectivity is a given, most of this complexity is
        unnecessary overhead. But if your software runs in a retail store in a tier-3 city in India,
        the network going down is not an edge case. It is Tuesday afternoon.
      </p>

      <hr className="my-6 border-neutral-200 dark:border-neutral-800" />
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Written by Suraj Singh — SDE at Fynd, working on StoreOS offline infrastructure.
      </p>

    </div>
  </PageShell>
)

export default OfflineFirstPOS
