import { createRoot } from "react-dom/client";
import App from "./App";

import styles from "../index.css?inline";

const host = document.createElement("div");
host.id = "my-extension-root";

document.documentElement.appendChild(host);

const shadowRoot = host.attachShadow({
  mode: "open",
});

const styleElement = document.createElement("style");
styleElement.textContent = styles.replace(/:root\b/g, ":host");

shadowRoot.appendChild(styleElement);

const mountPoint = document.createElement("div");
shadowRoot.appendChild(mountPoint);

const portalContainer = document.createElement("div");
shadowRoot.appendChild(portalContainer);

createRoot(mountPoint).render(<App container={portalContainer} />);
