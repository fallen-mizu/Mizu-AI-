import { playVideoPlugin } from './plugins/playvideo.js';
import { deletePlugin } from "./plugins/delete.js";
import { menuPlugin } from "./plugins/menu.js";
import { loliPlugin } from "./plugins/loli.js";
import { settings } from "./settings.js";
import { stickerPlugin } from "./plugins/sticker.js";
import { storage } from "./storage.js";
import { getAIResponse } from "./ai.js";
import { youtubePlugin } from "./plugins/youtube.js";
import { pinterestPlugin } from "./plugins/pinterest.js";
import { instagramPlugin } from "./plugins/ig.js";
import { mediafirePlugin } from "./plugins/mediafire.js";
import { pingPlugin } from "./plugins/ping.js";
import { tiktokPlugin } from "./plugins/tt.js";
import { ownerPlugin } from "./plugins/owner.js";
import { loggerPlugin } from "./plugins/log.js";

export async function messageHandler(sock, m) {
    try {
        if (!m.message || m.key.fromMe) return;

        const remoteJid = m.key.remoteJid;
        const isGroup = remoteJid.endsWith('@g.us');
        const pushName = m.pushName || "User";
        
        // --- LOGIKA PEMBACA PESAN ---
        const mtype = Object.keys(m.message)[0];
        let body = "";

        if (mtype === 'conversation') {
            body = m.message.conversation;
        } else if (mtype === 'extendedTextMessage') {
            body = m.message.extendedTextMessage.text;
        } else if (mtype === 'imageMessage') {
            body = m.message.imageMessage.caption || "";
        } else if (mtype === 'videoMessage') {
            body = m.message.videoMessage.caption || "";
        } else {
            body = m.message[mtype]?.caption || m.message[mtype]?.text || "";
        }
        loggerPlugin(m, body);

        // --- FILTER: KHUSUS GRUP ---
        if (!isGroup) return;

        // AUTOREAD
        await sock.readMessages([m.key]);

        const sender = m.key.participant || m.key.remoteJid;
        const myID = sock.user.id.split(':')[0];
        const lowerBody = body.toLowerCase().trim();

        // --- GROUP ADMIN DETECTOR ---
        let isAdmin = false;
        let isBotAdmin = false;
        const metadata = await sock.groupMetadata(remoteJid);
        const participants = metadata.participants || [];
        const botNumber = sock.user.id.split(":")[0];

        isAdmin = participants.some(p => p.admin && p.id.includes(sender.split("@")[0]));
        isBotAdmin = participants.some(p => p.admin && (p.id.includes(botNumber) || p.id.includes("@lid")));

        // 0. PLUGIN: YOUTUBE MUSIC (/play)
        if (body.startsWith("/play")) {
    if (await youtubePlugin(sock, m, body)) return;
}

        // 1. PLUGIN: PINTEREST (/pins) - SUDAH DIPERBAIKI KURUNGNYA!
        if (lowerBody.startsWith("/pins")) {
            await sock.sendPresenceUpdate('composing', remoteJid);
            const isPins = await pinterestPlugin(sock, m, body);
            await sock.sendPresenceUpdate('paused', remoteJid);
            if (isPins) return;
        }
        
        //PLUGIN GLOBAL PLAYVIDEO 
        
        if (await playVideoPlugin(sock, m, body)) return;
        
        //PLUGIN: PLAYVIDEO new fitur
        if (body.startsWith("/playvideo")) {
    if (await playVideoPlugin(sock, m, body)) return;
}
        
        // 2. PLUGIN: STICKER
        if (lowerBody.includes("/s") || lowerBody.includes("buat stiker")) {
            await stickerPlugin(sock, m, body);
            return;
        }
        
        // 3. PLUGIN: DELETE
       if (lowerBody.includes("/d") || lowerBody.includes("/del") || m.message.protocolMessage) {
            const deleted = await deletePlugin(sock, m, body, isAdmin, isBotAdmin);
        if (deleted) return;
           }
        
        // PLUGIN: RANDOM LOLI (/loli)
if (lowerBody === "/loli") {
    const isLoli = await loliPlugin(sock, m, body);
    if (isLoli) return;
}
        
        // PLUGIN: MENU
if (lowerBody === "/menu" || lowerBody === "help") {
    if (await menuPlugin(sock, m, body)) return;
}
        
        // 4. PLUGIN: MEDIA DOWNLOADERS (IG, TT, MF)
        if (lowerBody.startsWith("/ig")) {
    const isIg = await instagramPlugin(sock, m, body);
    if (isIg) return;
}
        
        if (lowerBody.startsWith("/tt")) {
    const isTt = await tiktokPlugin(sock, m, body);
    if (isTt) return;
            }
        
        if (await mediafirePlugin(sock, m, body)) return;
        
        // 5. PLUGIN: SYSTEM (Ping & Owner)
        if (lowerBody === "/ping") {
            if (await pingPlugin(sock, m, body)) return;
        }
        
        if (await ownerPlugin(sock, m, lowerBody)) return; 
        
        // 6. LOGIKA AI (GROQ AI)
        const isMizuCalled = lowerBody.includes(settings.botName.toLowerCase());
        const isBotReply = m.message.extendedTextMessage?.contextInfo?.participant?.includes(myID);

        if (isMizuCalled || isBotReply) {
            await sock.sendPresenceUpdate('composing', remoteJid);
            storage.saveChat(sender, pushName, "user", body);
            const response = await getAIResponse(storage.getHistory(sender));
            storage.saveChat(sender, settings.botName, "assistant", response);
            await sock.sendMessage(remoteJid, { text: response }, { quoted: m });
            loggerPlugin(m, body, response); 

            await sock.sendPresenceUpdate('paused', remoteJid);
        } // <--- Ini tutup dari "if (isMizuCalled || isBotReply)"
        
    } catch (err) {
        // Ini menangkap error jika ada masalah di dalam try
        console.error("Handler Error:", err);
    }
} // <--- Ini tutup AKHIR dari