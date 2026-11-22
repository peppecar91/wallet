const CACHE_NAME = "wallet-personale-v2";

const APP_SHELL = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./lib/qrcode.js",
    "./lib/jsbarcode/JsBarcode.all.min.js",
    "./icons/wallet-192.png"
];


// ============================================================
// INSTALL
// ============================================================

self.addEventListener(
    "install",
    event => {

        console.log(
            "[SW] Installazione:",
            CACHE_NAME
        );

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(
                    cache => {

                        return cache.addAll(
                            APP_SHELL
                        );

                    }
                )

        );

        /*
         * Attiva subito il nuovo Service Worker.
         */

        self.skipWaiting();

    }
);


// ============================================================
// ACTIVATE
// ============================================================

self.addEventListener(
    "activate",
    event => {

        console.log(
            "[SW] Attivazione:",
            CACHE_NAME
        );

        event.waitUntil(
            caches
                .keys()
                .then(
                    cacheNames => {
                        return Promise.all(
                            cacheNames
                                .filter(
                                    cacheName =>
                                        cacheName !==
                                        CACHE_NAME
                                )
                                .map(
                                    cacheName =>
                                        caches.delete(
                                            cacheName
                                        )
                                )
                        );
                    }
                )
        );

        /*
         * Prende immediatamente il controllo
         * delle pagine già aperte.
         */
        self.clients.claim();
    }
);


// ============================================================
// GESTIONE RICHIESTE GET HTTP/HTTPs 
// ============================================================

self.addEventListener("fetch", event => {
    /*
     * Gestiamo solo richieste HTTP/HTTPS di tipo GET.
     */
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith((async () => {
        try {

            // 1. Cerchiamo prima nella cache
            const cachedResponse = await caches.match(
                event.request
            );

            if (cachedResponse) {
                // trovato in cache
                return cachedResponse;
            }

            // 2. Se non esiste, proviamo la rete
            const response = await fetch(event.request);

            // 3. Memorizziamo le risposte valide
            if (
                response &&
                response.status === 200 &&
                response.type === "basic"
            ) {
                /*
                 * Salviamo in cache
                 * una copia della risposta.
                 */
                const cache = await caches.open(CACHE_NAME);

                event.waitUntil(
                    cache.put(
                        event.request,
                        response.clone()
                    ).catch(error => {
                        console.warn("Errore salvataggio cache:", error);
                    })
                );
            }

            return response;

        } catch (error) {

            console.warn("Richiesta non disponibile:", event.request.url);

            // 4. Fallback offline per le pagine
            if (event.request.mode === "navigate") {
                /*
                 * Se siamo offline e la richiesta
                 * è una pagina, restituiamo index.html.
                 */
                const offlinePage = await caches.match(
                    new URL("./index.html", self.registration.scope).href
                );

                if (offlinePage) {
                    return offlinePage;
                }
            }

            // 5. Risposta di errore valida
            return Response.error();
        }
    })());
});
