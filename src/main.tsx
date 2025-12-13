import React from "react";
import { createRoot } from "react-dom/client";

// Temporary visibility test: renders a red heading to verify the build/deploy
createRoot(document.getElementById("root")!).render(
	<div style={{ padding: 32 }}>
		<h1 style={{ color: 'red', fontSize: 32, fontFamily: 'system-ui' }}>RENDER IS WORKING</h1>
		<p>If you see this, the bundler and server are working — app logic/env is the issue.</p>
	</div>
);
