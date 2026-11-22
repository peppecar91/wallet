
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

const addButton =
    document.getElementById("addBtn");

const modal =
    document.getElementById("modal");

const closeModalButton =
    document.getElementById("closeModal");

const form =
    document.getElementById("cardForm");


// ============================================================
// CARICAMENTO CARDS
// ============================================================

let cards =
    loadCards();

// ============================================================
// SALVATAGGIO
// ============================================================

function saveCards() {
    try {

        localStorage.setItem(
            "walletCards",
            JSON.stringify(cards)
        );

    } catch (error) {

        console.error(
            "Errore salvataggio tessere:",
            error
        );

    }
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
// CREA CARD
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

function renderStack() {

    walletStack.innerHTML = "";


    if (cards.length === 0) {

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
                    Aggiungi tessera
                </button>

            </div>

        `;


        const emptyButton =
            document.getElementById(
                "emptyAddButton"
            );


        emptyButton.addEventListener(
            "click",
            () => openForm()
        );


        return;
    }


    /*
     * Mostriamo soltanto
     * le prime tre card.
     */

    const visibleCards =
        cards.slice(
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
        cards.length === 0
    ) {

        return;

    }


    selectorTrack.innerHTML = "";


    /*
     * Crea tutte le card
     * nello slideshow.
     */

    cards.forEach(
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
        index >= cards.length
    ) {

        return;

    }


    /*
     * Spostiamo la card selezionata
     * in prima posizione.
     */

    const selectedCard =
        cards[index];


    cards.splice(
        index,
        1
    );


    cards.unshift(
        selectedCard
    );


    saveCards();


    closeCardSelector();


    renderStack();

}


// ============================================================
// FORM: APERTURA
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
            "Tessera personale";


        form.elements.logo.value =
            "W";


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
        cards.findIndex(
            item =>
                item.id === id
        );


    if (
        existingIndex >= 0
    ) {

        /*
         * Modifica.
         */

        cards[
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

        cards.unshift(
            card
        );

    }


    saveCards();


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
        index >= cards.length
    ) {

        return;

    }


    const card =
        cards[index];


    const confirmed =
        confirm(
            `Eliminare "${card.title}"?`
        );


    if (!confirmed) {

        return;

    }


    cards.splice(
        index,
        1
    );


    saveCards();


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

    const card =
        cards[index];


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
            cards.length > 0
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
// AGGIUNGI
// ============================================================

addButton.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        openForm();

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

saveCards();

renderStack();


// ============================================================
// DEBUG
// ============================================================

console.log(
    "Wallet avviato.",
    cards.length,
    "tessere disponibili."
);
