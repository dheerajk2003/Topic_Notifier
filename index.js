require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");
const {
    makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    jidNormalizedUser
} = require('baileys');
const removeMd = require('remove-markdown');

const input = ["dbms/sql",
    "os",
    "computer networks",
    "dsa",
    "oops java",
    "ai/ml",
    "llms/transformers",
    "devops/docker/vms",
    "react.js",
    "node.js/express.js",
    "any random (not first) leetcode problem"];

async function start(message) {
    // Use a simple file-based auth state (stores session info)
    const { state, saveCreds } = await useMultiFileAuthState("auth");

    // Fetch the latest version of WhatsApp Web
    const { version } = await fetchLatestBaileysVersion();

    // Create the WhatsApp socket
    const sock = makeWASocket({
        version,
        auth: state,
    });

    let isConnected = false;

    // Listen for connection update
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Handle QR code
        if (qr) {
            console.log("QR Code received:", qr);
            // You can display this QR code in your preferred way
            // For example, save it to a file or display it in a web interface
        }

        if (connection === "close") {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== 401;
            console.log("connection closed due to", lastDisconnect?.error, ", reconnecting", shouldReconnect);
            if (shouldReconnect) start(message);
        } else if (connection === "open") {
            console.log("✅ Connection opened");
            isConnected = true;

            // Send message only after connection is established
            sendMessage(message);
        }
    });

    // Listen for credentials update
    sock.ev.on("creds.update", saveCreds);

    async function sendMessage(message) {
        if (!isConnected) {
            console.log("Waiting for connection...");
            return;
        }

        try {
            // 👇 Your message details
            const number = "918000810425"; // <-- Replace with recipient number (in international format)
            const jid = jidNormalizedUser(number + "@s.whatsapp.net");

            // Send a message
            await sock.sendMessage(jid, {
                text: message
            });

            console.log("✅ Message sent!");
            process.exit(0);
        } catch (error) {
            console.error("Error sending message:", error);
            process.exit(1);
        }
    }
}

async function GetTopic(topic) {
    const api = process.env.GEMINI_API_KEY;
    if (!api) {
        console.log("api key not found");
        return undefined;
    }
    const ai = new GoogleGenAI({ apiKey: api });

    const prompt = "You are a revision bot , whose job is to revise any random subtopic from the given topic with example to a college student , so that he is prepared when placements come , you need to present the data in a way so that its understandable and provides easy understanding to student with brief explainations and examples. for choosing any topic for given topic search any college curriculum or website and revise different subtopic every time. \n The topic for which you need to give revision content is " + topic + "dont give unecessary description like (i am your revision bot ,you are aspiring....) , etc";

    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    return result.text;
}

async function main(){
    try{
        const choice = input[Math.floor(Math.random() * input.length)];
        const result = await GetTopic(choice);
        if (result){
            const text = removeMd(result.toString());
            start(text);
        }
    }
    catch(error){
        console.error(error);
    }
}

main();