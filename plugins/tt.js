/**
 * Fitur TikTok Downloader (Video & Audio)
 * Trigger: "/tt" atau "/ttaudio"
 * Creator: Fallen (Steven Immanuel)
 */
export async function tiktokPlugin(sock, m, body) {
    const remoteJid = m.key.remoteJid;
    const lowerBody = body.toLowerCase().trim();
    
    // Perbaikan: Mizu sekarang lebih peka, tidak harus kaku dengan spasi di awal
    const isVideoReq = lowerBody.startsWith("/tt");
    const isAudioReq = lowerBody.startsWith("/ttaudio");

    if (!isVideoReq && !isAudioReq) return false;

    // Regex tajam untuk mencari link di dalam pesan
    const ttRegex = /(https?:\/\/(?:vt|www|vm|v)\.tiktok\.com\/([^\s?#&]+))/gi;
    const match = body.match(ttRegex);

    if (!match) {
        // Jika cuma ngetik command tanpa link, Mizu kasih tahu caranya
        await sock.sendMessage(remoteJid, { 
            text: `Hmph! Masukkan link TikTok-nya juga dong! 😤` 
        }, { quoted: m });
        return true;
    }

    const url = match[0];

    try {
        await sock.sendMessage(remoteJid, { text: `Tunggu sebentar, Mizu lagi ambilin ${isAudioReq ? 'audionya' : 'videonya'} buat kamu... Hmph!` }, { quoted: m });
        
        const response = await fetch(`https://api.zenzxz.my.id/download/tiktok?url=${encodeURIComponent(url)}`);
        const json = await response.json();

        if (json.status && json.result) {
            const data = json.result;
            const targetUrl = isAudioReq ? data.music : data.play; 

            if (isAudioReq) {
                // Kirim Audio
                await sock.sendMessage(remoteJid, { 
                    audio: { url: targetUrl }, 
                    mimetype: 'audio/mpeg',
                    fileName: `mizu_tiktok_audio.mp3`,
                    ptt: false
                }, { quoted: m });
            } else {
                // Kirim Video
                await sock.sendMessage(remoteJid, { 
                    video: { url: targetUrl }, 
                    caption: `Ini videonya! Mizu pakai kualitas standar biar HP kamu nggak meledak! Hmph! 😤`,
                    mimetype: 'video/mp4'
                }, { quoted: m });
            }
        } else {
            throw new Error("API Error");
        }
        return true;
    } catch (e) {
        console.error("TikTok Error:", e);
        await sock.sendMessage(remoteJid, { text: "Duh, gagal ambil datanya. Mungkin link-nya salah atau API-nya lagi mogok! Hmph!" }, { quoted: m });
        return true;
    }
}