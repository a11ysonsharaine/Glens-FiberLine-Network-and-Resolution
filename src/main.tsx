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
