import yts from 'yt-search';

/**
 * Fitur Download Lagu YouTube (Metadata Asli)
 * Creator: Fallen
 */
/**
 * Fitur Download Lagu YouTube (Metadata Asli)
 * Trigger: "/play [judul lagu]"
 * Creator: Fallen (Steven Immanuel)
 */
export async function youtubePlugin(sock, m, body) {
    const remoteJid = m.key.remoteJid;
    const lowerBody = body.toLowerCase().trim();

    // Pastikan perintah diawali dengan /play
    if (lowerBody.startsWith("/playvideo")) return false; // Tambahkan ini agar dia mengalah pada video!
if (!lowerBody.startsWith("/play")) return false;

    // Mengambil judul lagu setelah "/play "
    const query = body.slice(5).trim();

    if (!query) {
        await sock.sendMessage(remoteJid, { text: "Hmph! Kasih tahu Mizu judul lagunya dong! Baka! 😤" }, { quoted: m });
        return true;
    }

    try {
        // Step 1: Cari video untuk metadata asli
        const search = await yts(query);
        const video = search.videos[0];

        if (!video) return sock.sendMessage(remoteJid, { text: "Duh, lagunya nggak ketemu!" });

        const videoUrl = video.url;

        // Step 2: Download lewat Zenzxz sesuai saranmu
        const response = await fetch(`https://api.zenzxz.my.id/download/youtube?url=${encodeURIComponent(videoUrl)}&format=mp3`);
        const res = await response.json();

        if (res.status && res.result) {
            const data = res.result;

            // Detail teks asli tanpa simulasi size
            const captionText = `📌 *Judul:* ${video.title}\n👤 *Channel:* ${video.author.name}\n⏱️ *Durasi:* ${video.timestamp}\n📅 *Upload:* ${video.ago}`;

            await sock.sendPresenceUpdate('recording', remoteJid);

            // Step 3: Kirim Audio dengan Metadata Real
            await sock.sendMessage(remoteJid, { 
                audio: { url: data.download }, 
                mimetype: 'audio/mpeg',
                fileName: `${video.title}.mp3`,
                ptt: false,
                contextInfo: {
                    externalAdReply: {
                        title: video.title,
                        body: `Channel: ${video.author.name} | Duration: ${video.timestamp}`,
                        mediaType: 2, 
                        thumbnailUrl: video.thumbnail, 
                        sourceUrl: videoUrl,
                        showAdAttribution: false,
                        renderLargerThumbnail: true 
                    }
                }
            }, { quoted: m });

        } else {
            throw new Error("API Zenzxz Error");
        }

        await sock.sendPresenceUpdate('paused', remoteJid);

    } catch (e) {
        console.error("Youtube Error:", e);
        await sock.sendMessage(remoteJid, { text: "Duh, ada gangguan saat memproses audio. Hmph!" });
        await sock.sendPresenceUpdate('paused', remoteJid);
    }
}