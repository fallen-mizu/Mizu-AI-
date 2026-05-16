import { settings } from "../settings.js";
/**
 * Fitur Owner Info & vCard (Updated with Email & Location)
 * Creator: Fallen (Steven Immanuel)
 */
export async function ownerPlugin(sock, m, body) {
    const remoteJid = m.key.remoteJid;
    const lowerBody = body.toLowerCase();
    
    const ownerKeywords = ["siapa owner", "owner mizu", "siapa penciptamu", "siapa bosmu", "/owner"];
    if (!ownerKeywords.some(k => lowerBody.includes(k))) return false;

    try {
        const ownerNumber = settings.ownerNumber; 
        const ownerName = settings.ownerName;

        // vCard yang lebih lengkap dan formal
        const vcard = 'BEGIN:VCARD\n' 
                    + 'VERSION:3.0\n' 
                    + `FN:${ownerName}\n` 
                    + `ORG:PT. Zen;Technology & Information Services\n` 
                    + `TITLE:CEO & Owner\n`
                    + `EMAIL;type=INTERNET;type=WORK;type=pref:fallen-mizu@proton.me\n` // Email baru kamu
                    + `TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}\n` 
                    + `ADR;type=WORK;charset=UTF-8:;;Osaka;Osaka;Japan;541-0051;Japan\n` // Lokasi detail Osaka
                    + `URL;type=WORK:https://fallen-mizu.vercel.app\n` // Website portofolio kamu
                    + 'END:VCARD';

        await sock.sendMessage(remoteJid, { 
            text: `Hmph! Ini adalah informasi kontak resmi dari bos besar Mizu, *${ownerName}*! 😤\n\n` 
        }, { quoted: m });

        await sock.sendMessage(remoteJid, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        }, { quoted: m });

        return true;
    } catch (e) {
        console.error("Owner Plugin Error:", e);
        return false;
    }
}