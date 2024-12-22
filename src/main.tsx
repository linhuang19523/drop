import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThirdwebProviderConfig } from "./thirdweb";
import App from "./App";
import "./styles/globals.css";

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <StrictMode>
    <ThirdwebProviderConfig>
      <App />
    </ThirdwebProviderConfig>
  </StrictMode>
);
