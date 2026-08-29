const express = require("express");

const http = require("http");

const path = require("path");

const fs = require("fs");

const {
    Server
} = require("socket.io");


/* =========================
   EXPRESS
========================= */

const app =
    express();


const server =
    http.createServer(
        app
    );


const io =
    new Server(
        server,
        {
            maxHttpBufferSize:
                10e6
        }
    );


/* =========================
   DOSYALAR
========================= */

app.use(
    express.static(
        path.join(
            __dirname
        )
    )
);


app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "index.html"
            )
        );

    }
);


/* =========================
   MESAJ VERİTABANI
========================= */

const databaseFile =
    path.join(
        __dirname,
        "messages.json"
    );


let messageDatabase = {};


function loadMessages() {

    try {

        if (
            fs.existsSync(
                databaseFile
            )
        ) {

            const data =
                fs.readFileSync(
                    databaseFile,
                    "utf8"
                );


            messageDatabase =
                JSON.parse(
                    data
                ) || {};

        }

    } catch (error) {

        console.error(
            "Mesaj geçmişi okunamadı:",
            error
        );

        messageDatabase = {};

    }

}


function saveMessages() {

    try {

        fs.writeFileSync(
            databaseFile,
            JSON.stringify(
                messageDatabase,
                null,
                2
            ),
            "utf8"
        );

    } catch (error) {

        console.error(
            "Mesaj geçmişi kaydedilemedi:",
            error
        );

    }

}


loadMessages();


/* =========================
   KULLANICILAR
========================= */

const users =
    new Map();


/* =========================
   SOHBET ID
========================= */

function createChatId(
    user1,
    user2
) {

    return [
        user1,
        user2
    ]
        .sort(
            (a, b) =>
                a.localeCompare(
                    b
                )
        )
        .join(
            "__"
        );

}


/* =========================
   MESAJI KAYDET
========================= */

function saveMessage(
    message
) {

    const chatId =
        createChatId(
            message.sender,
            message.receiver
        );


    if (
        !messageDatabase[chatId]
    ) {

        messageDatabase[chatId] =
            [];

    }


    messageDatabase[chatId].push(
        message
    );


    /*
       Çok büyük bir geçmiş oluşmasını
       engellemek için son 500 mesaj.
    */

    if (
        messageDatabase[chatId]
            .length > 500
    ) {

        messageDatabase[chatId] =
            messageDatabase[chatId]
                .slice(
                    -500
                );

    }


    saveMessages();

}


/* =========================
   KULLANICININ CHAT GEÇMİŞİ
========================= */

function getUserHistory(
    username
) {

    const history = {};


    Object.entries(
        messageDatabase
    ).forEach(
        ([chatId, messages]) => {

            const relevantMessages =
                messages.filter(
                    message =>
                        message.sender ===
                            username ||
                        message.receiver ===
                            username
                );


            if (
                relevantMessages.length === 0
            ) {

                return;

            }


            const otherUsers =
                relevantMessages
                    .map(
                        message =>
                            message.sender ===
                            username
                                ? message.receiver
                                : message.sender
                    );


            const other =
                otherUsers[0];


            if (
                other
            ) {

                history[other] =
                    relevantMessages;

            }

        }
    );


    return history;

}


/* =========================
   ONLINE KULLANICILAR
========================= */

function broadcastOnlineUsers() {

    const usersList =
        Array.from(
            users.keys()
        );


    io.emit(
        "online_users",
        usersList
    );

}


/* =========================
   SOCKET
========================= */

io.on(
    "connection",
    socket => {

        console.log(
            "Bağlantı:",
            socket.id
        );


        /* =====================
           REGISTER
        ===================== */

        socket.on(
            "register",
            username => {

                if (
                    !username
                ) {

                    return;

                }


                const cleanName =
                    String(
                        username
                    )
                        .trim()
                        .substring(
                            0,
                            20
                        );


                if (
                    !cleanName
                ) {

                    return;

                }


                /*
                   Aynı kullanıcı adına
                   sahip eski bağlantıyı
                   kapatmıyoruz; son bağlantı
                   aktif kabul edilir.
                */

                users.set(
                    cleanName,
                    socket.id
                );


                socket.username =
                    cleanName;


                console.log(
                    `${cleanName} bağlandı.`
                );


                /*
                   Kullanıcının geçmişini
                   gönder.
                */

                socket.emit(
                    "chat_history",
                    getUserHistory(
                        cleanName
                    )
                );


                broadcastOnlineUsers();

            }
        );


        /* =====================
           YENİ SOHBET
        ===================== */

        socket.on(
            "start_chat",
            data => {

                if (
                    !data ||
                    !data.from ||
                    !data.to
                ) {

                    return;

                }


                const targetSocket =
                    users.get(
                        data.to
                    );


                if (
                    targetSocket
                ) {

                    io.to(
                        targetSocket
                    ).emit(
                        "chat_started",
                        {
                            from:
                                data.from
                        }
                    );

                }

            }
        );


        /* =====================
           MESAJ
        ===================== */

        socket.on(
            "private_message",
            message => {

                if (
                    !message ||
                    !message.sender ||
                    !message.receiver
                ) {

                    return;

                }


                if (
                    !message.text &&
                    !message.audio
                ) {

                    return;

                }


                /*
                   Mesajı kaydet.
                */

                saveMessage(
                    message
                );


                /*
                   Alıcıya gönder.
                */

                const targetSocket =
                    users.get(
                        message.receiver
                    );


                if (
                    targetSocket
                ) {

                    io.to(
                        targetSocket
                    ).emit(
                        "private_message",
                        message
                    );

                }


                console.log(
                    `${message.sender} -> ${message.receiver}`
                );

            }
        );


        /* =====================
           TYPING
        ===================== */

        socket.on(
            "typing",
            data => {

                if (
                    !data ||
                    !data.to ||
                    !data.from
                ) {

                    return;

                }


                const targetSocket =
                    users.get(
                        data.to
                    );


                if (
                    targetSocket
                ) {

                    io.to(
                        targetSocket
                    ).emit(
                        "typing",
                        {
                            from:
                                data.from
                        }
                    );

                }

            }
        );


        /* =====================
           STOP TYPING
        ===================== */

        socket.on(
            "stop_typing",
            data => {

                if (
                    !data ||
                    !data.to ||
                    !data.from
                ) {

                    return;

                }


                const targetSocket =
                    users.get(
                        data.to
                    );


                if (
                    targetSocket
                ) {

                    io.to(
                        targetSocket
                    ).emit(
                        "stop_typing",
                        {
                            from:
                                data.from
                        }
                    );

                }

            }
        );


        /* =====================
           WEBRTC CALL OFFER
        ===================== */

        socket.on(
            "call_offer",
            data => {

                if (
                    !data ||
                    !data.to ||
                    !data.from ||
                    !data.offer
                ) {

                    return;

                }


                const targetSocket =
                    users.get(
                        data.to
                    );


                if (
                    targetSocket
                ) {

                    io.to(
                        targetSocket
                    ).emit(
                        "call_offer",
                        {
                            from:
                                data.from,

                            type:
                                data.type,

                            offer:
                                data.offer
                        }
                    );

                }

            }
        );


        /* =====================
           WEBRTC ANSWER
        ===================== */

        socket.on(
            "call_answer",
            data => {

                if (
                    !data ||
                    !data.to ||
                    !data.from ||
                    !data.answer
                ) {

                    return;

                }


                const targetSocket =
                    users.get(
                        data.to
                    );


                if (
                    targetSocket
                ) {

                    io.to(
                        targetSocket
                    ).emit(
                        "call_answer",
                        {
                            from:
                                data.from,

                            answer:
                                data.answer
                        }
                    );

                }

            }
        );


        /* =====================
           ICE
        ===================== */

        socket.on(
            "ice_candidate",
            data => {

                if (
                    !data ||
                    !data.to ||
                    !data.candidate
                ) {

                    return;

                }


                const targetSocket =
                    users.get(
                        data.to
                    );


                if (
                    targetSocket
                ) {

                    io.to(
                        targetSocket
                    ).emit(
                        "ice_candidate",
                        {
                            from:
                                data.from,

                            candidate:
                                data.candidate
                        }
                    );

                }

            }
        );


        /* =====================
           CALL END
        ===================== */

        socket.on(
            "call_end",
            data => {

                if (
                    !data ||
                    !data.to
                ) {

                    return;

                }


                const targetSocket =
                    users.get(
                        data.to
                    );


                if (
                    targetSocket
                ) {

                    io.to(
                        targetSocket
                    ).emit(
                        "call_end",
                        {
                            from:
                                data.from
                        }
                    );

                }

            }
        );


        /* =====================
           CALL REJECTED
        ===================== */

        socket.on(
            "call_rejected",
            data => {

                if (
                    !data ||
                    !data.to
                ) {

                    return;

                }


                const targetSocket =
                    users.get(
                        data.to
                    );


                if (
                    targetSocket
                ) {

                    io.to(
                        targetSocket
                    ).emit(
                        "call_rejected",
                        {
                            from:
                                data.from
                        }
                    );

                }

            }
        );


        /* =====================
           DISCONNECT
        ===================== */

        socket.on(
            "disconnect",
            () => {

                if (
                    socket.username
                ) {

                    /*
                       Eğer kullanıcı hâlâ
                       bu socket ile kayıtlıysa
                       sil.
                    */

                    if (
                        users.get(
                            socket.username
                        ) ===
                        socket.id
                    ) {

                        users.delete(
                            socket.username
                        );

                    }


                    console.log(
                        `${socket.username} ayrıldı.`
                    );


                    broadcastOnlineUsers();

                }

            }
        );

    }
);


/* =========================
   SERVER
========================= */

const PORT =
    process.env.PORT ||
    3000;


server.listen(
    PORT,
    () => {

        console.log(
            "================================"
        );

        console.log(
            "       ChatApp çalışıyor"
        );

        console.log(
            "================================"
        );

        console.log(
            `http://localhost:${PORT}`
        );

        console.log(
            "================================"
        );

    }
);