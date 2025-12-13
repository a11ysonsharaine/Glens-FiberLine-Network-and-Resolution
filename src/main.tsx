import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from 'next-themes';

// Global error handlers to surface runtime issues in production
window.addEventListener('error', (ev) => {
	// Log to console (Render logs will capture this)
	// eslint-disable-next-line no-console
	console.error('Uncaught error:', ev.error || ev.message || ev);
});
window.addEventListener('unhandledrejection', (ev) => {
	// eslint-disable-next-line no-console
	console.error('Unhandled promise rejection:', ev.reason);
});

function renderApp() {
	try {
		createRoot(document.getElementById("root")!).render(
			<ThemeProvider attribute="class" defaultTheme="system">
				<App />
			</ThemeProvider>
		);
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('Error rendering App:', err);
		const root = document.getElementById('root');
		if (root) {
			root.innerHTML = `<div style="padding:2rem;font-family:system-ui;color:#c53030;background:#fff6f6">Application error. Check console for details.</div>`;
		}
	}
}

renderApp();
