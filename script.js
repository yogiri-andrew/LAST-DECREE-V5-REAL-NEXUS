/* =========================================================
   LAST DECREE V5 — REAL NEXUS
   FIREBASE SAFE MODE
========================================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    setDoc,
    getDoc,
    query,
    orderBy,
    limit,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    firebaseConfig
} from "./firebase-config.js";


/* =========================================================
   GLOBAL STATE
========================================================= */

let firebaseOK = false;
let auth = null;
let db = null;
let currentProfile = null;


/* =========================================================
   DOM
========================================================= */

const bootScreen =
    document.getElementById("boot-screen");

const bootBar =
    document.getElementById("boot-bar");

const bootText =
    document.getElementById("boot-text");

const authScreen =
    document.getElementById("auth-screen");

const appScreen =
    document.getElementById("app");

const authMessage =
    document.getElementById("auth-message");


/* =========================================================
   SAFE BOOT
========================================================= */

async function startNexus() {

    try {

        bootMessage(
            "INITIALISATION DU NEXUS...",
            15
        );

        await wait(250);


        bootMessage(
            "CHARGEMENT DU SYSTÈME...",
            35
        );

        await wait(250);


        bootMessage(
            "CONNEXION À FIREBASE...",
            55
        );


        /*
         * Vérification de la configuration
         */

        if (
            !firebaseConfig ||
            !firebaseConfig.apiKey ||
            firebaseConfig.apiKey === "TA_API_KEY"
        ) {

            throw new Error(
                "Firebase configuration missing"
            );

        }


        /*
         * Initialisation Firebase
         */

        const firebaseApp =
            initializeApp(
                firebaseConfig
            );


        auth =
            getAuth(
                firebaseApp
            );


        db =
            getFirestore(
                firebaseApp
            );


        firebaseOK = true;


        bootMessage(
            "FIREBASE CONNECTÉ.",
            75
        );


        await wait(250);


        bootMessage(
            "NEXUS OPÉRATIONNEL.",
            100
        );


        await wait(400);


        /*
         * Firebase fonctionne.
         */

        startAuthentication();


    } catch (error) {

        /*
         * Firebase a planté.
         * MAIS LE SITE CONTINUE.
         */

        console.error(
            "Firebase error:",
            error
        );


        firebaseOK = false;


        bootMessage(
            "MODE HORS-LIGNE ACTIVÉ.",
            100
        );


        await wait(500);


        showOfflineMode();

    }

}


/* =========================================================
   BOOT MESSAGE
========================================================= */

function bootMessage(
    message,
    progress
) {

    if (bootText) {

        bootText.textContent =
            message;

    }


    if (bootBar) {

        bootBar.style.width =
            progress + "%";

    }

}


/* =========================================================
   WAIT
========================================================= */

function wait(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );

}


/* =========================================================
   OFFLINE MODE
========================================================= */

function showOfflineMode() {

    /*
     * L'écran de chargement disparaît
     */

    if (bootScreen) {

        bootScreen.classList.add(
            "hide"
        );

    }


    /*
     * On cache la connexion Firebase
     */

    if (authScreen) {

        authScreen.classList.add(
            "hidden"
        );

    }


    /*
     * On affiche directement le site
     */

    if (appScreen) {

        appScreen.classList.remove(
            "hidden"
        );

    }


    /*
     * Message système
     */

    showToast(
        "Mode hors-ligne — Firebase indisponible."
    );


    /*
     * Profil temporaire
     */

    currentProfile = {

        name: "VISITEUR",

        role: "offline",

        rank: "XI — Observateur"

    };


    updateProfileUI();


    /*
     * Données locales
     */

    loadOfflineData();

}


/* =========================================================
   AUTHENTICATION
========================================================= */

function startAuthentication() {

    onAuthStateChanged(
        auth,
        async user => {

            try {

                if (user) {

                    if (authScreen) {

                        authScreen.classList.add(
                            "hidden"
                        );

                    }


                    if (appScreen) {

                        appScreen.classList.remove(
                            "hidden"
                        );

                    }


                    await loadUserProfile(
                        user.uid
                    );


                    await loadDashboard();

                    await loadDecrees();


                } else {

                    if (authScreen) {

                        authScreen.classList.remove(
                            "hidden"
                        );

                    }


                    if (appScreen) {

                        appScreen.classList.add(
                            "hidden"
                        );

                    }

                }


                hideBoot();

            } catch (error) {

                console.error(
                    error
                );

                showOfflineMode();

            }

        }
    );

}


/* =========================================================
   HIDE BOOT
========================================================= */

function hideBoot() {

    if (!bootScreen) return;

    bootScreen.classList.add(
        "hide"
    );

}


/* =========================================================
   LOGIN
========================================================= */

const loginButton =
    document.getElementById(
        "login-button"
    );


if (loginButton) {

    loginButton.addEventListener(
        "click",
        async () => {

            if (!firebaseOK) {

                setAuthMessage(
                    "Firebase indisponible. Mode hors-ligne."
                );

                return;

            }


            const email =
                getValue(
                    "login-email"
                );


            const password =
                getValue(
                    "login-password"
                );


            if (!email || !password) {

                setAuthMessage(
                    "Email et mot de passe requis."
                );

                return;

            }


            try {

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


                setAuthMessage(
                    "ACCÈS AUTORISÉ."
                );


            } catch (error) {

                console.error(
                    error
                );


                setAuthMessage(
                    firebaseError(
                        error.code
                    )
                );

            }

        }
    );

}


/* =========================================================
   REGISTER
========================================================= */

const registerButton =
    document.getElementById(
        "register-button"
    );


if (registerButton) {

    registerButton.addEventListener(
        "click",
        async () => {

            if (!firebaseOK) {

                setAuthMessage(
                    "Firebase indisponible."
                );

                return;

            }


            const name =
                getValue(
                    "register-name"
                );


            const email =
                getValue(
                    "register-email"
                );


            const password =
                getValue(
                    "register-password"
                );


            if (
                !name ||
                !email ||
                !password
            ) {

                setAuthMessage(
                    "Tous les champs sont requis."
                );

                return;

            }


            if (
                password.length < 6
            ) {

                setAuthMessage(
                    "Mot de passe : 6 caractères minimum."
                );

                return;

            }


            try {

                const credential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                await setDoc(
                    doc(
                        db,
                        "users",
                        credential.user.uid
                    ),
                    {

                        name,

                        email,

                        role: "member",

                        rank:
                            "XI — Observateur",

                        createdAt:
                            serverTimestamp()

                    }
                );


                setAuthMessage(
                    "IDENTITÉ CRÉÉE."
                );


            } catch (error) {

                console.error(
                    error
                );


                setAuthMessage(
                    firebaseError(
                        error.code
                    )
                );

            }

        }
    );

}


/* =========================================================
   SWITCH AUTH
========================================================= */

const showRegister =
    document.getElementById(
        "show-register"
    );


if (showRegister) {

    showRegister.addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "login-form"
                )
                ?.classList.add(
                    "hidden"
                );


            document
                .getElementById(
                    "register-form"
                )
                ?.classList.remove(
                    "hidden"
                );

        }
    );

}


const showLogin =
    document.getElementById(
        "show-login"
    );


if (showLogin) {

    showLogin.addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "register-form"
                )
                ?.classList.add(
                    "hidden"
                );


            document
                .getElementById(
                    "login-form"
                )
                ?.classList.remove(
                    "hidden"
                );

        }
    );

}


/* =========================================================
   USER PROFILE
========================================================= */

async function loadUserProfile(uid) {

    try {

        const snapshot =
            await getDoc(
                doc(
                    db,
                    "users",
                    uid
                )
            );


        if (snapshot.exists()) {

            currentProfile =
                snapshot.data();

        } else {

            currentProfile = {

                name:
                    auth.currentUser
                        ?.email
                        ?.split("@")[0] ||
                    "AGENT",

                role: "member",

                rank:
                    "XI — Observateur"

            };

        }


        updateProfileUI();


    } catch (error) {

        console.error(
            error
        );


        currentProfile = {

            name: "AGENT",

            role: "member",

            rank:
                "XI — Observateur"

        };


        updateProfileUI();

    }

}


/* =========================================================
   UPDATE PROFILE UI
========================================================= */

function updateProfileUI() {

    const name =
        currentProfile?.name ||
        "AGENT";


    const role =
        currentProfile?.role ||
        "member";


    setText(
        "profile-name",
        name.toUpperCase()
    );


    setText(
        "profile-role",
        role.toUpperCase()
    );


    setText(
        "sidebar-user",
        name.toUpperCase()
    );


    setText(
        "sidebar-role",
        currentProfile?.rank ||
        role.toUpperCase()
    );


    const adminNav =
        document.getElementById(
            "admin-nav"
        );


    if (adminNav) {

        adminNav.style.display =
            role === "admin"
                ? "flex"
                : "none";

    }


    const newDecree =
        document.getElementById(
            "new-decree-button"
        );


    if (newDecree) {

        newDecree.style.display =
            role === "admin"
                ? "block"
                : "none";

    }

}


/* =========================================================
   DASHBOARD
========================================================= */

async function loadDashboard() {

    if (!firebaseOK) {

        loadOfflineData();

        return;

    }


    try {

        const decrees =
            await getDocs(
                collection(
                    db,
                    "decrees"
                )
            );


        const users =
            await getDocs(
                collection(
                    db,
                    "users"
                )
            );


        setText(
            "stat-decrets",
            decrees.size
        );


        setText(
            "stat-members",
            users.size
        );


        setText(
            "stat-archives",
            decrees.size
        );


        setText(
            "archive-decrets",
            `${decrees.size} fichiers`
        );


        setText(
            "archive-agents",
            `${users.size} membres`
        );


        renderActivity(
            decrees
        );


    } catch (error) {

        console.error(
            error
        );


        loadOfflineData();

    }

}


/* =========================================================
   OFFLINE DATA
========================================================= */

function loadOfflineData() {

    setText(
        "stat-decrets",
        "—"
    );


    setText(
        "stat-members",
        "—"
    );


    setText(
        "stat-archives",
        "—"
    );


    setText(
        "archive-decrets",
        "Mode hors-ligne"
    );


    setText(
        "archive-agents",
        "Mode hors-ligne"
    );


    const activity =
        document.getElementById(
            "activity-list"
        );


    if (activity) {

        activity.innerHTML = `

            <div class="timeline-item">

                <span class="timeline-dot"></span>

                <div>

                    <strong>
                        NEXUS HORS-LIGNE
                    </strong>

                    <small>
                        Firebase est actuellement indisponible.
                    </small>

                </div>

            </div>

        `;

    }


    const grid =
        document.getElementById(
            "decree-grid"
        );


    if (grid) {

        grid.innerHTML = `

            <div class="loading-card">

                FIREBASE INDISPONIBLE

                <br><br>

                L'interface reste accessible.

            </div>

        `;

    }

}


/* =========================================================
   DECRETS
========================================================= */

async function loadDecrees() {

    if (!firebaseOK) {

        loadOfflineData();

        return;

    }


    const grid =
        document.getElementById(
            "decree-grid"
        );


    if (!grid) return;


    grid.innerHTML = `

        <div class="loading-card">
            SYNCHRONISATION...
        </div>

    `;


    try {

        const q =
            query(
                collection(
                    db,
                    "decrees"
                ),
                orderBy(
                    "createdAt",
                    "desc"
                ),
                limit(50)
            );


        const snapshot =
            await getDocs(q);


        grid.innerHTML = "";


        if (snapshot.empty) {

            grid.innerHTML = `

                <div class="loading-card">

                    AUCUN DÉCRET

                </div>

            `;

            return;

        }


        snapshot.forEach(
            item => {

                renderDecree(
                    item.id,
                    item.data()
                );

            }
        );


    } catch (error) {

        console.error(
            error
        );


        grid.innerHTML = `

            <div class="loading-card">

                IMPOSSIBLE DE CHARGER LES DÉCRETS

                <br><br>

                Mode sécurisé activé.

            </div>

        `;

    }

}


/* =========================================================
   RENDER DECREE
========================================================= */

function renderDecree(
    id,
    data
) {

    const grid =
        document.getElementById(
            "decree-grid"
        );


    if (!grid) return;


    const card =
        document.createElement(
            "article"
        );


    card.className =
        "decree-card";


    card.innerHTML = `

        <div class="decree-number">

            #${data.number || "?"}

        </div>


        <span class="tag">

            ACTIF

        </span>


        <h2>

            ${escapeHTML(
                data.title ||
                "Décret"
            )}

        </h2>


        <p>

            ${escapeHTML(
                data.content ||
                ""
            )}

        </p>


        <div class="decree-footer">

            <span>

                ${formatDate(
                    data.createdAt
                )}

            </span>


            <button
                class="open-decree"
            >

                CONSULTER →

            </button>

        </div>

    `;


    card
        .querySelector(
            ".open-decree"
        )
        ?.addEventListener(
            "click",
            () => {

                showToast(
                    "Décret consulté."
                );

            }
        );


    grid.appendChild(
        card
    );

}


/* =========================================================
   ADMIN — OPEN EDITOR
========================================================= */

const publishButton =
    document.getElementById(
        "publish-decree"
    );


if (publishButton) {

    publishButton.addEventListener(
        "click",
        () => {

            if (
                currentProfile?.role !==
                "admin"
            ) {

                showToast(
                    "Accès administrateur requis."
                );

                return;

            }


            document
                .getElementById(
                    "editor-panel"
                )
                ?.classList.add(
                    "show"
                );

        }
    );

}


/* =========================================================
   ADMIN — CLOSE EDITOR
========================================================= */

document
    .getElementById(
        "close-editor"
    )
    ?.addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "editor-panel"
                )
                ?.classList.remove(
                    "show"
                );

        }
    );


/* =========================================================
   ADMIN — SAVE
========================================================= */

document
    .getElementById(
        "save-decree"
    )
    ?.addEventListener(
        "click",
        publishDecree
    );


async function publishDecree() {

    if (
        currentProfile?.role !==
        "admin"
    ) {

        showToast(
            "Autorisation refusée."
        );

        return;

    }


    if (!firebaseOK) {

        showToast(
            "Firebase indisponible."
        );

        return;

    }


    const title =
        getValue(
            "decree-title"
        );


    const content =
        getValue(
            "decree-content"
        );


    if (!title || !content) {

        showToast(
            "Titre et contenu requis."
        );

        return;

    }


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "decrees"
                )
            );


        const number =
            snapshot.size + 1;


        await addDoc(
            collection(
                db,
                "decrees"
            ),
            {

                number,

                title,

                content,

                author:
                    currentProfile.name,

                createdAt:
                    serverTimestamp()

            }
        );


        setValue(
            "decree-title",
            ""
        );


        setValue(
            "decree-content",
            ""
        );


        document
            .getElementById(
                "editor-panel"
            )
            ?.classList.remove(
                "show"
            );


        showToast(
            "Décret publié."
        );


        await loadDecrees();

        await loadDashboard();


    } catch (error) {

        console.error(
            error
        );


        showToast(
            "Publication impossible."
        );

    }

}


/* =========================================================
   MEMBERS
========================================================= */

document
    .getElementById(
        "load-members"
    )
    ?.addEventListener(
        "click",
        loadMembers
    );


async function loadMembers() {

    if (!firebaseOK) {

        showToast(
            "Firebase indisponible."
        );

        return;

    }


    const panel =
        document.getElementById(
            "members-panel"
        );


    if (!panel) return;


    panel.innerHTML =
        "CHARGEMENT...";


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "users"
                )
            );


        panel.innerHTML = "";


        snapshot.forEach(
            item => {

                const user =
                    item.data();


                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "member-row";


                row.innerHTML = `

                    <strong>

                        ${escapeHTML(
                            user.name ||
                            "AGENT"
                        )}

                    </strong>


                    <span>

                        ${escapeHTML(
                            user.rank ||
                            "XI — Observateur"
                        )}

                    </span>


                    <small>

                        ${escapeHTML(
                            user.role ||
                            "member"
                        )}

                    </small>

                `;


                panel.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(
            error
        );


        panel.innerHTML =
            "Erreur de chargement.";

    }

}


/* =========================================================
   LOGOUT
========================================================= */

document
    .getElementById(
        "logout-button"
    )
    ?.addEventListener(
        "click",
        async () => {

            if (!firebaseOK) {

                location.reload();

                return;

            }


            try {

                await signOut(
                    auth
                );

            } catch (error) {

                console.error(
                    error
                );

            }

        }
    );


/* =========================================================
   NAVIGATION
========================================================= */

document
    .querySelectorAll(
        ".nav-item"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    openPage(
                        button.dataset.page
                    );

                }
            );

        }
    );


document
    .querySelectorAll(
        "[data-page-target]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    openPage(
                        button.dataset.pageTarget
                    );

                }
            );

        }
    );


function openPage(id) {

    document
        .querySelectorAll(
            ".page"
        )
        .forEach(
            page => {

                page.classList.remove(
                    "active"
                );

            }
        );


    document
        .getElementById(id)
        ?.classList.add(
            "active"
        );


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item.dataset.page === id
                );

            }
        );


    setText(
        "current-page",
        id.toUpperCase()
    );

}


/* =========================================================
   MOBILE
========================================================= */

document
    .getElementById(
        "mobile-menu"
    )
    ?.addEventListener(
        "click",
        () => {

            document
                .querySelector(
                    ".sidebar"
                )
                ?.classList.toggle(
                    "mobile-open"
                );

        }
    );


/* =========================================================
   SEARCH
========================================================= */

document
    .getElementById(
        "search-button"
    )
    ?.addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "search-panel"
                )
                ?.classList.toggle(
                    "show"
                );

        }
    );


document
    .getElementById(
        "close-search"
    )
    ?.addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "search-panel"
                )
                ?.classList.remove(
                    "show"
                );

        }
    );


/* =========================================================
   NOTIFICATIONS
========================================================= */

document
    .getElementById(
        "notification-button"
    )
    ?.addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "notification-panel"
                )
                ?.classList.toggle(
                    "show"
                );

        }
    );


/* =========================================================
   RECRUITMENT
========================================================= */

document
    .getElementById(
        "recruitment-form"
    )
    ?.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!firebaseOK) {

                showToast(
                    "Firebase indisponible."
                );

                return;

            }


            const message =
                getValue(
                    "recruitment-message"
                );


            if (!message) {

                showToast(
                    "Motivation requise."
                );

                return;

            }


            try {

                await addDoc(
                    collection(
                        db,
                        "applications"
                    ),
                    {

                        uid:
                            auth.currentUser.uid,

                        name:
                            currentProfile.name,

                        message,

                        status:
                            "pending",

                        createdAt:
                            serverTimestamp()

                    }
                );


                setValue(
                    "recruitment-message",
                    ""
                );


                showToast(
                    "Candidature transmise."
                );


            } catch (error) {

                console.error(
                    error
                );


                showToast(
                    "Transmission impossible."
                );

            }

        }
    );


/* =========================================================
   CLOCK
========================================================= */

function updateClock() {

    setText(
        "clock",
        new Date().toLocaleTimeString(
            "fr-FR"
        )
    );

}


setInterval(
    updateClock,
    1000
);


updateClock();


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) return;


    setText(
        "toast-message",
        message
    );


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3500
        );

}


/* =========================================================
   AUTH MESSAGE
========================================================= */

function setAuthMessage(
    message
) {

    if (authMessage) {

        authMessage.textContent =
            message;

    }

}


/* =========================================================
   FIREBASE ERRORS
========================================================= */

function firebaseError(
    code
) {

    const errors = {

        "auth/email-already-in-use":
            "Cette identité existe déjà.",

        "auth/invalid-email":
            "Adresse email invalide.",

        "auth/weak-password":
            "Mot de passe trop faible.",

        "auth/invalid-credential":
            "Identifiants incorrects.",

        "auth/user-not-found":
            "Identité introuvable.",

        "auth/wrong-password":
            "Mot de passe incorrect."

    };


    return (
        errors[code] ||
        "Erreur Firebase."
    );

}


/* =========================================================
   UTILS
========================================================= */

function getValue(id) {

    return (
        document
            .getElementById(id)
            ?.value
            ?.trim() ||
        ""
    );

}


function setValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.value =
            value;

    }

}


function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


function formatDate(
    timestamp
) {

    if (
        !timestamp ||
        !timestamp.toDate
    ) {

        return "DATE INCONNUE";

    }


    return timestamp
        .toDate()
        .toLocaleDateString(
            "fr-FR"
        );

}


/* =========================================================
   ACTIVITY
========================================================= */

function renderActivity(
    snapshot
) {

    const container =
        document.getElementById(
            "activity-list"
        );


    if (!container) return;


    container.innerHTML = "";


    if (snapshot.empty) {

        container.innerHTML = `

            <div class="timeline-item">

                <span class="timeline-dot"></span>

                <div>

                    <strong>
                        Aucun événement
                    </strong>

                    <small>
                        Le Nexus attend sa première activité.
                    </small>

                </div>

            </div>

        `;

        return;

    }


    snapshot.forEach(
        item => {

            const data =
                item.data();


            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "timeline-item";


            element.innerHTML = `

                <span class="timeline-dot"></span>

                <div>

                    <strong>

                        Décret #${
                            data.number ||
                            "?"
                        }

                    </strong>

                    <small>

                        ${escapeHTML(
                            data.title ||
                            "Sans titre"
                        )}

                    </small>

                </div>

            `;


            container.appendChild(
                element
            );

        }
    );

}


/* =========================================================
   PARTICLES
========================================================= */

const canvas =
    document.getElementById(
        "particles"
    );


if (canvas) {

    const ctx =
        canvas.getContext(
            "2d"
        );


    let particles = [];


    function resizeCanvas() {

        canvas.width =
            window.innerWidth;

        canvas.height =
            window.innerHeight;

    }


    resizeCanvas();


    window.addEventListener(
        "resize",
        resizeCanvas
    );


    function createParticles() {

        particles = [];


        const amount =
            Math.min(
                70,
                Math.floor(
                    window.innerWidth / 18
                )
            );


        for (
            let i = 0;
            i < amount;
            i++
        ) {

            particles.push({

                x:
                    Math.random() *
                    canvas.width,

                y:
                    Math.random() *
                    canvas.height,

                size:
                    Math.random() *
                    1.5,

                speed:
                    Math.random() *
                    .35 +
                    .1,

                opacity:
                    Math.random() *
                    .4

            });

        }

    }


    createParticles();


    function animateParticles() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        particles.forEach(
            particle => {

                particle.y -=
                    particle.speed;


                if (
                    particle.y < 0
                ) {

                    particle.y =
                        canvas.height;

                }


                ctx.beginPath();


                ctx.arc(
                    particle.x,
                    particle.y,
                    particle.size,
                    0,
                    Math.PI * 2
                );


                ctx.fillStyle =
                    `rgba(255,255,255,${particle.opacity})`;


                ctx.fill();

            }
        );


        requestAnimationFrame(
            animateParticles
        );

    }


    animateParticles();

}


/* =========================================================
   START
========================================================= */

startNexus();
