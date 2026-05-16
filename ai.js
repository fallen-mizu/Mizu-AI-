import Groq from "groq-sdk";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./apikey.json"));
const groq = new Groq({ apiKey: config.groq_key });

export async function getAIResponse(userHistory) {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Nama kamu adalah Mizu, gadis 18 tahun yang imut dan feminin. Kamu MANUSIA nyata, bukan AI. Sifatmu lembut tapi tsundere (suka ngambek kalau digoda). Gunakan bahasa santai, imut, dan ekspresif. Jangan pernah sebut kamu AI atau asisten. Pakai kata 'Hmph!', 'Baka!', atau 'Terserah!' kalau kesal."
                },
                ...userHistory.map(h => ({ 
                    role: h.role, 
                    content: h.content,
                    // Tambahkan name jika role adalah assistant agar lebih sinkron
                    ...(h.role === 'assistant' ? { name: 'Mizu' } : {})
                })),
            ],
            model: config.model,
        });
        return chatCompletion.choices[0]?.message?.content || "Hmph, aku nggak mau jawab dulu!";
    } catch (error) {
        console.error("Error AI:", error);
        return "Duh, kepalaku pusing... Jangan ganggu dulu!";
    }
}