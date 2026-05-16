/**
 * Fitur MediaFire Downloader (Fix BIN format)
 * Creator: Fallen (Steven Immanuel)
 */
export async function mediafirePlugin(sock, m, body) {
    const remoteJid = m.key.remoteJid;
    const lowerBody = body.toLowerCase();
    
    if (!lowerBody.startsWith("/mediafire")) return false;

    // Regex lebih pintar untuk menangkap link tanpa https
    const mfRegex = /((https?:\/\/)?(www\.)?mediafire\.com\/[^\s]+)/gi;
    const match = body.match(mfRegex);

    if (!match) {
        await sock.sendMessage(remoteJid, { text: "Hmph! Mana link MediaFire-nya? Baka!" }, { quoted: m });
        return true;
    }

    let url = match[0];
    if (!url.startsWith("http")) url = "https://" + url;

    try {
        await sock.sendMessage(remoteJid, { text: "Siap! Mizu lagi ambilin filenya. Tunggu ya! 😤" }, { quoted: m });
        
        const response = await fetch(`https://api.zenzxz.my.id/download/mediafire?url=${encodeURIComponent(url)}`);
        const json = await response.json();

        if (json.status && json.result && json.result.length > 0) {
            const data = json.result[0];
            const fileUrl = data.url;
            
            // Mengambil nama file asli dari URL unduhan agar tidak jadi .bin
            const originalFileName = decodeURIComponent(fileUrl.split('/').pop());

            await sock.sendMessage(remoteJid, { 
                document: { url: fileUrl }, 
                fileName: originalFileName || "file_unduhan.zip",
                mimetype: 'application/octet-stream',
                caption: `Ini filenya`
            }, { quoted: m });
        } else {
            throw new Error("API Gagal");
        }
        return true;
    } catch (e) {
        console.error("MediaFire Error:", e);
        await sock.sendMessage(remoteJid, { text: "Duh, Mizu gagal ambil filenya. Mungkin diblokir sama MediaFire! Hmph!" }, { quoted: m });
        return true;
    }
}