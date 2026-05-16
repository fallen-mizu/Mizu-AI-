import fs from 'fs';

const DB_PATH = './history.json';

// Inisialisasi file history jika belum ada
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({}), 'utf-8');
}

export const storage = {
    // Mendapatkan history percakapan berdasarkan ID (nomor WA)
    getHistory: (userId) => {
        const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        return db[userId] || [];
    },

    // Menambahkan pesan baru ke dalam history pengguna
    saveChat: (userId, nickname, role, content) => {
        const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        
        if (!db[userId]) {
            db[userId] = [];
        }

        // Simpan nickname juga sebagai referensi di metadata jika perlu
        // Kita batasi history maksimal 10 pesan terakhir agar tidak berat/boros kuota token
        db[userId].push({ role, content, nickname, timestamp: Date.now() });
        
        if (db[userId].length > 20) {
            db[userId].shift(); // Hapus pesan terlama jika lebih dari 20
        }

        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    }
};