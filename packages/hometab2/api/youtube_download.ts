import type { VercelRequest, VercelResponse } from '@vercel/node';
import ytdl from 'ytdl-core';

const youtube_download = async (req: VercelRequest, res: VercelResponse) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { url } = req.query;
    if (!(url && url.length && typeof url == 'string')) {
        res.status(400).json({
            error: 'invalid "url" parameter'
        });
        return;
    }
    try {
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, {
            quality: 'highestaudio'
        });
        const stream = ytdl(url, {
            format
        });
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${encodeURIComponent(info.videoDetails.title)}.${
                format.container === 'mp4' ? 'mp3' : format.container
            }"`
        );
        stream.pipe(res);
    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: ''
        });
    }
};
export default youtube_download;
