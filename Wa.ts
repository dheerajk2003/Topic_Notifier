import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  jidNormalizedUser
} from 'baileys';
import { delay } from 'baileys/lib/Utils/index.js';

export default async function start(message: string) {
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
      const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== 401;
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

  async function sendMessage(messageText: string) {
    if (!isConnected) {
      console.log("Waiting for connection...");
      return;
    }

    try {
      // 👇 Your message details
      const number = "91lskfakl;j"; // <-- Replace with recipient number (in international format)
      const jid = jidNormalizedUser(number + "@s.whatsapp.net");

      // Send a message
      await sock.sendMessage(jid, {
        text: messageText
      });

      console.log("✅ Message sent!");
      process.exit(0); // Exit program after message is sent
    } catch (error) {
      console.error("Error sending message:", error);
      process.exit(1); // Exit with error code
    }
  }
} 