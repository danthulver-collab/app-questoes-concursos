import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Router } from "wouter";
import "./styles.css";
import App from "./app.tsx";

// 🔥 SERVICE WORKER DESABILITADO TEMPORARIAMENTE (causando travamentos)
// Se quiser reativar, descomente o código abaixo
/*
if ('serviceWorker' in navigator) {
        window.addEventListener('load', async () => {
                // Desregistrar TODOS service workers
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                        await registration.unregister();
                        console.log('Service Worker desregistrado');
                }
        });
}
*/

createRoot(document.getElementById("root")!).render(
        <StrictMode>
                <Router>
                        <App />
                </Router>
        </StrictMode>,
);
/* Deploy 1769225710 */
