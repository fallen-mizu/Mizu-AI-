import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * Fitur Ping & Server Info (Auto Location & Disk)
 * Trigger: "/ping"
 * Creator: Fallen (Steven Immanuel)
 */
export async function pingPlugin(sock, m, body) {
    const remoteJid = m.key.remoteJid;
    const lowerBody = body.toLowerCase().trim();
    
    // Trigger baru: hanya merespons jika pesannya tepat "/ping"
    if (lowerBody !== "/ping") return false;

    try {
        const start = Date.now();
        
        // --- LOGIKA LOKASI (Auto Detect via IP) ---
        let location = "Searching...";
        try {
            const locRes = await fetch("http://ip-api.com/json/");
            const locJson = await locRes.json();
            if (locJson.status === "success") {
                location = `${locJson.city}, ${locJson.country} ${locJson.countryCode === 'JP' ? '🇯🇵' : '🌐'}`;
            }
        } catch (locErr) {
            console.error("Gagal ambil lokasi:", locErr);
            location = "Osaka, Japan (Manual)"; // Fallback ke lokasi Steven
        }

        // --- LOGIKA RAM ---
        const totalMem = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
        const freeMem = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
        const usedMem = (totalMem - freeMem).toFixed(2);

        // --- LOGIKA CPU ---
        const cpuModel = os.cpus()[0].model;
        const cpuCount = os.cpus().length;

        // --- LOGIKA DISK ---
        let diskInfo = "Unknown";
        try {
            const { stdout } = await execPromise("df -h / | awk 'NR==2 {print $3 \" / \" $2 \" (\" $5 \")\"}'");
            diskInfo = stdout.trim();
        } catch (diskErr) {
            diskInfo = "Error reading disk";
        }

        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const latency = Date.now() - start;

        const responseText = `
*📡 MIZU SERVER STATUS*
----------------------------------------
🚀 *Latency:* ${latency} ms
📍 *Location:* ${location}
⏱️ *Uptime:* ${hours}h ${minutes}m

💻 *System Info:*
- *CPU:* ${cpuCount}x ${cpuModel}
- *RAM:* ${usedMem}GB / ${totalMem}GB
- *OS:* ${os.type()} (${os.release()})

📦 *Storage:*
- *Disk:* ${diskInfo}
----------------------------------------
`;

        await sock.sendMessage(remoteJid, { text: responseText.trim() }, { quoted: m });
        return true;
    } catch (e) {
        console.error("Ping Error:", e);
        return false;
    }
}