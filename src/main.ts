import { mount } from "svelte";
import { inject } from "@vercel/analytics";
import "./styles/global.css";
import App from "./App.svelte";

// Vercel Web Analytics — tracks page views, unique visitors, referrers.
// Only active on Vercel deployments; no-ops locally.
inject();

try {
  const app = mount(App, {
    target: document.getElementById("app")!,
  });
} catch (e) {
  // Show error on screen for debugging
  const el = document.getElementById("app")!;
  el.style.color = "#f07178";
  el.style.padding = "2rem";
  el.style.fontFamily = "monospace";
  el.style.whiteSpace = "pre-wrap";
  el.textContent = `Mount error:\n${e}\n\n${(e as Error)?.stack ?? ""}`;
  console.error("Mount error:", e);
}
