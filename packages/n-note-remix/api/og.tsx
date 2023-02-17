import { ImageResponse } from '@vercel/og';

export const config = {
    runtime: 'edge',
};

export default function handler(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const title = searchParams.has('title') ? searchParams.get('title') : 'タイトル';
        const userName = searchParams.has('userName') ? searchParams.get('userName') : 'ユーザー名';

        return new ImageResponse(
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <h1>{title}</h1>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <h3>by {userName}</h3>
                </div>
            </div>,
            { width: 1200, height: 630 },
        );
    } catch (e) {
        console.log(e);
        return new Response('Failed to generate the image', { status: 500 });
    }
}
