import yts from 'yt-search';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * PlayVideo Plugin
 * WhatsApp Compatible Video Sender
 * Rebuild 2026
 */

export async function playVideoPlugin(sock, m, body) {

    const remoteJid = m.chat || m.key.remoteJid;
    const lowerBody = body.toLowerCase().trim();

    const quoted =
        m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    const quotedText =
        quoted?.conversation ||
        quoted?.extendedTextMessage?.text ||
        '';

    try {

        /*
        ===================================
        STEP 1 - SEARCH VIDEO
        ===================================
        */

        if (lowerBody.startsWith('/playvideo')) {

            const query = body
                .replace(/^\/playvideo/i, '')
                .trim();

            if (!query) {

                await sock.sendMessage(remoteJid, {
                    text: 'Masukkan judul video.'
                }, { quoted: m });

                return true;
            }

            const search = await yts(query);

            const videos = search.videos.slice(0, 10);

            if (!videos.length) {

                await sock.sendMessage(remoteJid, {
                    text: 'Video tidak ditemukan.'
                }, { quoted: m });

                return true;
            }

            let text =
`*╭━━━〔 🎬 PLAYVIDEO SEARCH 〕━━━*
┃`;

            videos.forEach((v, i) => {

                text += `
┃ *${i + 1}.* ${v.title}
┃ ⏱️ ${v.timestamp}
┃ 🔗 ${v.url}
┃`;

            });

            text += `
╰━━━━━━━━━━━━━━━━━━━┛

Reply angka 1-10 untuk memilih video.`;

            await sock.sendMessage(remoteJid, {
                text
            }, { quoted: m });

            return true;
        }

        /*
        ===================================
        STEP 2 - SELECT VIDEO
        ===================================
        */

        if (
            quoted &&
            quotedText.includes('PLAYVIDEO SEARCH') &&
            !quotedText.includes('SELECT RESOLUTION')
        ) {

            const num = lowerBody.match(/^([1-9]|10)$/);

            if (!num) return false;

            const links = quotedText.match(
                /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/g
            );

            if (!links) return false;

            const selectedVideo =
                links[Number(num[0]) - 1];

            if (!selectedVideo) return false;

            const text =
`*╭━━━〔 📺 SELECT RESOLUTION 〕━━━*
┃
┃ 1. 360p
┃ 2. 480p
┃ 3. 720p
┃
╰━━━━━━━━━━━━━━━━━━━┛

#VIDEO:${selectedVideo}`;

            await sock.sendMessage(remoteJid, {
                text
            }, { quoted: m });

            return true;
        }

        /*
        ===================================
        STEP 3 - DOWNLOAD VIDEO
        ===================================
        */

        if (
            quoted &&
            quotedText.includes('SELECT RESOLUTION')
        ) {

            const resMap = {
                '1': '360',
                '2': '480',
                '3': '720'
            };

            const selectedRes =
                resMap[lowerBody];

            if (!selectedRes) return false;

            const videoUrl =
                quotedText
                    .split('#VIDEO:')[1]
                    ?.trim();

            if (!videoUrl) return false;

            await sock.sendMessage(remoteJid, {
                text: `Sedang memproses video ${selectedRes}p...`
            }, { quoted: m });

            /*
            ===================================
            API REQUEST
            ===================================
            */

            const apiUrl =
`https://api.zenzxz.my.id/download/youtube?url=${encodeURIComponent(videoUrl)}&format=${selectedRes}`;

            const apiRes = await fetch(apiUrl);

            if (!apiRes.ok) {

                throw new Error(
                    `API Error ${apiRes.status}`
                );
            }

            const data = await apiRes.json();

            console.log(
                JSON.stringify(data, null, 2)
            );

            /*
            ===================================
            GET DOWNLOAD URL
            ===================================
            */

            let downloadUrl =
                data?.result?.download ||
                data?.result?.url ||
                data?.downloadUrl ||
                data?.url ||
                data?.result?.video;

            if (!downloadUrl) {

                await sock.sendMessage(remoteJid, {
                    text: 'Gagal mendapatkan link download video.'
                }, { quoted: m });

                return true;
            }

            /*
            ===================================
            DOWNLOAD VIDEO
            ===================================
            */

            const videoRes =
                await fetch(downloadUrl);

const contentType =
    videoRes.headers.get('content-type') || '';

console.log('CONTENT TYPE:', contentType);

if (
    contentType.includes('audio')
) {
    throw new Error(
        'API mengembalikan audio, bukan video.'
    );
}

            if (!videoRes.ok) {

                throw new Error(
                    'Gagal mengunduh video.'
                );
            }

            console.log(
                'CONTENT TYPE:',
                videoRes.headers.get('content-type')
            );

            const buffer =
                await videoRes.buffer();

            /*
            ===================================
            FILE SIZE LIMIT
            ===================================
            */

            if (
                buffer.length >
                64 * 1024 * 1024
            ) {

                await sock.sendMessage(remoteJid, {
                    text: 'Ukuran video terlalu besar untuk WhatsApp.'
                }, { quoted: m });

                return true;
            }

            /*
            ===================================
            TEMP DIRECTORY
            ===================================
            */

            const tempDir = './temp';

            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            const timestamp = Date.now();

            const inputPath =
                path.join(
                    tempDir,
                    `input_${timestamp}.mp4`
                );

            const outputPath =
                path.join(
                    tempDir,
                    `output_${timestamp}.mp4`
                );

            fs.writeFileSync(
                inputPath,
                buffer
            );

            /*
            ===================================
            FFMPEG CONVERT
            ===================================
            */

            const ffmpegCmd =
`ffmpeg -y -i "${inputPath}" \
-c:v libx264 \
-c:a aac \
-pix_fmt yuv420p \
-movflags +faststart \
"${outputPath}"`;

            try {

                const {
                    stdout,
                    stderr
                } = await execAsync(
                    ffmpegCmd,
                    {
                        timeout: 120000,
                        maxBuffer:
                            1024 * 1024 * 10
                    }
                );

                console.log(stdout);
                console.log(stderr);

            } catch (err) {

                console.log(
                    'FFMPEG STDERR:'
                );

                console.log(err.stderr);

                if (
                    fs.existsSync(inputPath)
                ) {
                    fs.unlinkSync(inputPath);
                }

                if (
                    fs.existsSync(outputPath)
                ) {
                    fs.unlinkSync(outputPath);
                }

                throw new Error(
                    err.stderr ||
                    err.message
                );
            }

            /*
            ===================================
            CHECK OUTPUT
            ===================================
            */

            if (
                !fs.existsSync(outputPath)
            ) {

                throw new Error(
                    'FFmpeg gagal membuat output video.'
                );
            }

            /*
            ===================================
            SEND VIDEO
            ===================================
            */

            const finalBuffer =
                fs.readFileSync(outputPath);

            await sock.sendMessage(
                remoteJid,
                {
                    video: finalBuffer,
                    mimetype: 'video/mp4',
                    fileName:
                        `mizu_${selectedRes}p.mp4`,
                    caption:
`*🎬 Download Success*

*Title:* ${data?.result?.title || 'Unknown'}
*Quality:* ${selectedRes}p

Powered by Zen`
                },
                { quoted: m }
            );

            /*
            ===================================
            CLEANUP
            ===================================
            */

            if (
                fs.existsSync(inputPath)
            ) {
                fs.unlinkSync(inputPath);
            }

            if (
                fs.existsSync(outputPath)
            ) {
                fs.unlinkSync(outputPath);
            }

            return true;
        }

        return false;

    } catch (err) {

        console.error(err);

        await sock.sendMessage(remoteJid, {
            text:
`Terjadi error:

${err.message}`
        }, { quoted: m });

        return true;
    }
}