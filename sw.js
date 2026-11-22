const CACHE_NAME = "wallet-personale-v1";

const APP_SHELL = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./cards.js",
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
// FETCH
// ============================================================

self.addEventListener(
    "fetch",
    event => {

        /*
         * Gestiamo solo richieste HTTP/HTTPS.
         */

        if (
            event.request.method !== "GET"
        ) {

            return;

        }


        event.respondWith(

            caches
                .match(
                    event.request
                )
                .then(
                    cachedResponse => {

                        /*
                         * Se il file è già nella cache,
                         * usiamo quello.
                         */

                        if (
                            cachedResponse
                        ) {

                            return cachedResponse;

                        }


                        /*
                         * Altrimenti proviamo
                         * a recuperarlo dalla rete.
                         */

                        return fetch(
                            event.request
                        )
                        .then(
                            response => {

                                /*
                                 * Salviamo in cache
                                 * una copia della risposta.
                                 */

                                if (
                                    response &&
                                    response.status === 200 &&
                                    response.type === "basic"
                                ) {

                                    const responseClone =
                                        response.clone();


                                    caches
                                        .open(
                                            CACHE_NAME
                                        )
                                        .then(
                                            cache => {

                                                cache.put(
                                                    event.request,
                                                    responseClone
                                                );

                                            }
                                        );

                                }


                                return response;

                            }
                        )
                        .catch(
                            () => {

                                /*
                                 * Se siamo offline e la richiesta
                                 * è una pagina, restituiamo index.html.
                                 */

                                if (
                                    event.request.mode ===
                                    "navigate"
                                ) {

                                    return caches.match(
                                        "./index.html"
                                    );

                                }


                                /*
                                 * Per immagini/file non disponibili
                                 * lasciamo fallire la richiesta.
                                 */

                                return Response.error();

                            }
                        );

                    }
                )

        );

    }
);
