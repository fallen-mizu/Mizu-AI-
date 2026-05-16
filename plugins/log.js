import chalk from 'chalk'; // Pastikan sudah install chalk: npm install chalk

/**
 * Fitur Logger Console Premium
 * Creator: Fallen (Steven Immanuel)
 * PT. Zen - Osaka, Japan
 */
export function loggerPlugin(m, body, response = null) {
    const pushName = m.pushName || "Unknown User";
    const remoteJid = m.key.remoteJid;
    const senderNumber = m.key.participant || m.key.remoteJid;
    const isGroup = remoteJid.endsWith('@g.us');
    const mtype = Object.keys(m.message || {})[0];

    // Header Log
    console.log(chalk.cyan(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`));
    console.log(chalk.white(`[ ${new Date().toLocaleTimeString()} ]`));
    
    // Info User & Lokasi
    console.log(chalk.green(`👤 USER  : `) + chalk.white(`${pushName} (${senderNumber.split('@')[0]})`));
    
    if (isGroup) {
        // Nama grup akan dihandle di handler.js karena butuh async metadata
        console.log(chalk.yellow(`🏘️ GROUP : `) + chalk.white(remoteJid));
    } else {
        console.log(chalk.magenta(`📱 CHAT  : `) + chalk.white(`Private Message`));
    }

    console.log(chalk.blue(`📂 TYPE  : `) + chalk.white(mtype));
    console.log(chalk.yellow(`💬 MESSAGE: `) + chalk.white(body));

    // Jika ada respon dari bot (Mizu)
    if (response) {
        console.log(chalk.red(`🤖 MIZU RESPOND:`));
        console.log(chalk.white(`   > ${response}`));
    }

    console.log(chalk.cyan(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`));
}