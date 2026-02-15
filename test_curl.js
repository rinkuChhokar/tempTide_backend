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

        const child = spawn('curl.exe', args);

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

// Test Call
// console.log("Testing POST to web2.temp-mail.org/mailbox...");
runCurl("https://web2.temp-mail.org/mailbox", {
    method: 'POST',
    headers: {
        "content-type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://temp-mail.org/"
    },
    body: JSON.stringify({})
}).then(async (res) => {
    console.log("Status:", res.status);
    const data = await res.json();
    // console.log("Data:", data);
}).catch(err => {
    console.error("Error:", err);
});
