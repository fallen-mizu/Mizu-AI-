import { 
    makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion 
} from "@whiskeysockets/baileys";
import pino from "pino";
import { settings } from "./settings.js";
import { messageHandler } from "./handler.js";

/**
 * Fungsi utama untuk menjalankan Bot Mizu
 */
async function startBot() {
    // Mengelola autentikasi (sesi)
    const { state, saveCreds } = await useMultiFileAuthState('sessions');
    
    // Mengambil versi WA terbaru
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: ["Mac OS", "Chrome", "121.0.6167.184"],
        patchMessageBeforeSending: (message) => {
            const requiresPatch = !!(
                message.buttonsMessage ||
                message.templateMessage ||
                message.listMessage
            );
            if (requiresPatch) {
                message = {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadata: {},
                                deviceListMetadataVersion: 2,
                            },
                            ...message,
                        },
                    },
                };
            }
            return message;
        },
    });

    // Logika Pairing Code Otomatis
    if (!sock.authState.creds.registered) {
        const phoneNumber = settings.botNumber.replace(/[^0-9]/g, '');
        
        if (!phoneNumber) {
            console.error("\x1b[31m[ERROR] Nomor bot belum diisi di settings.js!\x1b[0m");
            process.exit(1);
        }

        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log(`\n\x1b[33m+------------------------------+\x1b[0m`);
                console.log(`\x1b[33m|\x1b[0m \x1b[32mPAIRING CODE: ${code}\x1b[0m      \x1b[33m|\x1b[0m`);
                console.log(`\x1b[33m+------------------------------+\x1b[0m\n`);
            } catch (err) {
                console.error("\x1b[31m[ERROR] Gagal mendapatkan pairing code.\x1b[0m");
            }
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = reason !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log("[SYSTEM] Koneksi terputus, mencoba hubungkan kembali...");
                startBot();
            } else {
                console.error("[CRITICAL] Sesi keluar. Hapus folder sessions.");
            }
        } else if (connection === 'open') {
            console.log(`\n\x1b[36m[SUCCESS] ${settings.botName} Online!\x1b[0m`);
            console.log(`\x1b[36m[INFO] Menunggu pesan baru...\x1b[0m\n`);
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m) return;
        await messageHandler(sock, m);
    });
} // <--- SEBELUMNYA KURUNG INI HILANG

// Jalankan sistem
startBot().catch(err => console.error("[FATAL ERROR]", err));