const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
require("dotenv").config();

const app = express();
app.use(cors());

const server = http.createServer(app);

// Socket.io with CORS configuration
const io = socketIo(server, {
    cors: {
        origin: "https://temptide-ten.vercel.app",  // Allow requests from the frontend domain
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true  // Allow credentials if needed
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    // Example of sending a message to the client
    socket.emit('message', 'Welcome to the socket server!');

    // Listening to a custom event from the client
    socket.on('fetchMessages', (token) => {
        // console.log('Received message:', token);
        fetch("https://web2.temp-mail.org/messages", {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9",
                "authorization": `Bearer ${token}`,
                "priority": "u=1, i",
                "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Google Chrome\";v=\"132\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "Referer": "https://temp-mail.org/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": null,
            "method": "GET"
        })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                // console.log(data);
                // Sort the messages in descending order by receivedAt timestamp
                data.messages.sort((a, b) => b.receivedAt - a.receivedAt);
                io.emit('responseOfFetchMessage', {
                    status: "success",
                    message: "Fetched messages successfully!",
                    data: data
                });
            })
            .catch((err) => {
                console.log(err);
                io.emit('responseOfFetchMessage', {
                    status: "error",
                    message: "Error occured!",
                });
            })
        //     // Send message to all connected clients
    });
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get("/", (req, res) => {
    try {
        return res.status(200).json({
            status: "success",
            message: "running!!"
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error
        });
    }
});

// API endpoint for fetching new email id
app.get("/api/v1/fetch-new-email-id", (req, res) => {
    try {
        fetch("https://web2.temp-mail.org/mailbox", {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/json",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Google Chrome\";v=\"132\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "Referer": "https://temp-mail.org/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": null,
            "method": "POST"
        })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                // console.log(data);
                return res.status(200).json({
                    status: "success",
                    message: "New mail id fetched successfully!",
                    data: data
                });
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Error occured!",
                });
            })
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error occured!",
        });
    }
});

// API endpoint for refresh email id
app.post("/api/v1/refresh-email-id", (req, res) => {
    try {
        let { token } = req.body;
        fetch("https://web2.temp-mail.org/mailbox", {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9",
                "authorization": `Bearer ${token}`,
                "priority": "u=1, i",
                "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Google Chrome\";v=\"132\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "Referer": "https://temp-mail.org/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": null,
            "method": "GET"
        })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                // console.log(data);
                return res.status(200).json({
                    status: "success",
                    message: "Refresh mail successfully!",
                    data: data
                });
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Error occured!",
                });
            })
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error occured!",
        });
    }
});

// API endpoint for fetching messages
app.post("/api/v1/fetch-messages", (req, res) => {
    try {
        let { token } = req.body;
        fetch("https://web2.temp-mail.org/messages", {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9",
                "authorization": `Bearer ${token}`,
                "priority": "u=1, i",
                "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Google Chrome\";v=\"132\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "Referer": "https://temp-mail.org/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": null,
            "method": "GET"
        })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                // console.log(data);
                // Sort the messages in descending order by receivedAt timestamp
                data.messages.sort((a, b) => b.receivedAt - a.receivedAt);

                return res.status(200).json({
                    status: "success",
                    message: "Fetched messages successfully!",
                    data: data
                });
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Error occured!",
                });
            })
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error occured!",
        });
    }
});


app.post("/api/v1/fetch-message-detail", (req, res) => {
    try {
        let { token, messageId } = req.body;
        fetch(`https://web2.temp-mail.org/messages/${messageId}`, {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9",
                "authorization": `Bearer ${token}`,
                "priority": "u=1, i",
                "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Google Chrome\";v=\"132\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "Referer": "https://temp-mail.org/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": null,
            "method": "GET"
        })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                // console.log(data);
                return res.status(200).json({
                    status: "success",
                    message: "Fetched message detail successfully!",
                    data: data
                });
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json({
                    status: "error",
                    message: "Error occured!",
                });
            })
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error occured!",
        });
    }
});





server.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running at PORT-${process.env.PORT || 5000}`);

})