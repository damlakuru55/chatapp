"use strict";


/* =========================================
   VERİLER
========================================= */

let contacts = loadJSON(
    "chat_contacts",
    []
);

let messages = loadJSON(
    "chat_messages",
    {}
);

let profile = loadJSON(
    "chat_profile",
    {
        name: "",
        photo: ""
    }
);

let selectedContact = null;

let soundEnabled =
    localStorage.getItem("chat_sound") !== "false";


/* =========================================
   ELEMENTLER
========================================= */

const contactList =
    document.getElementById(
        "contactList"
    );

const emptyContacts =
    document.getElementById(
        "emptyContacts"
    );

const newPersonBtn =
    document.getElementById(
        "newPersonBtn"
    );

const emptyAddBtn =
    document.getElementById(
        "emptyAddBtn"
    );

const welcomeAddBtn =
    document.getElementById(
        "welcomeAddBtn"
    );

const modalOverlay =
    document.getElementById(
        "modalOverlay"
    );

const closeModal =
    document.getElementById(
        "closeModal"
    );

const personNameInput =
    document.getElementById(
        "personNameInput"
    );

const addPersonBtn =
    document.getElementById(
        "addPersonBtn"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const chatHeader =
    document.getElementById(
        "chatHeader"
    );

const headerAvatar =
    document.getElementById(
        "headerAvatar"
    );

const headerName =
    document.getElementById(
        "headerName"
    );

const welcomeScreen =
    document.getElementById(
        "welcomeScreen"
    );

const messagesElement =
    document.getElementById(
        "messages"
    );

const messageArea =
    document.getElementById(
        "messageArea"
    );

const messageInput =
    document.getElementById(
        "messageInput"
    );

const sendButton =
    document.getElementById(
        "sendButton"
    );

const emojiButton =
    document.getElementById(
        "emojiButton"
    );

const soundButton =
    document.getElementById(
        "soundButton"
    );

const soundIcon =
    document.getElementById(
        "soundIcon"
    );

const soundText =
    document.getElementById(
        "soundText"
    );

const toast =
    document.getElementById(
        "toast"
    );

const toastText =
    document.getElementById(
        "toastText"
    );


/* =========================================
   PROFİL ELEMENTLERİ
========================================= */

const profileButton =
    document.getElementById(
        "profileButton"
    );

const profileOverlay =
    document.getElementById(
        "profileOverlay"
    );

const closeProfile =
    document.getElementById(
        "closeProfile"
    );

const profileName =
    document.getElementById(
        "profileName"
    );

const profileAvatar =
    document.getElementById(
        "profileAvatar"
    );

const profileEditAvatar =
    document.getElementById(
        "profileEditAvatar"
    );

const profileNameInput =
    document.getElementById(
        "profileNameInput"
    );

const profilePhotoInput =
    document.getElementById(
        "profilePhotoInput"
    );

const removePhotoBtn =
    document.getElementById(
        "removePhotoBtn"
    );

const saveProfileBtn =
    document.getElementById(
        "saveProfileBtn"
    );


/* =========================================
   JSON YÜKLE
========================================= */

function loadJSON(key, fallback) {

    try {

        const value =
            localStorage.getItem(key);

        if (!value) {
            return fallback;
        }

        return JSON.parse(value);

    } catch (error) {

        console.error(
            "Veri yüklenemedi:",
            error
        );

        return fallback;
    }
}


/* =========================================
   VERİ KAYDET
========================================= */

function saveContacts() {

    localStorage.setItem(
        "chat_contacts",
        JSON.stringify(contacts)
    );
}


function saveMessages() {

    localStorage.setItem(
        "chat_messages",
        JSON.stringify(messages)
    );
}


function saveProfile() {

    localStorage.setItem(
        "chat_profile",
        JSON.stringify(profile)
    );
}


/* =========================================
   MODAL - YENİ KİŞİ
========================================= */

function openPersonModal() {

    modalOverlay.classList.add(
        "show"
    );

    personNameInput.value = "";

    setTimeout(
        () => personNameInput.focus(),
        100
    );
}


function closePersonModal() {

    modalOverlay.classList.remove(
        "show"
    );

    personNameInput.value = "";
}


newPersonBtn.addEventListener(
    "click",
    openPersonModal
);

emptyAddBtn.addEventListener(
    "click",
    openPersonModal
);

welcomeAddBtn.addEventListener(
    "click",
    openPersonModal
);

closeModal.addEventListener(
    "click",
    closePersonModal
);


modalOverlay.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            modalOverlay
        ) {

            closePersonModal();

        }

    }
);


/* =========================================
   YENİ KİŞİ EKLE
========================================= */

function addPerson() {

    const name =
        personNameInput.value.trim();


    if (!name) {

        showToast(
            "Lütfen kişi adını yaz."
        );

        personNameInput.focus();

        return;
    }


    const exists =
        contacts.some(
            contact =>
                contact.name
                    .toLocaleLowerCase(
                        "tr-TR"
                    ) ===
                name.toLocaleLowerCase(
                    "tr-TR"
                )
        );


    if (exists) {

        showToast(
            "Bu kişi zaten listede."
        );

        return;
    }


    const person = {

        id:
            Date.now().toString(36) +
            Math.random()
                .toString(36)
                .substring(2, 8),

        name: name,

        createdAt: Date.now()

    };


    contacts.push(person);

    messages[person.id] = [];


    saveContacts();

    saveMessages();


    closePersonModal();

    renderContacts();

    selectContact(
        person.id
    );


    showToast(
        `${name} eklendi.`
    );
}


addPersonBtn.addEventListener(
    "click",
    addPerson
);


personNameInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            addPerson();

        }

        if (
            event.key === "Escape"
        ) {

            closePersonModal();

        }

    }
);


/* =========================================
   KİŞİLERİ GÖSTER
========================================= */

function renderContacts() {

    const search =
        searchInput.value
            .trim()
            .toLocaleLowerCase(
                "tr-TR"
            );


    contactList.innerHTML = "";


    const filtered =
        contacts.filter(
            contact =>
                contact.name
                    .toLocaleLowerCase(
                        "tr-TR"
                    )
                    .includes(search)
        );


    if (
        contacts.length === 0
    ) {

        contactList.style.display =
            "none";

        emptyContacts.classList.add(
            "show"
        );

        return;
    }


    contactList.style.display =
        "block";

    emptyContacts.classList.remove(
        "show"
    );


    if (
        filtered.length === 0
    ) {

        contactList.innerHTML = `
            <div style="
                text-align:center;
                color:#858a94;
                padding:35px 15px;
                font-size:14px;
            ">
                Kişi bulunamadı
            </div>
        `;

        return;
    }


    filtered.forEach(
        contact => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "contact";


            if (
                selectedContact &&
                selectedContact.id ===
                contact.id
            ) {

                element.classList.add(
                    "active"
                );
            }


            const lastMessage =
                getLastMessage(
                    contact.id
                );


            element.innerHTML = `
                <div class="avatar">
                    ${escapeHtml(
                        getInitial(
                            contact.name
                        )
                    )}
                </div>

                <div class="contact-info">

                    <div class="contact-name">
                        ${escapeHtml(
                            contact.name
                        )}
                    </div>

                    <div class="contact-preview">
                        ${
                            lastMessage
                                ? escapeHtml(
                                    lastMessage.text
                                )
                                : "Yeni sohbet"
                        }
                    </div>

                </div>
            `;


            element.addEventListener(
                "click",
                () => {

                    selectContact(
                        contact.id
                    );

                }
            );


            contactList.appendChild(
                element
            );

        }
    );
}


/* =========================================
   KİŞİ SEÇ
========================================= */

function selectContact(id) {

    const contact =
        contacts.find(
            item =>
                item.id === id
        );


    if (!contact) {
        return;
    }


    selectedContact =
        contact;


    chatHeader.classList.remove(
        "hidden"
    );

    messagesElement.classList.remove(
        "hidden"
    );

    messageArea.classList.remove(
        "hidden"
    );

    welcomeScreen.classList.add(
        "hidden"
    );


    headerName.textContent =
        contact.name;


    headerAvatar.textContent =
        getInitial(
            contact.name
        );


    renderContacts();

    renderMessages();


    setTimeout(
        () => messageInput.focus(),
        50
    );
}


/* =========================================
   MESAJLARI GÖSTER
========================================= */

function renderMessages() {

    if (!selectedContact) {
        return;
    }


    const contactMessages =
        messages[
            selectedContact.id
        ] || [];


    messagesElement.innerHTML = "";


    if (
        contactMessages.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.style.margin =
            "auto";

        empty.style.textAlign =
            "center";

        empty.style.color =
            "#858a94";

        empty.style.fontSize =
            "14px";


        empty.textContent =
            "Henüz mesaj yok. İlk mesajı sen gönder.";


        messagesElement.appendChild(
            empty
        );

        return;
    }


    contactMessages.forEach(
        message => {

            addMessageToDOM(
                message
            );

        }
    );


    scrollMessages();
}


/* =========================================
   MESAJ DOM
========================================= */

function addMessageToDOM(
    message
) {

    const element =
        document.createElement(
            "div"
        );


    element.className =
        "message " +
        (
            message.sender === "me"
                ? "sent"
                : "received"
        );


    const time =
        new Date(
            message.time
        ).toLocaleTimeString(
            "tr-TR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    element.innerHTML = `
        ${escapeHtml(
            message.text
        )}

        <span class="message-time">
            ${time}
        </span>
    `;


    messagesElement.appendChild(
        element
    );
}


/* =========================================
   MESAJ GÖNDER
========================================= */

function sendMessage() {

    if (!selectedContact) {
        return;
    }


    const text =
        messageInput.value.trim();


    if (!text) {
        return;
    }


    if (
        !messages[
            selectedContact.id
        ]
    ) {

        messages[
            selectedContact.id
        ] = [];

    }


    const message = {

        id:
            Date.now().toString(),

        text: text,

        sender: "me",

        time: Date.now()

    };


    messages[
        selectedContact.id
    ].push(message);


    saveMessages();


    addMessageToDOM(
        message
    );


    messageInput.value = "";

    resizeTextarea();

    scrollMessages();

    renderContacts();


    playSendSound();
}


sendButton.addEventListener(
    "click",
    sendMessage
);


/* =========================================
   ENTER İLE GÖNDER
========================================= */

messageInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


/* =========================================
   TEXTAREA
========================================= */

function resizeTextarea() {

    messageInput.style.height =
        "auto";


    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            140
        ) + "px";
}


messageInput.addEventListener(
    "input",
    resizeTextarea
);


/* =========================================
   ARAMA
========================================= */

searchInput.addEventListener(
    "input",
    renderContacts
);


/* =========================================
   EMOJI
========================================= */

emojiButton.addEventListener(
    "click",
    () => {

        const emojis = [
            "😀",
            "😂",
            "❤️",
            "👍",
            "😊",
            "🔥",
            "🎉",
            "😍",
            "😎",
            "👏"
        ];


        const emoji =
            emojis[
                Math.floor(
                    Math.random() *
                    emojis.length
                )
            ];


        insertTextAtCursor(
            messageInput,
            emoji
        );

        resizeTextarea();

        messageInput.focus();

    }
);


function insertTextAtCursor(
    input,
    text
) {

    const start =
        input.selectionStart;

    const end =
        input.selectionEnd;


    input.value =
        input.value.substring(
            0,
            start
        ) +
        text +
        input.value.substring(
            end
        );


    input.selectionStart =
        input.selectionEnd =
            start + text.length;
}


/* =========================================
   SES
========================================= */

let audioContext = null;


function getAudioContext() {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }


    if (
        audioContext.state ===
        "suspended"
    ) {

        audioContext.resume();

    }


    return audioContext;
}


function createTone(
    frequency,
    duration,
    volume
) {

    if (!soundEnabled) {
        return;
    }


    const ctx =
        getAudioContext();


    const now =
        ctx.currentTime;


    const oscillator =
        ctx.createOscillator();


    const gain =
        ctx.createGain();


    oscillator.type =
        "sine";


    oscillator.frequency.setValueAtTime(
        frequency,
        now
    );


    gain.gain.setValueAtTime(
        0.0001,
        now
    );


    gain.gain.exponentialRampToValueAtTime(
        volume,
        now + 0.01
    );


    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + duration
    );


    oscillator.connect(
        gain
    );

    gain.connect(
        ctx.destination
    );


    oscillator.start(now);

    oscillator.stop(
        now + duration + 0.02
    );
}


function playSendSound() {

    createTone(
        620,
        0.11,
        0.045
    );

}


function playReceiveSound() {

    if (!soundEnabled) {
        return;
    }


    createTone(
        740,
        0.12,
        0.07
    );


    setTimeout(
        () => {

            createTone(
                980,
                0.16,
                0.055
            );

        },
        70
    );
}


/* =========================================
   SES AÇ / KAPAT
========================================= */

function updateSoundUI() {

    if (soundEnabled) {

        soundIcon.textContent =
            "🔊";

        soundText.textContent =
            "Ses Açık";

    } else {

        soundIcon.textContent =
            "🔇";

        soundText.textContent =
            "Ses Kapalı";

    }
}


soundButton.addEventListener(
    "click",
    () => {

        soundEnabled =
            !soundEnabled;


        localStorage.setItem(
            "chat_sound",
            soundEnabled
        );


        updateSoundUI();


        if (soundEnabled) {

            playSendSound();

        }

    }
);


/* =========================================
   PROFİL
========================================= */

function getProfileInitial() {

    if (
        !profile.name ||
        !profile.name.trim()
    ) {

        return "?";
    }


    return profile.name
        .trim()
        .charAt(0)
        .toLocaleUpperCase(
            "tr-TR"
        );
}


function updateProfileUI() {

    const name =
        profile.name.trim();


    profileName.textContent =
        name || "Profil oluştur";


    if (profile.photo) {

        profileAvatar.innerHTML = `
            <img
                src="${profile.photo}"
                alt="Profil fotoğrafı"
            >
        `;

        profileEditAvatar.innerHTML = `
            <img
                src="${profile.photo}"
                alt="Profil fotoğrafı"
            >
        `;

    } else {

        profileAvatar.textContent =
            getProfileInitial();

        profileEditAvatar.textContent =
            getProfileInitial();

    }
}


/* =========================================
   PROFİL AÇ
========================================= */

profileButton.addEventListener(
    "click",
    () => {

        profileNameInput.value =
            profile.name;


        updateProfileUI();


        profileOverlay.classList.add(
            "show"
        );


        setTimeout(
            () =>
                profileNameInput.focus(),
            100
        );

    }
);


/* =========================================
   PROFİL KAPAT
========================================= */

function closeProfileWindow() {

    profileOverlay.classList.remove(
        "show"
    );

}


closeProfile.addEventListener(
    "click",
    closeProfileWindow
);


profileOverlay.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            profileOverlay
        ) {

            closeProfileWindow();

        }

    }
);


/* =========================================
   PROFİL FOTOĞRAFI
========================================= */

profilePhotoInput.addEventListener(
    "change",
    event => {

        const file =
            event.target.files[0];


        if (!file) {
            return;
        }


        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            showToast(
                "Lütfen bir fotoğraf seç."
            );

            return;
        }


        if (
            file.size >
            5 * 1024 * 1024
        ) {

            showToast(
                "Fotoğraf 5 MB'dan küçük olmalı."
            );

            profilePhotoInput.value =
                "";

            return;
        }


        const reader =
            new FileReader();


        reader.onload = () => {

            profile.photo =
                reader.result;


            updateProfileUI();


            showToast(
                "Fotoğraf seçildi."
            );

        };


        reader.readAsDataURL(
            file
        );

    }
);


/* =========================================
   FOTOĞRAF KALDIR
========================================= */

removePhotoBtn.addEventListener(
    "click",
    () => {

        profile.photo = "";

        profilePhotoInput.value =
            "";

        updateProfileUI();

        showToast(
            "Profil fotoğrafı kaldırıldı."
        );

    }
);


/* =========================================
   PROFİL KAYDET
========================================= */

function saveProfileChanges() {

    const name =
        profileNameInput.value.trim();


    if (!name) {

        showToast(
            "Lütfen adını yaz."
        );

        profileNameInput.focus();

        return;
    }


    profile.name =
        name;


    saveProfile();

    updateProfileUI();

    closeProfileWindow();


    showToast(
        "Profil güncellendi."
    );
}


saveProfileBtn.addEventListener(
    "click",
    saveProfileChanges
);


profileNameInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            saveProfileChanges();

        }


        if (
            event.key === "Escape"
        ) {

            closeProfileWindow();

        }

    }
);


/* =========================================
   GERÇEK YENİ MESAJ İÇİN HAZIR FONKSİYON
========================================= */

function receiveMessage(
    contactId,
    text
) {

    const contact =
        contacts.find(
            item =>
                item.id ===
                contactId
        );


    if (!contact) {
        return;
    }


    if (
        !messages[contactId]
    ) {

        messages[contactId] =
            [];

    }


    const message = {

        id:
            Date.now().toString(),

        text: text,

        sender: "other",

        time: Date.now()

    };


    messages[
        contactId
    ].push(message);


    saveMessages();


    if (
        selectedContact &&
        selectedContact.id ===
        contactId
    ) {

        addMessageToDOM(
            message
        );

        scrollMessages();

    }


    renderContacts();


    playReceiveSound();
}


/* =========================================
   YARDIMCILAR
========================================= */

function getInitial(name) {

    const clean =
        name.trim();


    if (!clean) {
        return "?";
    }


    return clean
        .charAt(0)
        .toLocaleUpperCase(
            "tr-TR"
        );
}


function getLastMessage(id) {

    const list =
        messages[id] || [];


    if (!list.length) {
        return null;
    }


    return list[
        list.length - 1
    ];
}


function scrollMessages() {

    requestAnimationFrame(
        () => {

            messagesElement.scrollTop =
                messagesElement.scrollHeight;

        }
    );
}


function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;
}


function showToast(text) {

    toastText.textContent =
        text;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        showToast.timer
    );


    showToast.timer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );
}


/* =========================================
   BAŞLANGIÇ
========================================= */

updateSoundUI();

updateProfileUI();

renderContacts();