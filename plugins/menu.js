import fs from 'fs';

/**
 * Fitur Menu Mizu Zen Signature (1PB)
 * Footer telah diperbarui menjadi Mizu Assistant.
 * Creator: Fallen (Steven Immanuel)
 */
export async function menuPlugin(sock, m, body) {
    // Memastikan JID adalah string murni untuk stabilitas pengiriman
    const remoteJid = typeof m.chat === 'string' ? m.chat : m.key.remoteJid;
    const lowerBody = body.toLowerCase().trim();

    if (lowerBody !== "/menu" && lowerBody !== "help") return false;

    // Estetika Zen: Fokus pada kejelasan dan identitas Mizu.
    const menuContent = `
*╭━━━〔 ⛩️ ᴍɪᴢᴜ ᴍᴇɴᴜ 〕━━━*
┃
┃  *📥 ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*
┃  ◦ /ig
┃  ◦ /tt
┃  ◦ /ttaudio
┃  ◦ /pins
┃  ◦ /play
┃  ◦ /playvideo
┃
┃  *🎨 ᴍᴀᴋᴇʀ*
┃  ◦ /s
┃
┃  *👑 ᴏᴡɴᴇʀ*
┃  ◦ /owner
┃
┃  *📡 sʏsᴛᴇᴍ*
┃  ◦ /d
┃  ◦ /ping
┃
╰━━━━━━━━━━━━━━━━━━━┛

   *“𝘚𝘪𝘮𝘱𝘭𝘪𝘤𝘪𝘵𝘺 𝘪𝘴 𝘵𝘩𝘦 𝘶𝘭𝘵𝘪𝘮𝘢𝘵ᴇ 𝘴𝘰𝘱𝘩𝘪𝘴𝘵𝘪𝘤𝘢𝘵𝘪𝘰𝘯.”*
   _ᴍɪᴢᴜ ᴀssɪsᴛᴀɴᴛ_`.trim();

    try {
        let thumbBuffer;
        try {
            thumbBuffer = fs.readFileSync('./thumbnail.jpg');
        } catch {
            thumbBuffer = null;
        }

        // Dokumen 1PB - Representasi kekuatan sistem PT. Panda yang tenang.
        await sock.sendMessage(remoteJid, {
            document: Buffer.alloc(0), 
            fileName: 'MIZU_CORE_SYSTEM', 
            mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            fileLength: 1125899906842624, // 1 Petabyte
            pageCount: 2026,
            caption: menuContent,
            contextInfo: {
                externalAdReply: {
                    title: "⛩️ MIZU | ZEN INTERFACE",
                    body: "Software Developer & Photography",
                    mediaType: 1,
                    thumbnail: thumbBuffer,
                    sourceUrl: "https://fallen-mizu.vercel.app",
                    renderLargerThumbnail: true,
                    showAdAttribution: false
                }
            }
        }, { quoted: m });

        return true;
    } catch (e) {
        console.error("Mizu Zen Error:", e.message);
        await sock.sendMessage(remoteJid, { text: menuContent }, { quoted: m });
        return true;
    }
}