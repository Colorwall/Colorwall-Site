import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }

        const apiKey = process.env.BREVO_API_KEY;
        
        if (!apiKey) {
            return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
        }

        // Brevo API payload
        const payload = {
            sender: {
                name: "ColorWall",
                email: "no-reply@colorwall.xyz" // Using verified sender
            },
            to: [
                {
                    email: email
                }
            ],
            subject: "Your ColorWall Download Link",
            htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <!-- Import Google Fonts to match the website -->
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@200;400;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        /* Base styles (Light Mode) */
        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #ffffff;
            color: #000000;
            margin: 0;
            padding: 40px 20px;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fcfcfc;
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 32px;
            padding: 56px 40px;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.05);
        }
        .logo-container {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo-container img {
            width: 80px;
            height: 80px;
            display: inline-block;
            filter: drop-shadow(0 0 40px rgba(59,130,246,0.3));
        }
        h1 {
            font-family: 'Outfit', sans-serif;
            color: #000000;
            font-size: 42px;
            font-weight: 200;
            text-align: center;
            margin: 0 0 24px 0;
            letter-spacing: -0.06em;
            line-height: 1.1;
        }
        .highlight {
            font-weight: 800;
            background: linear-gradient(110deg, #000000 35%, #111827 45%, #3b82f6 50%, #111827 55%, #000000 65%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .subtitle {
            color: rgba(0, 0, 0, 0.6);
            font-size: 16px;
            text-align: center;
            margin: 0 auto 48px auto;
            max-width: 400px;
        }
        .btn-container {
            text-align: center;
            margin-bottom: 48px;
        }
        .primary-btn {
            display: inline-block;
            background-color: #000000;
            color: #ffffff !important;
            font-weight: 700;
            font-size: 16px;
            text-decoration: none;
            padding: 20px 40px;
            border-radius: 16px;
            transition: transform 0.3s ease;
        }
        .primary-btn:hover {
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .divider {
            border-top: 1px solid rgba(0, 0, 0, 0.1);
            padding-top: 32px;
            margin-top: 32px;
            text-align: center;
        }
        .footer-text {
            color: rgba(0, 0, 0, 0.6);
            font-size: 13px;
            margin: 0 0 12px 0;
            font-weight: 500;
        }
        .secondary-link {
            display: inline-block;
            color: rgba(0, 0, 0, 0.6);
            text-decoration: underline;
            font-weight: 600;
            font-size: 12px;
        }
        .copyright {
            color: rgba(0, 0, 0, 0.4);
            font-size: 12px;
            margin-top: 48px;
            text-align: center;
            font-weight: 500;
        }

        /* Dark Mode */
        @media (prefers-color-scheme: dark) {
            body {
                background-color: #0a0a0a !important;
                color: #ffffff !important;
            }
            .container {
                background-color: rgba(255, 255, 255, 0.03) !important;
                border-color: rgba(255, 255, 255, 0.05) !important;
                box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5) !important;
            }
            h1 {
                color: #ffffff !important;
            }
            .highlight {
                background: linear-gradient(110deg, #ffffff 35%, #f4f9ff 45%, #8bc5f8 50%, #f4f9ff 55%, #ffffff 65%) !important;
                -webkit-background-clip: text !important;
                -webkit-text-fill-color: transparent !important;
            }
            .subtitle {
                color: rgba(255, 255, 255, 0.6) !important;
            }
            .primary-btn {
                background-color: #ffffff !important;
                color: #000000 !important;
            }
            .primary-btn:hover {
                box-shadow: 0 10px 25px -5px rgba(255, 255, 255, 0.1) !important;
            }
            .divider {
                border-top-color: rgba(255, 255, 255, 0.1) !important;
            }
            .footer-text {
                color: rgba(255, 255, 255, 0.6) !important;
            }
            .secondary-link {
                color: rgba(255, 255, 255, 0.6) !important;
            }
            .copyright {
                color: rgba(255, 255, 255, 0.4) !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-container">
            <img src="https://colorwall.xyz/colorwall.png" alt="ColorWall">
        </div>

        <h1>Ready to <span class="highlight">customize</span> your desktop?</h1>
        
        <p class="subtitle">You requested this link from a mobile device. Click the button below from your Windows PC to download ColorWall.</p>
        
        <div class="btn-container">
            <a href="https://colorwall.xyz/download" class="primary-btn">
                Download ColorWall for Windows
            </a>
        </div>
        
        <div class="divider">
            <p class="footer-text">Alternatively, you can download the installer file directly:</p>
            <a href="https://github.com/colorwall/colorwall/releases/latest" class="secondary-link">Download .exe from GitHub</a>
        </div>
        
        <div class="copyright">
            <p>&copy; ${new Date().getFullYear()} ColorWall. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`
        };

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Brevo API error:", errorText);
            return NextResponse.json({ error: 'Failed to send email' }, { status: response.status });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Email send error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
