/**
 * Fitur Pinterest Search
 * Trigger: "/pins [query]"
 * Creator: Fallen (Steven Immanuel)
 */
const api = {
  xterm: {
    url: "https://api.termai.cc",
    key: "Bell409"
  }
};

export async function pinterestPlugin(sock, m, body) {
    const remoteJid = m.key.remoteJid;
    const lowerBody = body.toLowerCase();

    // Pastikan perintah diawali dengan /pins
    if (!lowerBody.startsWith("/pins")) return false;

    // Mengambil query setelah "/pins "
    const query = body.slice(5).trim();
    
    if (!query) {
        await sock.sendMessage(remoteJid, { text: "Hmph! Kasih tau Mizu mau cari foto apa, Baka!" }, { quoted: m });
        return true;
    }

    try {
        const response = await fetch(`${api.xterm.url}/api/search/pinterest-image?query=${encodeURIComponent(query)}&key=${api.xterm.key}`);
        
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        
        const res = await response.json();

        if (res.status && res.data && res.data.length > 0) {
            const randomImageUrl = res.data[Math.floor(Math.random() * res.data.length)];
            
            await sock.sendMessage(remoteJid, { 
                image: { url: randomImageUrl }, 
                caption: `Ini pin *${query}* yang kamu minta. Cantik kan? Hmph!`,
                contextInfo: {
                    externalAdReply: {
                        title: "Mizu Pinterest Search",
                        body: `Result for: ${query}`,
                        thumbnailUrl: randomImageUrl,
                        sourceUrl: "https://pinterest.com",
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });
        } else {
            await sock.sendMessage(remoteJid, { text: `Duh, foto "${query}" nggak ketemu di Pinterest!` });
        }
        return true;
    } catch (e) {
        console.error("Pinterest Error:", e);
        await sock.sendMessage(remoteJid, { text: "Terjadi kesalahan saat menghubungi API Pinterest." });
        return true;
    }
}