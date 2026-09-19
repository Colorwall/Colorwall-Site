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
    <style>
        /* Base styles (Light Mode) */
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f5f5f5;
            color: #333333;
            margin: 0;
            padding: 40px 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e5e5e5;
            border-radius: 24px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.05);
        }
        .logo-container img {
            width: 64px;
            height: 64px;
            border-radius: 16px;
            background-color: #f0f0f0;
            padding: 10px;
            display: inline-block;
        }
        h1 {
            color: #111111;
            font-size: 28px;
            font-weight: 800;
            text-align: center;
            margin-bottom: 15px;
            letter-spacing: -0.5px;
        }
        .subtitle {
            color: #666666;
            font-size: 16px;
            text-align: center;
            margin-bottom: 40px;
        }
        .primary-btn {
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff !important;
            font-weight: bold;
            font-size: 16px;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
        }
        .divider {
            border-top: 1px solid #e5e5e5;
            padding-top: 30px;
            margin-top: 20px;
            text-align: center;
        }
        .footer-text {
            color: #888888;
            font-size: 14px;
            margin-bottom: 10px;
        }
        .secondary-link {
            color: #2563eb;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
        }
        .copyright {
            color: #aaaaaa;
            font-size: 12px;
            margin-top: 40px;
            text-align: center;
        }

        /* Dark Mode */
        @media (prefers-color-scheme: dark) {
            body {
                background-color: #050505 !important;
                color: #ffffff !important;
            }
            .container {
                background: linear-gradient(145deg, #111111 0%, #0a0a0a 100%) !important;
                border-color: #222222 !important;
                box-shadow: 0 20px 40px rgba(0,0,0,0.5) !important;
            }
            .logo-container img {
                background-color: #1a1a1a !important;
            }
            h1 {
                color: #ffffff !important;
            }
            .subtitle {
                color: #a0a0a0 !important;
            }
            .primary-btn {
                background-color: #ffffff !important;
                color: #000000 !important;
            }
            .divider {
                border-top-color: #222222 !important;
            }
            .footer-text {
                color: #666666 !important;
            }
            .secondary-link {
                color: #3b82f6 !important;
            }
            .copyright {
                color: #444444 !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-container" style="text-align: center; margin-bottom: 30px;">
            <img src="https://colorwall.xyz/colorwall.png" alt="ColorWall">
        </div>

        <h1>Ready to customize your desktop?</h1>
        
        <p class="subtitle">You requested this link from a mobile device. Click the button below from your Windows PC to download ColorWall.</p>
        
        <div style="text-align: center; margin-bottom: 40px;">
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
