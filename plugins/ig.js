/**
 * Fitur Instagram Downloader (Video Only)
 * Trigger: "/ig [link]"
 * Creator: Fallen (Steven Immanuel)
 */
export async function instagramPlugin(sock, m, body) {
    const remoteJid = m.key.remoteJid;
    const lowerBody = body.toLowerCase().trim();
    
    // Mizu cuma peka kalau diawali /ig sekarang!
    if (!lowerBody.startsWith("/ig")) return false;

    // Regex tajam untuk mencari link Instagram
    const igRegex = /(https?:\/\/(?:www\.)?instagram\.com\/(?:p|reels|reel|tv)\/([^/?#&]+))/gi;
    const match = body.match(igRegex);

    if (!match) {
        await sock.sendMessage(remoteJid, { text: "Hmph! Mana link Instagram-nya? Baka! 😤" }, { quoted: m });
        return true;
    }

    const url = match[0];

    try {
        await sock.sendMessage(remoteJid, { text: "Tunggu sebentar, Mizu lagi ambilin videonya dari Instagram buat kamu... Hmph!" }, { quoted: m });
        
        // Fetch ke API Zenzxz
        const response = await fetch(`https://api.zenzxz.my.id/download/instagram?url=${encodeURIComponent(url)}`);
        const json = await response.json();

        if (json.status && json.result) {
            const data = json.result;

            // Kirim sebagai Video saja
            await sock.sendMessage(remoteJid, { 
                video: { url: data.url }, 
                caption: `📌 *Username:* ${data.username}\n📝 *Caption:* ${data.caption ? data.caption.substring(0, 150) : '-'}\n\n`,
                mimetype: 'video/mp4'
            }, { quoted: m });
            
        } else {
            throw new Error("Respon API tidak valid");
        }

        return true;
    } catch (e) {
        console.error("IG Plugin Error:", e);
        await sock.sendMessage(remoteJid, { text: "Duh, Mizu gagal download videonya. Mungkin link-nya privat atau API-nya lagi mogok! Hmph!" }, { quoted: m });
        return true;
    }
}