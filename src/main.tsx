// Debug helper: wrap Headers.set to log invalid header values and stack traces
if (typeof Headers !== 'undefined' && Headers.prototype && typeof Headers.prototype.set === 'function') {
	const __origHeadersSet = Headers.prototype.set;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(Headers.prototype as any).set = function (name: string, value: any) {
		try {
			return __origHeadersSet.call(this, name, value);
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error('Headers.set error:', { name, value, type: typeof value, preview: String(value).slice(0,200) }, new Error().stack);
			throw e;
		}
	};
}

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from 'next-themes';

function renderError(msg: string) {
	const root = document.getElementById('root');
	if (root) {
		root.innerHTML = `
			<div style="padding:2rem;font-family:system-ui;color:#c53030;background:#fff6f6">
				<h2>Configuration error</h2>
				<pre style="white-space:pre-wrap">${msg}</pre>
			</div>
		`;
	}
}

// Env checks: if the app expects Supabase, verify required VITE_ vars are present
const useSupabase = String(import.meta.env.VITE_USE_SUPABASE || 'false') === 'true';
const missing: string[] = [];
if (useSupabase) {
	if (!import.meta.env.VITE_SUPABASE_URL) missing.push('VITE_SUPABASE_URL');
	if (!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) missing.push('VITE_SUPABASE_PUBLISHABLE_KEY');
}

// Log non-sensitive presence of envs (do not log secret values)
// eslint-disable-next-line no-console
console.info('Env check: VITE_USE_SUPABASE=', import.meta.env.VITE_USE_SUPABASE ? 'present' : 'missing', ' VITE_SUPABASE_URL=', import.meta.env.VITE_SUPABASE_URL ? 'present' : 'missing', ' VITE_SUPABASE_PUBLISHABLE_KEY=', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'present' : 'missing');

if (missing.length > 0) {
	const msg = `Missing required environment variables: ${missing.join(', ')}\n\nPlease add them in Render (Service → Environment) and redeploy.`;
	// eslint-disable-next-line no-console
	console.error(msg);
	renderError(msg);
} else {
	try {
		createRoot(document.getElementById("root")!).render(
			<ThemeProvider attribute="class" defaultTheme="system">
				<App />
			</ThemeProvider>
		);
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('Error rendering App:', err);
		renderError(String(err));
	}
}

// Global runtime handlers to capture errors that may happen after initial mount
window.addEventListener('error', (ev) => {
	// eslint-disable-next-line no-console
	console.error('Uncaught error (window):', (ev && (ev as ErrorEvent).error) || ev.message || ev);
});
window.addEventListener('unhandledrejection', (ev) => {
	// eslint-disable-next-line no-console
	console.error('Unhandled promise rejection (window):', (ev && (ev as PromiseRejectionEvent).reason) || ev);
});

// Post-render sanity check: if the root is still empty/blank, show a diagnostic overlay
setTimeout(() => {
	try {
		const root = document.getElementById('root');
		if (!root) return;
		const content = root.innerHTML || '';
		if (content.trim() === '') {
			const envReport = {
				VITE_USE_SUPABASE: import.meta.env.VITE_USE_SUPABASE ? 'present' : 'missing',
				VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'present' : 'missing',
				VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'present' : 'missing',
			};
			const msg = `App mounted but produced no visible output.\n\nEnv presence: ${JSON.stringify(envReport, null, 2)}\n\nCheck DevTools Console and Network for errors or missing assets. If using react-router, ensure you have a route for '/'.`;
			// eslint-disable-next-line no-console
			console.warn('Render diagnostic:', msg);
			root.innerHTML = `
				<div style="padding:2rem;font-family:system-ui;color:#111;background:#fff">
					<h2 style="color:#b31b1b">Blank render diagnostic</h2>
					<pre style="white-space:pre-wrap">${msg}</pre>
					<p>Hints:</p>
					<ul>
						<li>Ensure Vite env vars are set in Render BEFORE the deploy.</li>
						<li>Open DevTools &gt; Console and Network; look for errors or 404s.</li>
						<li>If your app uses client-side routing, ensure a <code>/</code> route is defined.</li>
					</ul>
				</div>
			`;
		}
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error('Error during post-render diagnostic:', e);
	}
}, 600);
