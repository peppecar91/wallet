
// ============================================================
// WALLET PERSONALE
// app.js - versione completa V3
// ============================================================

// ============================================================
// ELEMENTI DOM
// ============================================================
const walletStack =
    document.getElementById("walletStack");

const cardSelector =
    document.getElementById("cardSelector");

const selectorTrack =
    document.getElementById("selectorTrack");

const closeSelectorButton =
    document.getElementById("closeSelector");

const modal =
    document.getElementById("modal");

const closeModalButton =
    document.getElementById("closeModal");

const form =
    document.getElementById("cardForm");


// ============================================================
// GESTIONE DELLE CARTE
// ============================================================

var CARDS = loadCards();

const chiaviCarte = [
    "label",
    "mode",
    "header",
    "code",
    "codeType",
    "color",
    "gradient",
    "logo",
    "number",
    "name"
];

/**
 * Valida Carte
 * 
 * valida una lista di carte importate da file locale
 * @param {object} data - lista di carte
 * @returns false se non valido altrimenti true
 */
function validaCarte(data) {
    // Verifica che sia una lista
    if (!Array.isArray(data)) {
        return false;
    }

    for (let i = 0; i < data.length; i++) {
        const elemento = data[i];

        // Verifica che sia un oggetto
        if (
            elemento === null ||
            typeof elemento !== "object" ||
            Array.isArray(elemento)
        ) {
            return false;
        }

        // Verifica le chiavi
        for (const chiave of chiaviCarte) {
            if (!(chiave in elemento)) {
                false;
            }

            if (elemento[chiave] != null){
                if (typeof elemento[chiave] !== "string") {
                    return false;
                }
            }
        }
    }
    return true;
}


/**
 * Load Cards
 * 
 * carica le carte dalla cache
 */
function loadCards(){
    const empty = [];
    try {
        const stored = localStorage.getItem("walletCards");
        if (!stored) {
            return empty;
        }
        else {
            const parsed = JSON.parse(stored);
            if (!Array.isArray(parsed)) {
                console.log('errore: le carte salvate in cache sono corrotte.');
                return empty;
            }
            else {
                return parsed;
            }
        }
    } catch (error) {
        console.error(
            "Errore caricamento tessere:",
            error
        );
        return empty;
    }
}

/**
 * Import Cards
 * 
 * carica le carte da un file locale
 */
function importCards(file){
//    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const json_dati = JSON.parse(e.target.result);
            const controllo_carte = validaCarte(json_dati);
            if (!controllo_carte) {
                document.getElementById("import-status").textContent =
                    "❌ il file delle carte selezionato non e' valido";
                return ;
            }

            // dati validati, aggiorna la cache
            let dati_cache = [];
            const dati_cache_str = localStorage.getItem("walletCards");
            if (!dati_cache_str){
                dati_cache = [];
            }
            else {
                // prova a caricarli
                try {
                    dati_cache = JSON.parse(dati_cache_str);
                    if (!Array.isArray(dati_cache)) {
                        console.log('errore: le carte salvate in cache sono corrotte.');
                        dati_cache = [];
                    }
                } catch {
                    dati_cache = [];
                }
            }
            // recupera tutti i nomi ed il massimo id
            let max_id = 0;
            let lista_nomi = [];
            for (let i = 0; i < dati_cache.length; i++) {
                const carta = dati_cache[i];
                lista_nomi.push(carta["label"]);
                if (max_id < carta["id"]){
                    max_id = carta["id"];
                }
            }
            
            // aggiorna la cache
            for (let i = 0; i < json_dati.length; i++) {
                let carta = json_dati[i];
                const nome_carta = carta["label"];
                if (lista_nomi.includes(nome_carta)){
                    // carta gia esistente, quindi aggiorna tutti i campi
                    for (let k = 0; k < dati_cache.length; k++) {
                        if (dati_cache[k]["label"] == nome_carta){
                            dati_cache[k]["mode"] = carta["mode"];
                            dati_cache[k]["header"] = carta["header"];
                            dati_cache[k]["code"] = carta["code"];
                            dati_cache[k]["codeType"] = carta["codeType"];
                            dati_cache[k]["color"] = carta["color"];
                            dati_cache[k]["gradient"] = carta["gradient"];
                            dati_cache[k]["logo"] = carta["logo"];
                            dati_cache[k]["number"] = carta["number"];
                            dati_cache[k]["name"] = carta["name"];
                        }  
                    }                
                }
                else {
                    max_id = max_id + 1;
                    carta["id"] = max_id;
                    dati_cache.push(carta);
                }
            }

            // salva la cache
            saveCards(dati_cache);

            // ricarica il wallet
            CARDS = loadCards();
            renderStack();

            //document.getElementById("import-status").textContent =
            //    `✅ ${datiJSON.length} carte caricate: ${datiJSON.length}`;

        } catch (error) {
            console.log('error: import fallito: '+error);
            // document.getElementById("import-status").textContent =
            //     "❌ il file delle carte selezionato non e' valido";
            return ;
        }
    };

    reader.onerror = function() {
        // document.getElementById("import-status").textContent =
        //     "❌ Errore durante la lettura del file.";
        console.log('error: import fallito durante la lettura del file');
    };

    reader.readAsText(file);
}

/**
 * Save Cards
 * 
 * salva le carte nella cache locale
 * @param {object} carte - lista di carte pre-validate
 */
function saveCards(carte) {
    try {
        localStorage.setItem(
            "walletCards",
            JSON.stringify(carte)
        );

    } catch (error) {
        console.error(
            "Errore salvataggio tessere:",
            error
        );
    }
}

function openImport(){
    document.getElementById("import-cards").click();
}


// ============================================================
// ESCAPE HTML
// ============================================================
/**
 * Escape HTML
 * 
 * evita i caratteri HTML
 * @param {string} value - input string
 * @returns clean string
 */
function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ============================================================
// CREAZIONE QR CODE
// ============================================================
/**
 * Create QR Code
 * 
 * genera un HTML div con il codice QR
 * @param {string} value - codice alpha-numerico
*/
function createQRCode(value) {

    const container =
        document.createElement("div");

    container.className =
        "qr-container";

    if (
        typeof qrcode !== "function"
    ) {
        console.error(
            "qrcode.min.js non è stato caricato."
        );

        container.textContent =
            "QR non disponibile";

        return container;
    }

    try {
        const qr =
            qrcode(
                0,
                "M"
            );

        qr.addData(
            value
        );

        qr.make();

        const img =
            document.createElement("img");

        img.src =
            qr.createDataURL(
                5,
                4
            );

        img.alt =
            "QR Code";

        img.draggable =
            false;

        container.appendChild(
            img
        );

    } catch (error) {
        console.error(
            "Errore generazione QR:",
            error
        );

        container.textContent =
            "Errore QR";
    }

    return container;
}


// ============================================================
// CREAZIONE CODICI A BARRE
// ============================================================
/**
 * Create Bar Code
 * 
 * genera un HTML div con il codice a barre
 * @param {string} value - codice numerico
 * @param {string} code_fmt - tipo di codice
 * @returns n HTML div con il codice a barre
 */
function createBarcode(value,code_fmt) {
    const container =
        document.createElement("div");

    container.className =
        "barcode-container";


    const svg =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );


    svg.setAttribute(
        "role",
        "img"
    );


    svg.setAttribute(
        "aria-label",
        code_fmt
    );


    container.appendChild(
        svg
    );


    if (
        typeof JsBarcode !== "function"
    ) {
        console.error(
            "JsBarcode non è stato caricato."
        );
        return container;

    }


    try {
        // Richiama la lib JsBarcode per
        // generare il codice a barre
        JsBarcode(
            svg,
            value,
            {
                format: code_fmt,
                displayValue: true,
                fontSize: 14,
                textMargin: 4,
                margin: 0,
                width: 2,
                height: 70
            }
        );


    } catch (error) {

        console.error(
            `Errore generazione bar code ${code_fmt}:`,
            error
        );


        container.textContent =
            `Errore barcode ${code_fmt}`;

    }


    return container;
}


// ============================================================
// CREA CODICE DELLA CARD
// ============================================================
/**
 * Genrate EAN 13
 * 
 * genera la 13-sima cifra di controllo per un codice
 * EAN-13
 * @param {string} value - 12 cifre dell' EAN
 * @returns codice EAN con 13 cifre
 */
function generateEAN13(value) {
    const digits =
        String(value)
            .replace(/\D/g, "");

    if (
        digits.length !== 12
    ) {

        throw new Error(
            "EAN-13 richiede 12 cifre."
        );
    }

    let sum = 0;
    for (
        let i = 0;
        i < 12;
        i++
    ) {

        const digit =
            Number(
                digits[i]
            );


        sum +=
            i % 2 === 0
                ? digit
                : digit * 3;

    }

    const checkDigit =
        (10 - (sum % 10)) % 10;

    return (
        digits +
        checkDigit
    );
}

/**
 * Create Code Element
 * 
 * generatore del codice da mostrare
 * @param {card} card - JSON con gli attributi della card
 * @returns un HTMLDiv con il codice 
 */
function createCodeElement(card) {

    if (
        card.codeType === "code128"
    ) {

        return createBarcode(
            card.code,
            "CODE128"
        );

    }
    else if (card.codeType === "ean13"){
        return createBarcode(
            generateEAN13(card.code),
            "EAN13");
    }

    return createQRCode(
        card.code
    );
}


// ============================================================
// CREAZIONE HTML CARTA
// ============================================================
function createCardElement(
    card,
    className
) {

    const element =
        document.createElement("div");

    element.className =
        className;

    element.dataset.cardId =
        card.id;

    if (card.gradient == "true"){
        element.style.setProperty(
            "--card-color",
            card.color || "#202020"
        );
    }
    else {
        element.style.setProperty(
            "background-color",
            card.color || "#202020"
        );
    }

    let card_num_class = "";
    if (card.number == null){
        card_num_class = " empty-number";
    }

    let logo = '<div class="empty-logo"></div>';
    if (card.logo != null) {
        logo = `<div class="logo">
        <img
            src="./icons/${escapeHtml(card.logo || "")}"
            alt=""
        >
        </div>`
    }

    element.innerHTML = `
        <div class="card-header">
            ${card.header || ""} 
            <div class="subtitle">
                ${escapeHtml(card.subtitle)}
            </div>
            <h2 class="title">
                ${escapeHtml(card.title)}
            </h2>
        </div>
        ${logo}

        <div class="number${card_num_class}">
        ${escapeHtml(card.number)}
        </div>
        <div class="codebox"></div>
        <div class="hint"></div>
    `;


    const codeBox =
        element.querySelector(
            ".codebox"
        );


    const code =
        createCodeElement(
            card
        );


    codeBox.appendChild(
        code
    );


    return element;
}


// ============================================================
// RENDER STACK
// ============================================================
/**
 * Render Stack
 * 
 * mostra il wallet e le prime tre carte in pila
 */
function renderStack() {

    walletStack.innerHTML = "";

    if (CARDS.length === 0) {
        walletStack.innerHTML = `

            <div
                style="
                    text-align:center;
                    padding:80px 20px;
                    color:#777;
                "
            >

                <p>
                    Nessuna tessera
                </p>

                <button
                    id="emptyAddButton"
                    type="button"
                    style="
                        border:0;
                        border-radius:12px;
                        padding:12px 18px;
                        background:#111;
                        color:white;
                        font-size:16px;
                    "
                >
                    Carica Tessere
                </button>

            </div>

        `;

        const emptyButton =
            document.getElementById(
                "emptyAddButton"
            );


        emptyButton.addEventListener(
            "click",
            () => openImport()
        );
        return;
    }


    /*
     * Mostriamo soltanto
     * le prime tre card.
     */

    const visibleCards =
        CARDS.slice(
            0,
            3
        );


    visibleCards.forEach(
        (card, index) => {

            const element =
                createCardElement(
                    card,
                    "stack-card"
                );


            /*
             * Prima card:
             * davanti
             */

            element.style.zIndex =
                3 - index;


            /*
             * Effetto stack.
             */

            const offset =
                index * 18;


            const scale =
                1 -
                index * 0.04;


            element.style.transform = `
                translateY(${offset}px)
                scale(${scale})
            `;


            walletStack.appendChild(
                element
            );

        }
    );
}


// ============================================================
// APRI SELETTORE
// ============================================================

function openCardSelector() {

    if (
        CARDS.length === 0
    ) {

        return;

    }


    selectorTrack.innerHTML = "";


    /*
     * Crea tutte le card
     * nello slideshow.
     */

    CARDS.forEach(
        (card, index) => {

            const element =
                createCardElement(
                    card,
                    "selector-card"
                );


            element.dataset.index =
                index;


            /*
             * Selezione con tap.
             */

            element.addEventListener(
                "click",
                () => {

                    selectCard(
                        index
                    );

                }
            );


            selectorTrack.appendChild(
                element
            );

        }
    );


    cardSelector.classList.remove(
        "hidden"
    );


    /*
     * Blocca lo scroll della pagina
     * mentre il selettore è aperto.
     */

    document.body.style.overflow =
        "hidden";


    /*
     * Posizione iniziale:
     * prima card.
     */

    requestAnimationFrame(
        () => {

            const firstCard =
                selectorTrack.querySelector(
                    ".selector-card"
                );


            if (firstCard) {

                firstCard.scrollIntoView({
                    behavior: "auto",
                    block: "nearest",
                    inline: "center"
                });

            }

        }
    );

}


// ============================================================
// CHIUDI SELETTORE
// ============================================================

function closeCardSelector() {

    cardSelector.classList.add(
        "hidden"
    );


    document.body.style.overflow =
        "";

}


// ============================================================
// SELEZIONA CARD
// ============================================================

function selectCard(index) {

    if (
        index < 0 ||
        index >= CARDS.length
    ) {

        return;

    }


    /*
     * Spostiamo la card selezionata
     * in prima posizione.
     */

    const selectedCard = CARDS[index];
    CARDS.splice(
        index,
        1
    );

    CARDS.unshift(
        selectedCard
    );

    saveCards(CARDS);
    closeCardSelector();
    renderStack();
}


// ============================================================
// GESTIONE INSERIMENTO/AGGIORNAMENTO MANUALE
// ============================================================

function openForm(card = null) {
    modal.classList.remove(
        "hidden"
    );

    form.reset();

    /*
     * MODIFICA
     */
    if (card) {
        form.dataset.id =
            String(card.id);

        form.elements.title.value =
            card.title || "";

        form.elements.subtitle.value =
            card.subtitle || "";

        form.elements.number.value =
            card.number || "";

        form.elements.name.value =
            card.name || "";

        form.elements.expiry.value =
            card.expiry || "";

        form.elements.codeType.value =
            card.codeType || "qr";

        form.elements.code.value =
            card.code || "";

        form.elements.logo.value =
            card.logo || "W";

        form.elements.color.value =
            card.color || "#202020";
    }

    /*
     * NUOVA CARD
     */
    else {

        form.dataset.id =
            "";

        form.elements.subtitle.value =
            "Nuova carta Fidelity";

        form.elements.logo.value =
            "";

        form.elements.color.value =
            "#202020";

        form.elements.codeType.value =
            "qr";
    }
}


// ============================================================
// CHIUDI FORM
// ============================================================

function closeForm() {
    modal.classList.add(
        "hidden"
    );

    form.dataset.id =
        "";
}


// ============================================================
// SALVA FORM
// ============================================================
function handleFormSubmit(
    event
) {

    event.preventDefault();

    /*
     * ID esistente oppure nuovo ID.
     */
    const id =
        form.dataset.id
            ? Number(
                form.dataset.id
            )
            : Date.now();


    /*
     * Costruiamo la card.
     */
    const card = {
        id,
        title:
            form.elements.title.value.trim(),

        subtitle:
            form.elements.subtitle.value.trim(),

        number:
            form.elements.number.value.trim(),

        name:
            form.elements.name.value.trim(),

        expiry:
            form.elements.expiry.value.trim(),

        codeType:
            form.elements.codeType.value,

        code:
            form.elements.code.value.trim(),

        logo:
            form.elements.logo.value.trim()
            || "W",

        color:
            form.elements.color.value
            || "#202020"

    };


    /*
     * Controllo minimo.
     */

    if (
        !card.title ||
        !card.code
    ) {

        alert(
            "Inserisci almeno il nome della tessera e il codice."
        );

        return;
    }

    /*
     * Cerca card esistente.
     */
    const existingIndex =
        CARDS.findIndex(
            item =>
                item.id === id
        );


    if (
        existingIndex >= 0
    ) {

        /*
         * Modifica.
         */

        CARDS[
            existingIndex
        ] = card;

    } else {

        /*
         * Nuova card.
         *
         * La inseriamo in cima,
         * così sarà immediatamente
         * visibile nello stack.
         */

        CARDS.unshift(
            card
        );

    }

    saveCards(CARDS);
    closeForm();
    renderStack();
}


// ============================================================
// ELIMINA CARD
// ============================================================
function deleteCard(
    index
) {

    if (
        index < 0 ||
        index >= CARDS.length
    ) {

        return;

    }
    const card = CARDS[index];
    const confirmed =
        confirm(
            `Eliminare "${card.title}"?`
        );


    if (!confirmed) {
        return;
    }

    CARDS.splice(
        index,
        1
    );

    saveCards(CARDS);
    renderStack();

    /*
     * Se il selettore è aperto,
     * lo aggiorniamo.
     */
    if (
        !cardSelector.classList.contains(
            "hidden"
        )
    ) {
        openCardSelector();
    }
}


// ============================================================
// MENU CONTESTUALE CARD
// ============================================================
function showCardActions(
    index
) {

    const card = CARDS[index];
    if (!card) {
        return;
    }

    const action =
        prompt(
            `${card.title}\n\n` +
            `1 = Modifica\n` +
            `2 = Elimina\n` +
            `3 = Annulla`,
            "3"
        );

    if (
        action === "1"
    ) {
        openForm(
            card
        );

    }

    if (
        action === "2"
    ) {

        deleteCard(
            index
        );
    }
}


// ============================================================
// LONG PRESS / TOUCH
// ============================================================

let longPressTimer =
    null;


function setupLongPress(
    element,
    index
) {

    element.addEventListener(
        "pointerdown",
        () => {

            longPressTimer =
                setTimeout(
                    () => {

                        showCardActions(
                            index
                        );

                    },
                    650
                );

        }
    );


    const cancel =
        () => {

            if (
                longPressTimer
            ) {

                clearTimeout(
                    longPressTimer
                );

                longPressTimer =
                    null;

            }

        };


    element.addEventListener(
        "pointerup",
        cancel
    );


    element.addEventListener(
        "pointerleave",
        cancel
    );


    element.addEventListener(
        "pointercancel",
        cancel
    );

}


// ============================================================
// EVENTO STACK
// ============================================================

walletStack.addEventListener(
    "click",
    event => {

        /*
         * Se abbiamo cliccato un bottone
         * o un controllo interno, non apriamo
         * il selettore.
         */

        if (
            event.target.closest(
                "button"
            )
        ) {

            return;

        }


        openCardSelector();

    }
);


// ============================================================
// LONG PRESS STACK
// ============================================================

walletStack.addEventListener(
    "contextmenu",
    event => {

        event.preventDefault();


        /*
         * La prima card è quella
         * attualmente selezionata.
         */

        if (
            CARDS.length > 0
        ) {

            showCardActions(
                0
            );

        }

    }
);


// ============================================================
// CHIUDI SELECTOR
// ============================================================

closeSelectorButton.addEventListener(
    "click",
    () => {

        closeCardSelector();

    }
);


// ============================================================
// ESC DA TASTIERA
// ============================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            if (
                !cardSelector.classList.contains(
                    "hidden"
                )
            ) {

                closeCardSelector();

            }


            if (
                !modal.classList.contains(
                    "hidden"
                )
            ) {

                closeForm();

            }

        }

    }
);


// ============================================================
// CHIUDI MODALE
// ============================================================
closeModalButton.addEventListener(
    "click",
    () => {
        closeForm();
    }
);


// ============================================================
// CLICK FUORI DALLA MODALE
// ============================================================
modal.addEventListener(
    "click",
    event => {

        if (
            event.target === modal
        ) {

            closeForm();

        }

    }
);


// ============================================================
// FORM SUBMIT
// ============================================================

form.addEventListener(
    "submit",
    handleFormSubmit
);


// ============================================================
// SWIPE / CAROUSEL
// ============================================================

let scrollTimeout =
    null;


selectorTrack.addEventListener(
    "scroll",
    () => {

        /*
         * Nasconde temporaneamente
         * eventuali effetti durante lo scroll.
         */

        selectorTrack.classList.add(
            "scrolling"
        );


        clearTimeout(
            scrollTimeout
        );


        scrollTimeout =
            setTimeout(
                () => {

                    selectorTrack.classList.remove(
                        "scrolling"
                    );

                },
                120
            );

    },
    {
        passive: true
    }
);


// ============================================================
// SERVICE WORKER
// ============================================================

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register(
                    "sw.js"
                )
                .then(
                    registration => {

                        console.log(
                            "Service Worker registrato:",
                            registration.scope
                        );

                    }
                )
                .catch(
                    error => {

                        console.error(
                            "Errore Service Worker:",
                            error
                        );

                    }
                );
        }
    );

}

// ============================================================
// RENDER INIZIALE
// ============================================================

renderStack();
document.getElementById("import-cards")
.addEventListener("change", function(event) {
    const file = event.target.files[0];
    importCards(file);
});

