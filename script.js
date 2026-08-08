/* =========================================================
   LAST DECREE V5
   REAL NEXUS
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
   FIREBASE
========================================================= */

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getFirestore(app);


/* =========================================================
   ELEMENTS
========================================================= */

const authScreen =
    document.getElementById("auth-screen");

const appScreen =
    document.getElementById("app");

const loginForm =
    document.getElementById("login-form");

const registerForm =
    document.getElementById("register-form");

const authMessage =
    document.getElementById("auth-message");


/* =========================================================
   BOOT
========================================================= */

const bootScreen =
    document.getElementById("boot-screen");

const bootBar =
    document.getElementById("boot-bar");

const bootText =
    document.getElementById("boot-text");


const bootMessages = [
    "INITIALISATION DU NEXUS...",
    "CHARGEMENT FIREBASE...",
    "VÉRIFICATION DE L'AUTHENTIFICATION...",
    "SYNCHRONISATION DES DONNÉES...",
    "NEXUS PRÊT."
];


let progress = 0;


const bootInterval =
    setInterval(() => {

        progress += 20;

        if (progress > 100) {
            progress = 100;
        }

        bootBar.style.width =
            progress + "%";


        bootText.textContent =
            bootMessages[
                Math.min(
                    bootMessages.length - 1,
                    Math.floor(progress / 25)
                )
            ];


        if (progress >= 100) {

            clearInterval(
                bootInterval
            );

            setTimeout(() => {

                bootScreen.classList.add(
                    "hide"
                );

            }, 500);

        }

    }, 250);


/* =========================================================
   AUTH MODE
========================================================= */

document
    .getElementById("show-register")
    .addEventListener(
        "click",
        () => {

            loginForm.classList.add(
                "hidden"
            );

            registerForm.classList.remove(
                "hidden"
            );

            authMessage.textContent = "";

        }
    );


document
    .getElementById("show-login")
    .addEventListener(
        "click",
        () => {

            registerForm.classList.add(
                "hidden"
            );

            loginForm.classList.remove(
                "hidden"
            );

            authMessage.textContent = "";

        }
    );


/* =========================================================
   REGISTER
========================================================= */

document
    .getElementById("register-button")
    .addEventListener(
        "click",
        async () => {

            const name =
                document
                    .getElementById(
                        "register-name"
                    )
                    .value
                    .trim();


            const email =
                document
                    .getElementById(
                        "register-email"
                    )
                    .value
                    .trim();


            const password =
                document
                    .getElementById(
                        "register-password"
                    )
                    .value;


            if (!name || !email || !password) {

                setAuthMessage(
                    "Tous les champs sont requis."
                );

                return;
            }


            if (password.length < 6) {

                setAuthMessage(
                    "Le mot de passe doit contenir au moins 6 caractères."
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

                        rank: "XI — Observateur",

                        createdAt:
                            serverTimestamp()

                    }
                );


                setAuthMessage(
                    "Identité créée. Connexion..."
                );


            } catch (error) {

                setAuthMessage(
                    firebaseError(
                        error.code
                    )
                );

            }

        }
    );


/* =========================================================
   LOGIN
========================================================= */

document
    .getElementById("login-button")
    .addEventListener(
        "click",
        async () => {

            const email =
                document
                    .getElementById(
                        "login-email"
                    )
                    .value
                    .trim();


            const password =
                document
                    .getElementById(
                        "login-password"
                    )
                    .value;


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
                    "Connexion autorisée."
                );


            } catch (error) {

                setAuthMessage(
                    firebaseError(
                        error.code
                    )
                );

            }

        }
    );


/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(
    auth,
    async user => {

        if (user) {

            authScreen.classList.add(
                "hidden"
            );

            appScreen.classList.remove(
                "hidden"
            );


            await loadUserProfile(
                user.uid
            );


            await loadDashboard();

            await loadDecrees();

        } else {

            authScreen.classList.remove(
                "hidden"
            );

            appScreen.classList.add(
                "hidden"
            );

        }

    }
);


/* =========================================================
   USER PROFILE
========================================================= */

let currentProfile = null;


async function loadUserProfile(uid) {

    const snapshot =
        await getDoc(
            doc(
                db,
                "users",
                uid
            )
        );


    if (!snapshot.exists()) {

        currentProfile = {

            name:
                auth.currentUser.email
                    .split("@")[0],

            role: "member",

            rank: "XI — Observateur"

        };

        return;

    }


    currentProfile =
        snapshot.data();


    const name =
        currentProfile.name ||
        "AGENT";


    const role =
        currentProfile.role ||
        "member";


    document.getElementById(
        "profile-name"
    ).textContent =
        name.toUpperCase();


    document.getElementById(
        "profile-role"
    ).textContent =
        role.toUpperCase();


    document.getElementById(
        "sidebar-user"
    ).textContent =
        name.toUpperCase();


    document.getElementById(
        "sidebar-role"
    ).textContent =
        currentProfile.rank ||
        role.toUpperCase();


    const admin =
        role === "admin";


    document
        .getElementById("admin-nav")
        .style.display =
        admin
            ? "flex"
            : "none";


    document
        .getElementById("new-decree-button")
        .style.display =
        admin
            ? "block"
            : "none";

}


/* =========================================================
   DASHBOARD
========================================================= */

async function loadDashboard() {

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


        document.getElementById(
            "stat-decrets"
        ).textContent =
            decrees.size;


        document.getElementById(
            "stat-members"
        ).textContent =
            users.size;


        document.getElementById(
            "stat-archives"
        ).textContent =
            decrees.size;


        document.getElementById(
            "archive-decrets"
        ).textContent =
            `${decrees.size} fichiers`;


        document.getElementById(
            "archive-agents"
        ).textContent =
            `${users.size} membres`;


        renderActivity(
            decrees
        );


    } catch (error) {

        console.error(error);

    }

}


/* =========================================================
   ACTIVITY
========================================================= */

function renderActivity(snapshot) {

    const container =
        document.getElementById(
            "activity-list"
        );


    container.innerHTML = "";


    if (snapshot.empty) {

        container.innerHTML = `
            <div class="timeline-item">
                <span class="timeline-dot"></span>
                <div>
                    <strong>
                        Aucun événement récent
                    </strong>
                    <small>
                        Le Nexus attend sa première activité.
                    </small>
                </div>
            </div>
        `;

        return;

    }


    snapshot.forEach(item => {

        const data =
            item.data();


        const div =
            document.createElement(
                "div"
            );


        div.className =
            "timeline-item";


        div.innerHTML = `

            <span class="timeline-dot"></span>

            <div>

                <strong>
                    Décret #${data.number || "?"}
                    enregistré
                </strong>

                <small>
                    ${data.title || "Sans titre"}
                </small>

            </div>

        `;


        container.appendChild(
            div
        );

    });

}


/* =========================================================
   LOAD DECREES
========================================================= */

async function loadDecrees() {

    const grid =
        document.getElementById(
            "decree-grid"
        );


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
                    Aucun Décret enregistré.
                </div>
            `;

            return;

        }


        snapshot.forEach(item => {

            renderDecree(
                item.id,
                item.data()
            );

        });


    } catch (error) {

        console.error(error);


        grid.innerHTML = `
            <div class="loading-card">
                Impossible de charger les Décrets.
            </div>
        `;

    }

}


/* =========================================================
   RENDER DECREE
========================================================= */

function renderDecree(id, data) {

    const grid =
        document.getElementById(
            "decree-grid"
        );


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
                "Décret sans titre"
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
        .addEventListener(
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
   ADMIN
========================================================= */

document
    .getElementById(
        "publish-decree"
    )
    .addEventListener(
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
                .classList.add(
                    "show"
                );

        }
    );


document
    .getElementById(
        "close-editor"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "editor-panel"
                )
                .classList.remove(
                    "show"
                );

        }
    );


document
    .getElementById(
        "save-decree"
    )
    .addEventListener(
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


    const title =
        document
            .getElementById(
                "decree-title"
            )
            .value
            .trim();


    const content =
        document
            .getElementById(
                "decree-content"
            )
            .value
            .trim();


    if (!title || !content) {

        showToast(
            "Titre et contenu requis."
        );

        return;
    }


    try {

        const existing =
            await getDocs(
                collection(
                    db,
                    "decrees"
                )
            );


        const number =
            existing.size + 1;


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


        document.getElementById(
            "decree-title"
        ).value = "";


        document.getElementById(
            "decree-content"
        ).value = "";


        document
            .getElementById(
                "editor-panel"
            )
            .classList.remove(
                "show"
            );


        showToast(
            "Décret publié dans le Nexus."
        );


        await loadDecrees();

        await loadDashboard();


    } catch (error) {

        console.error(error);

        showToast(
            "Erreur lors de la publication."
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
    .addEventListener(
        "click",
        loadMembers
    );


async function loadMembers() {

    const panel =
        document.getElementById(
            "members-panel"
        );


    panel.innerHTML =
        "CHARGEMENT DES MEMBRES...";


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "users"
                )
            );


        panel.innerHTML = "";


        snapshot.forEach(item => {

            const user =
                item.data();


            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "member-row";


            div.innerHTML = `

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
                div
            );

        });


    } catch (error) {

        console.error(error);

        panel.innerHTML =
            "Erreur de chargement.";

    }

}


/* =========================================================
   SYSTEM CHECK
========================================================= */

document
    .getElementById(
        "system-check"
    )
    .addEventListener(
        "click",
        () => {

            showToast(
                "Firebase + Auth + Firestore opérationnels."
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
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const message =
                document
                    .getElementById(
                        "recruitment-message"
                    )
                    .value
                    .trim();


            if (!message) {

                showToast(
                    "Écrivez votre motivation."
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


                document
                    .getElementById(
                        "recruitment-form"
                    )
                    .reset();


                showToast(
                    "Candidature transmise."
                );


            } catch (error) {

                console.error(error);

                showToast(
                    "Impossible de transmettre."
                );

            }

        }
    );


/* =========================================================
   LOGOUT
========================================================= */

document
    .getElementById(
        "logout-button"
    )
    .addEventListener(
        "click",
        async () => {

            await signOut(
                auth
            );

        }
    );


/* =========================================================
   NAVIGATION
========================================================= */

document
    .querySelectorAll(
        ".nav-item"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openPage(
                    button.dataset.page
                );

            }
        );

    });


document
    .querySelectorAll(
        "[data-page-target]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openPage(
                    button.dataset.pageTarget
                );

            }
        );

    });


function openPage(id) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active"
            );

        });


    const page =
        document.getElementById(
            id
        );


    if (!page) return;


    page.classList.add(
        "active"
    );


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.page === id
            );

        });


    document.getElementById(
        "current-page"
    ).textContent =
        id.toUpperCase();


    document
        .querySelector(".sidebar")
        .classList.remove(
            "mobile-open"
        );

}


/* =========================================================
   MOBILE MENU
========================================================= */

document
    .getElementById(
        "mobile-menu"
    )
    .addEventListener(
        "click",
        () => {

            document
                .querySelector(
                    ".sidebar"
                )
                .classList.toggle(
                    "mobile-open"
                );

        }
    );


/* =========================================================
   SEARCH
========================================================= */

const searchPanel =
    document.getElementById(
        "search-panel"
    );


document
    .getElementById(
        "search-button"
    )
    .addEventListener(
        "click",
        () => {

            searchPanel.classList.toggle(
                "show"
            );

        }
    );


document
    .getElementById(
        "close-search"
    )
    .addEventListener(
        "click",
        () => {

            searchPanel.classList.remove(
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
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "notification-panel"
                )
                .classList.toggle(
                    "show"
                );

        }
    );


/* =========================================================
   CLOCK
========================================================= */

function updateClock() {

    const now =
        new Date();


    document.getElementById(
        "clock"
    ).textContent =

        now
            .toLocaleTimeString(
                "fr-FR"
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

let toastTimeout;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    document.getElementById(
        "toast-message"
    ).textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimeout
    );


    toastTimeout =
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
   AUTH ERROR
========================================================= */

function setAuthMessage(message) {

    authMessage.textContent =
        message;

}


function firebaseError(code) {

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
        "Erreur d'authentification."
    );

}


/* =========================================================
   SECURITY HELPERS
========================================================= */

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


function formatDate(timestamp) {

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
   PARTICLES
========================================================= */

const canvas =
    document.getElementById(
        "particles"
    );

const ctx =
    canvas.getContext("2d");


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
            80,
            Math.floor(
                window.innerWidth / 15
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
                .4 +
                .1,

            opacity:
                Math.random() *
                .5

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


    particles.forEach(p => {

        p.y -= p.speed;


        if (p.y < 0) {

            p.y =
                canvas.height;

        }


        ctx.beginPath();


        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            `rgba(255,255,255,${p.opacity})`;


        ctx.fill();

    });


    requestAnimationFrame(
        animateParticles
    );

}


animateParticles();
