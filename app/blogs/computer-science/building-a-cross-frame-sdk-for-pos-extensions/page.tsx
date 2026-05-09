import type { Metadata } from "next"
import PageShell from "@/components/PageShell"

export const metadata: Metadata = {
  title: "Building a Cross-Frame SDK for POS Extensions",
  description: "How I designed FSI — a small JavaScript SDK that creates a two-way communication channel between a host POS application and independently deployed extension iframes, including a native Android WebView bridge.",
  alternates: { canonical: "/blogs/computer-science/building-a-cross-frame-sdk-for-pos-extensions" },
  authors: [{ name: "Suraj Singh" }],
  keywords: [
    "postMessage", "iframe", "SDK", "cross-origin", "observable", "event bus",
    "POS", "WebView", "Android", "JavascriptInterface", "Fynd", "StoreOS"
  ],
  openGraph: {
    title: "Building a Cross-Frame SDK for POS Extensions",
    description: "How I designed FSI — a small JavaScript SDK that creates a two-way communication channel between a host POS application and independently deployed extension iframes, including a native Android WebView bridge.",
    url: "/blogs/computer-science/building-a-cross-frame-sdk-for-pos-extensions",
    type: "article",
    siteName: "Suraj Singh",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Cross-Frame SDK for POS Extensions — Suraj Singh" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Building a Cross-Frame SDK for POS Extensions",
    description: "How I designed FSI — a small JavaScript SDK that creates a two-way communication channel between a host POS application and independently deployed extension iframes, including a native Android WebView bridge.",
    creator: "@__SurajSingh__",
    images: ["/opengraph-image"],
  },
}

const FSIBlog = () => (
  <PageShell>

    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Building a Cross-Frame SDK for POS Extensions",
          description: "How I designed FSI — a small JavaScript SDK that creates a two-way communication channel between a host POS application and independently deployed extension iframes, including a native Android WebView bridge.",
          url: "https://notasecondhandlife.com/blogs/computer-science/building-a-cross-frame-sdk-for-pos-extensions",
          datePublished: "2026-04-11",
          dateModified: "2026-04-11",
          author: {
            "@type": "Person",
            name: "Suraj Singh",
            url: "https://notasecondhandlife.com",
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": "https://notasecondhandlife.com/blogs/computer-science/building-a-cross-frame-sdk-for-pos-extensions",
          },
        }),
      }}
    />

    <h1 className="font-semibold text-2xl mb-2 tracking-tighter text-neutral-900 dark:text-neutral-100">
      Building a Cross-Frame SDK for POS Extensions
    </h1>
    <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-10">11 Apr 2026 · 12 min read</p>

    <div className="flex flex-col gap-6 text-neutral-700 dark:text-neutral-300 leading-relaxed">

      {/* ── INTRO ── */}
      <p>
        StoreOS is a Point-of-Sale platform that supports a plugin model — independently deployed
        web applications (extensions) that run inside the main POS and add capabilities like AR
        try-on, QSR ordering, scan-and-go, and price management. Each extension is built by a
        different team, lives in a different Git repository, and deploys on its own release cycle.
      </p>
      <p>
        The integration problem this creates is not trivial. Extensions run in{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">&lt;iframe&gt;</code>{" "}
        elements inside the host POS app. Browser security means two cross-origin frames cannot
        share a JavaScript execution context, a Redux store, or even a plain variable. When the
        cashier updates the cart in the host, an extension watching that cart has no way to know —
        unless you build a bridge.
      </p>
      <p>
        That bridge is{" "}
        <span className="font-medium text-neutral-900 dark:text-neutral-100">FSI</span> —
        Fynd StoreOS Interface. This post is a full walkthrough of how it works: the design, the
        two primitives it exposes, the{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">postMessage</code>{" "}
        routing, and the Android WebView integration that extends the same contract to native hardware.
      </p>

      {/* ── THE PROBLEM ── */}
      <h2 className="font-medium text-lg mt-4 text-neutral-900 dark:text-neutral-100">The Problem in Concrete Terms</h2>
      <p>
        Without a shared contract, every integration point between the host and an extension would
        require custom wiring — bespoke{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">postMessage</code>{" "}
        calls with no agreed message format, duplicated listener logic, and a maintenance surface
        that grows with every new extension. We had five extensions at the time I was building this.
        Scaling that without a protocol would mean five different integration contracts that all need
        updating when the host changes.
      </p>
      <p>
        The goal was a single file — one{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">fsi.js</code>{" "}
        — that both the host and every extension load. It attaches to{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">window.FSI</code>{" "}
        and provides two primitives that work identically regardless of which side you&apos;re on.
        The underlying{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">postMessage</code>{" "}
        routing is invisible to the caller.
      </p>

      {/* ── TWO PRIMITIVES ── */}
      <h2 className="font-medium text-lg mt-4 text-neutral-900 dark:text-neutral-100">Two Primitives</h2>
      <p>FSI exposes exactly two things on <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">window.FSI</code>:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">window.FSI.event</code>{" "}
          — a publish/subscribe event bus for fire-and-forget signals
        </li>
        <li>
          <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">window.FSI.state</code>{" "}
          — a set of named observables for shared reactive state
        </li>
      </ul>
      <p>
        The distinction matters. Events are imperative — &quot;close this extension&quot;, &quot;open this product
        page&quot;, &quot;show a toast&quot;. State is declarative — &quot;the cart currently looks like this&quot;, &quot;the
        product being viewed is this&quot;. Both are needed because they solve different coordination
        problems.
      </p>

      {/* ── ROLES ── */}
      <h2 className="font-medium text-lg mt-4 text-neutral-900 dark:text-neutral-100">Two Roles, One File</h2>
      <p>
        FSI operates in one of two roles, set at initialization time. The role determines which
        direction{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">postMessage</code>{" "}
        calls flow.
      </p>
      <table className="w-full text-sm border-collapse border border-neutral-300 dark:border-neutral-700">
        <thead>
          <tr className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
            <th className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-left">Role</th>
            <th className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-left">Who sets it</th>
            <th className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-left">emit() sends to</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">
              <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">HOST_APPLICATION</code>
            </td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">rotom, on startup</td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">All <code className="font-mono text-xs">&lt;iframe&gt;</code> elements on the page</td>
          </tr>
          <tr>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">
              <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">EXTENSION_APPLICATION</code>
            </td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">extension, auto-detected via <code className="font-mono text-xs">window.self !== window.top</code></td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2"><code className="font-mono text-xs">window.parent</code></td>
          </tr>
          <tr>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">
              <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">null</code> (uninitialized)
            </td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">neither</td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">Local handlers only — no postMessage</td>
          </tr>
        </tbody>
      </table>
      <p>
        The{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">null</code>{" "}
        case is useful — it means FSI can be tested in a same-page context without iframes, and it
        also covers the Android WebView case (more on that below).
      </p>

      {/* ── EVENT BUS ── */}
      <h2 className="font-medium text-lg mt-4 text-neutral-900 dark:text-neutral-100">The Event Bus — SignalEvt</h2>
      <p>
        The event bus is a class called{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">SignalEvt</code>.
        Internally, handlers are stored in a plain object keyed by an auto-incrementing ID:
      </p>
      <pre className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-xs overflow-auto">
        {`{
  events: {
    'cart.refresh': {
      1: handlerFn,
      2: anotherFn,
    },
    'close': {
      3: closeFn,
    }
  },
  id: 3  // current counter
}`}
      </pre>
      <p>
        Storing handlers in an object rather than an array makes removal O(1) — no array scanning,
        no index shifting. The ID is stamped directly onto the function object:{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">eventHandler._eventId = ++this.id</code>.
        This means the same named function always carries the same ID — re-registering it is idempotent.
      </p>
      <p>The third argument to <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">emit()</code> is the loop-breaker:</p>
      <pre className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-xs overflow-auto">
        {`// Host calls:
window.FSI.event.emit('cart.refresh', data)
// → _applicationType is HOST_APPLICATION
// → postMessage to all iframes

// Extension's message listener receives postMessage, then calls:
window.FSI.event.emit('cart.refresh', data, true)  // ← isFromEventListner=true
// → calls local handlers
// → does NOT postMessage again (loop prevented)`}
      </pre>
      <p>
        Without that flag, a message from the host would arrive in the extension, get re-emitted,
        and the extension would try to postMessage back to its own parent — which would arrive in
        the host, fire the host handlers, and the host would postMessage to the extension again.
        The{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">isFromEventListner</code>{" "}
        flag is set to{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">true</code>{" "}
        exclusively by the internal message listener — callers never set it.
      </p>

      {/* ── OBSERVABLE ── */}
      <h2 className="font-medium text-lg mt-4 text-neutral-900 dark:text-neutral-100">Shared State — Observable</h2>
      <p>
        The{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">Observable</code>{" "}
        class is the reactive state container. Each instance holds a single named piece of state and
        a list of subscribers. Two behaviors define it:
      </p>
      <p>
        <span className="font-medium text-neutral-900 dark:text-neutral-100">Warm subscriptions.</span>{" "}
        If state has already been published when a new subscriber registers, that subscriber is called
        immediately with the current value. An extension that loads after the host has already set cart
        state still gets the current cart — no missed-state bug, no manual polling.
      </p>
      <p>
        <span className="font-medium text-neutral-900 dark:text-neutral-100">Deep clone on write.</span>
      </p>
      <pre className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-xs overflow-auto">
        {`this._data = JSON.parse(JSON.stringify(data))`}
      </pre>
      <p>
        State is always stored as a deep clone. If the host publishes the cart object and then
        mutates it (say, adding an item), that mutation doesn&apos;t silently affect what the extension
        already received. The clone is the source of truth.
      </p>
      <p>
        Three observable state keys are available:{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">cart</code>,{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">product</code>, and{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">orderDetail</code>.
        The host pushes to these when the relevant POS view changes. Extensions subscribe to what
        they care about.
      </p>

      {/* ── MESSAGE BRIDGE ── */}
      <h2 className="font-medium text-lg mt-4 text-neutral-900 dark:text-neutral-100">The Message Bridge</h2>
      <p>
        The full transport layer is a single{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">window.addEventListener(&apos;message&apos;, ...)</code>{" "}
        at the bottom of{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">fsi.js</code>,
        registered in both the host and every extension:
      </p>
      <pre className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-xs overflow-auto">
        {`window.addEventListener('message', (event) => {
  const { eventName, eventData, type } = event.data

  if (eventName && type === 'SIGNAL') {
    window.FSI.event.emit(eventName, eventData, true)
  }

  if (eventName && window.FSI.state[eventName] && type === 'STATE') {
    window.FSI.state[eventName]._publish(eventData, true)
  }
})`}
      </pre>
      <p>
        Two message types:{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">SIGNAL</code>{" "}
        routes to the event bus,{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">STATE</code>{" "}
        routes to the matching observable. Both arrive with{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">isFromEventListner=true</code>{" "}
        to prevent re-broadcasting.
      </p>
      <p>
        All{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">postMessage</code>{" "}
        calls use{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">&apos;*&apos;</code>{" "}
        as the target origin. Specifying an exact origin would require rotom to know every extension&apos;s
        URL at build time — which breaks the dynamic extension loading model. The{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">&apos;*&apos;</code>{" "}
        approach accepts the mild security trade-off in exchange for flexibility, and is acceptable
        since extensions are loaded from the rotom domain.
      </p>

      {/* ── END TO END ── */}
      <h2 className="font-medium text-lg mt-4 text-neutral-900 dark:text-neutral-100">End-to-End Flow</h2>
      <p>Here is what happens when a cashier updates the cart and an extension needs to react:</p>
      <ol className="list-decimal pl-5 space-y-2">
        <li>Extension loads FSI, calls <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">window.FSI.state.cart.subscribe(fn)</code> — gets the current cart immediately if already set</li>
        <li>Cashier updates the cart in the host POS</li>
        <li>Host calls <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">window.FSI.state.cart._publish(newCart)</code></li>
        <li>FSI finds all <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">&lt;iframe&gt;</code> elements, sends <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">postMessage({"{ eventName: 'cart', eventData: newCart, type: 'STATE' }"})</code> to each</li>
        <li>Extension&apos;s message listener receives it, calls <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">window.FSI.state.cart._publish(newCart, true)</code></li>
        <li>All cart subscribers in the extension fire with the new data</li>
      </ol>
      <p>The reverse — extension sending a command to host:</p>
      <ol className="list-decimal pl-5 space-y-2">
        <li>Extension calls <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">window.FSI.event.emit(&apos;pdp.open&apos;, {"{ productSlug: '...' }"})</code></li>
        <li>FSI detects <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">_applicationType === EXTENSION_APPLICATION</code>, sends <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">window.parent.postMessage(...)</code></li>
        <li>Host&apos;s message listener receives it, calls <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">window.FSI.event.emit(&apos;pdp.open&apos;, data, true)</code></li>
        <li>Host handler fires, navigates to the product page</li>
      </ol>

      {/* ── ANDROID ── */}
      <h2 className="font-medium text-lg mt-4 text-neutral-900 dark:text-neutral-100">The Android WebView Twist</h2>
      <p>
        StoreOS also runs as a native Android application with extensions loaded inside a Jetpack
        Compose{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">WebView</code>.
        In this context there is no parent browser window — the native app is the host. So FSI&apos;s
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">postMessage</code>{" "}
        routing doesn&apos;t apply. But the extension still uses the same{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">window.FSI.event.emit()</code>{" "}
        calls. The contract doesn&apos;t change — only the transport layer underneath does.
      </p>
      <p>
        Android achieves this through two mechanisms: injecting{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">fsi.js</code>{" "}
        directly from bundled assets before page JS runs, and registering Kotlin methods as callable
        JavaScript functions via Android&apos;s{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">@JavascriptInterface</code>{" "}
        mechanism.
      </p>

      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Injection from assets, not from the network</h3>
      <p>
        The web version of FSI is served over HTTP from the rotom domain. Android bundles its own
        copy at{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">src/main/assets/fsi.js</code>{" "}
        and injects it in{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">onPageStarted</code>{" "}
        — which fires before any page JavaScript runs:
      </p>
      <pre className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-xs overflow-auto">
        {`// ExtensionView.kt — onPageStarted
val jsContent = fsiFileContent + """
    window.nativeEventHandler = function(eventName, payload) {
        window.AndroidInterface.onEventWithPayload(eventName, payload);
    };

    window.FSI.constants.SUPPORTED_EVENTS.forEach(eventName => {
        FSI.event.on(eventName, function(payload) {
            nativeEventHandler(eventName, payload);
        });
    });

    window.FSI.state.$stateDataPageKey._publish($STATE_DATA_FOR_EXTENSION, false);
"""
webView?.evaluateJavascript(jsContent, null)`}
      </pre>
      <p>Three things happen in that single injection:</p>
      <ol className="list-decimal pl-5 space-y-2">
        <li>
          <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">nativeEventHandler</code>{" "}
          is defined — the bridge out of JS into native Kotlin via{" "}
          <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">window.AndroidInterface.onEventWithPayload()</code>
        </li>
        <li>
          Every event in <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">SUPPORTED_EVENTS</code>{" "}
          is auto-subscribed — when the extension emits{" "}
          <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">pdp.open</code> or{" "}
          <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">close</code>, it flows through to native without any
          additional wiring
        </li>
        <li>
          Initial state is pushed — the native app serializes the current cart/product/order into a
          JSON string before launching the WebView, and injects it via{" "}
          <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 rounded">_publish()</code>{" "}
          so the extension has full context on first render
        </li>
      </ol>
      <p>
        Because{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">_applicationType</code>{" "}
        is never set on Android, it stays{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">null</code> — which
        means{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">emit()</code>{" "}
        calls handlers directly in-process. The injected{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">nativeEventHandler</code>{" "}
        subscriptions are those in-process handlers. No postMessage is ever involved.
      </p>

      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Two @JavascriptInterface classes</h3>
      <p>
        Android registers two Kotlin objects as callable from JavaScript:
      </p>
      <table className="w-full text-sm border-collapse border border-neutral-300 dark:border-neutral-700">
        <thead>
          <tr className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
            <th className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-left">JS name</th>
            <th className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-left">Kotlin class</th>
            <th className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-left">Responsibility</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2"><code className="font-mono text-xs">window.AndroidInterface</code></td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2"><code className="font-mono text-xs">AndroidInterface</code></td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">Receives FSI events from extensions, maps them to typed Kotlin sealed classes, routes to Compose UI</td>
          </tr>
          <tr>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2"><code className="font-mono text-xs">window.StoreOSBridgeInterface_native</code></td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2"><code className="font-mono text-xs">StoreOSBridgeInterface</code></td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">Hardware bridge — receipt printer, barcode scanner, device light, camera permissions</td>
          </tr>
        </tbody>
      </table>
      <p>
        When an extension calls{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">window.FSI.event.emit(&apos;close&apos;)</code>,
        it flows through the auto-subscribed handler to{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">AndroidInterface.onEventWithPayload(&apos;close&apos;, null)</code>,
        which maps to the{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">ExtensionEvent.Close</code>{" "}
        sealed class, which pops the Compose backstack.
      </p>
      <p>
        Hardware calls use the bridge interface directly. The same API surface works in both web and
        Android environments — an extension can call{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">window.StoreOSBridgeInterface.native.print(template)</code>{" "}
        and it works whether the host is a browser or a native app, because the alias{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">window.StoreOSBridgeInterface.native = window.StoreOSBridgeInterface_native</code>{" "}
        is injected on page finish.
      </p>

      {/* ── VERSIONS ── */}
      <h2 className="font-medium text-lg mt-4 text-neutral-900 dark:text-neutral-100">How It Evolved — Three Versions</h2>
      <p>
        FSI shipped in three versions. The meaningful changes:
      </p>
      <table className="w-full text-sm border-collapse border border-neutral-300 dark:border-neutral-700">
        <thead>
          <tr className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
            <th className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-left">Version</th>
            <th className="border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-left">Change</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">v1 → v2</td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2"><code className="font-mono text-xs">orderDetail</code> observable removed; minor: optional chaining dropped from <code className="font-mono text-xs">off()</code>, making it crash on null handler</td>
          </tr>
          <tr>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2">v2 → v3</td>
            <td className="border border-neutral-300 dark:border-neutral-700 px-3 py-2"><code className="font-mono text-xs">orderDetail</code> restored; <strong>pre/post hook system added</strong>; <code className="font-mono text-xs">on()</code> now returns eventId; debug logs added</td>
          </tr>
        </tbody>
      </table>
      <p>
        The v3 hook system is the most interesting addition. It lets callers intercept events before
        they cross the frame boundary:
      </p>
      <pre className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-xs overflow-auto">
        {`// Pre-hook — return false to cancel the event entirely
window.FSI.event.addHook('pre', 'cart.refresh', (data) => {
  if (!data.items?.length) return false  // cancel empty cart refreshes
  return true
})

// Post-hook — runs after the event has been emitted
window.FSI.event.addHook('post', 'cart.refresh', (data) => {
  analytics.track('cart_refresh_emitted', data)
})`}
      </pre>
      <p>
        The cancel-on-falsy behavior in pre-hooks is a clean way to add rate limiting or validation
        without modifying the emit call sites. <br />One limitation: only one hook per type per event —
        a second registration silently replaces the first.
      </p>

      {/* ── DESIGN TAKEAWAYS ── */}
      <h2 className="font-medium text-lg mt-4 text-neutral-900 dark:text-neutral-100">Design Takeaways</h2>
      <p>
        Looking back, the decisions that made FSI work well:
      </p>
      <p>
        <span className="font-medium text-neutral-900 dark:text-neutral-100">Same API, different transports.</span>{" "}
        The extension always calls{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">window.FSI.event.emit()</code>{" "}
        — whether it&apos;s running inside a browser iframe or an Android WebView. The transport is an
        implementation detail hidden by the SDK. This is the whole point: extensions don&apos;t need to
        know where they are running.
      </p>
      <p>
        <span className="font-medium text-neutral-900 dark:text-neutral-100">Warm subscriptions eliminate a race condition class.</span>{" "}
        The host might publish cart state before all extension scripts have loaded and registered their
        subscribers. By replaying state immediately on subscription, any extension that loads late
        still gets the full context. This is a detail that would have caused intermittent bugs if
        missed.
      </p>
      <p>
        <span className="font-medium text-neutral-900 dark:text-neutral-100">The loop-breaker flag is load-bearing.</span>{" "}
        The third argument to{" "}
        <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">emit()</code>{" "}
        is internal, invisible to callers, and essential. Without it, every message crossing the
        frame boundary would recurse until the browser crashed. It&apos;s the kind of thing that is
        obvious once you think about it but easy to miss before a message storm shows up in production.
      </p>


      <hr className="my-6 border-neutral-200 dark:border-neutral-800" />
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Written by Suraj Singh — SDE at Fynd, working on StoreOS extension infrastructure.
      </p>

    </div>
  </PageShell>
)

export default FSIBlog
