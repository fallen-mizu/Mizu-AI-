// plugins/delete.js

/**
 * WhatsApp Delete Plugin
 * Support WhatsApp MD + LID
 * Baileys Multi Device
 */

export async function deletePlugin(
    sock,
    m,
    body,
    isAdmin = false,
    isBotAdmin = false
) {
    try {

        // ===============================
        // VALIDASI DASAR
        // ===============================

        if (!m.message) return false

        const remoteJid = m.key.remoteJid
        const lowerBody = (body || "").toLowerCase()

        // ===============================
        // TRIGGER
        // ===============================

        const triggers = ["/del", "/d"];

        // Gunakan startsWith agar link /ig atau /play tidak disangka perintah delete!
        const isDeleteCmd = triggers.some(v => lowerBody.startsWith(v));

        if (!isDeleteCmd) return false;

        // ===============================
        // CONTEXT INFO
        // ===============================

        const contextInfo =
            m.message?.extendedTextMessage?.contextInfo

        if (!contextInfo?.stanzaId) {

            await sock.sendMessage(
                remoteJid,
                {
                    text: "Mizu bingung, mana pesan yang ingin dihapus, tolong reply itu"
                },
                { quoted: m }
            )

            return true
        }

       // ===============================
// DATA TARGET
// ===============================

const stanzaId = contextInfo.stanzaId

const participant =
    contextInfo.participant || ""

// ===============================
// DETEKSI PESAN BOT SENDIRI
// SUPPORT LID TERBARU
// ===============================

const quotedMessage =
    contextInfo.quotedMessage || {}

const isBotMessage =
    Object.keys(quotedMessage).length > 0 &&
    (
        participant.includes("@lid") ||
        participant.includes(
            sock.user.id.split(":")[0]
        )
    )

console.log({
    participant,
    isBotMessage,
    stanzaId
})

        // ===============================
        // DELETE PESAN BOT SENDIRI
        // ===============================

        if (isBotMessage) {

    await sock.sendMessage(
        remoteJid,
        {
            delete: {
                remoteJid: remoteJid,
                fromMe: true,
                id: stanzaId
            }
        }
    )

    return true
}
        

        // ===============================
        // KHUSUS GROUP
        // ===============================

        if (!remoteJid.endsWith("@g.us")) {

            await sock.sendMessage(
                remoteJid,
                {
                    text: "Fitur ini hanya bisa digunakan di grup."
                },
                { quoted: m }
            )

            return true
        }

        // ===============================
        // VALIDASI ADMIN
        // ===============================

        if (!isAdmin) {

            await sock.sendMessage(
                remoteJid,
                {
                    text: "Kamu bukan admin grup"
                },
                { quoted: m }
            )

            return true
        }

        if (!isBotAdmin) {

            await sock.sendMessage(
                remoteJid,
                {
                    text: "Mizu harus menjadi admin grup"
                },
                { quoted: m }
            )

            return true
        }

        // ===============================
        // DELETE PESAN MEMBER / ADMIN
        // SUPPORT LID
        // ===============================

        await sock.sendMessage(
            remoteJid,
            {
                delete: {
                    remoteJid,
                    fromMe: false,
                    id: stanzaId,
                    participant
                }
            }
        )

        return true

    } catch (err) {

        console.error(
            "DELETE PLUGIN ERROR:",
            err
        )

        return false
    }
}