/**
 * Fitur Random Loli Image (Zenzxz API)
 * Trigger: "/loli"
 * Creator: Fallen (Steven Immanuel)
 */
export async function loliPlugin(sock, m, body) {
    const remoteJid = m.key.remoteJid;
    const lowerBody = body.toLowerCase().trim();
    
    // Sekarang hanya merespons perintah /loli
    if (lowerBody !== "/loli") return false;

    try {
        await sock.sendMessage(remoteJid, { text: "Tunggu sebentar, Mizu cariin gambar loli yang bagus buat kamu... Hmph! 😤" }, { quoted: m });
        
        const apiUrl = `https://api.zenzxz.my.id/image/loli`;

        // Kirim gambar langsung dari URL API
        await sock.sendMessage(remoteJid, { 
            image: { url: apiUrl }, 
            caption: `Ini gambar lolinya! Gimana? Bagus kan? Jangan dipelototin terus! Baka! 😤`
        }, { quoted: m });

        return true;
    } catch (e) {
        console.error("Loli Plugin Error:", e);
        await sock.sendMessage(remoteJid, { text: "Duh, Mizu gagal ambil gambarnya. Mungkin koneksinya lagi ampas! Hmph!" }, { quoted: m });
        return true;
    }
}