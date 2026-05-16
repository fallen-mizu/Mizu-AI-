import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

/**
 * Fitur Membuat Stiker Otomatis
 * Support: Foto, Video (maks 10 detik), & GIF
 * Creator: Fallen
 */
export async function stickerPlugin(sock, m, body) {
    const remoteJid = m.key.remoteJid;
    const lowerBody = body.toLowerCase();

    // Mizu cek apakah perintahnya sesuai
    const isStickerCommand = lowerBody.includes("jadikan stiker") || 
                             lowerBody.includes("sticker") || 
                             lowerBody.includes("/s");

    if (!isStickerCommand) return;

    // Cek apakah pesan itu media atau membalas (reply) pesan media
    const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
    const msg = m.message.imageMessage || m.message.videoMessage || 
                quoted?.imageMessage || quoted?.videoMessage;

    if (!msg) {
        return sock.sendMessage(remoteJid, { 
            text: "Hmph! Mana medianya? Kirim foto/video dengan caption atau reply medianya dengan perintah /s!" 
        }, { quoted: m });
    }

    // Validasi durasi video agar tidak terlalu berat
    if (msg.seconds > 10) {
        return sock.sendMessage(remoteJid, { 
            text: "Baka! Videonya kepanjangan. Maksimal 10 detik saja!" 
        }, { quoted: m });
    }

    try {
        await sock.sendPresenceUpdate('composing', remoteJid);

        // Deteksi tipe media untuk proses download
        const isVideo = !!(m.message.videoMessage || quoted?.videoMessage);
        const streamType = isVideo ? 'video' : 'image';
        
        const stream = await downloadContentFromMessage(msg, streamType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Mizu buatkan stikernya dengan identitasmu
        const sticker = new Sticker(buffer, {
            pack: 'Mizu Sticker Pack',
            author: 'Fallen', // Identitas Steven Immanuel
            type: StickerTypes.FULL,
            categories: ['✨', '🎨'],
            quality: 50,
        });

        const stickerBuffer = await sticker.toBuffer();
        
        await sock.sendMessage(remoteJid, { sticker: stickerBuffer }, { quoted: m });
        await sock.sendPresenceUpdate('paused', remoteJid);

    } catch (e) {
        console.error("Sticker Plugin Error:", e);
        await sock.sendMessage(remoteJid, { text: "Aduh, Mizu gagal buat stikernya. Coba cek format filenya ya!" });
    }
}