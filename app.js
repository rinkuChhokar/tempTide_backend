const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
require("dotenv").config();
const { spawn } = require('child_process');

function runCurl(url, options = {}) {
    return new Promise((resolve, reject) => {
        const args = ['-s', url];
        if (options.method) {
            args.push('-X', options.method);
        }
        if (options.headers) {
            for (const [key, value] of Object.entries(options.headers)) {
                args.push('-H', `${key}: ${value}`);
            }
        }
        if (options.body) {
            args.push('-d', options.body);
        }

        // Use 'curl.exe' on Windows, 'curl' on Linux/Unix
        const curlCommand = process.platform === 'win32' ? 'curl.exe' : 'curl';
        const child = spawn(curlCommand, args);

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Curl exited with code ${code}: ${stderr}`));
            } else {
                resolve({
                    ok: true,
                    status: 200,
                    statusText: "OK",
                    json: async () => {
                        try {
                            return JSON.parse(stdout);
                        } catch (e) {
                            throw new Error(`Failed to parse JSON: ${e.message}. Output: ${stdout}`);
                        }
                    },
                    text: async () => stdout
                });
            }
        });
    });
}

const app = express();
app.use(cors());

const server = http.createServer(app);

// Socket.io with CORS configuration
const io = socketIo(server, {
    cors: {
        origin: ["https://temptide-ten.vercel.app", "http://localhost:5173"],  // Allow requests from the frontend domain
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
        runCurl("https://web2.temp-mail.org/messages", {
            "headers": {
                "authorization": `Bearer ${token}`,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://temp-mail.org/"
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
        runCurl("https://web2.temp-mail.org/mailbox", {
            "headers": {
                "content-type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://temp-mail.org/"
            },
            "body": JSON.stringify({}),
            "method": "POST"
        })
            .then((res) => {
                console.log(res);
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
        runCurl("https://web2.temp-mail.org/mailbox", {
            "headers": {
                "authorization": `Bearer ${token}`,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://temp-mail.org/"
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
        runCurl("https://web2.temp-mail.org/messages", {
            "headers": {
                "authorization": `Bearer ${token}`,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://temp-mail.org/"
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
        runCurl(`https://web2.temp-mail.org/messages/${messageId}`, {
            "headers": {
                "authorization": `Bearer ${token}`,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://temp-mail.org/"
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