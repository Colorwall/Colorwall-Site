<div align="center">

<img src="public/LxColorWall.webp" alt="ColorWall Logo" width="400"/>

[![Website](https://img.shields.io/badge/Website-colorwall.xyz-635BFF?style=for-the-badge)](https://colorwall.xyz)
[![Patreon](https://img.shields.io/badge/Support_on-Patreon-F96854?style=for-the-badge&logo=patreon)](https://patron.colorwall.xyz)

---

</div>

> This repository hosts the open-source frontend for **[colorwall.xyz](https://colorwall.xyz)**. It showcases the high-performance cinematic layouts, audio-reactive interfaces, and editorial typography used to promote the ColorWall engine.

<br />

##  The colorwall thing

ColorWall is an upcoming Thingy to Ms Store and prolly Steam, it is blazingly fast, Desktop Customization engine for Windows 10 and 11. It renders 8K live wallpapers, audio-reactive shaders, and interactive web scenes directly on your desktop.

- Performance: Hardware-accelerated video decoding with idle CPU usage under 0.1%.
- Zero Telemetry: Completely open source with no background tracking, no analytics, and no mandatory cloud connectivity. Runs completely offline.

*Looking for the actual Engine code? Too bad it is closed source, but you can check the Linux one, that is opensource*

<br />

## The Website Architecture (This Repo)

Built to run as smoothly as the engine it promotes, this site is designed with maximum performance and minimal footprint.

- **Framework:** Next.js & React
- **Styling:** Tailwind CSS, Webgl, Frag Shaders and random ass assets (Custom Design System)
- **Audio:** Custom deferred Ambient Context with interaction-based unblocking
- **Visuals:** Cool hardware-accelerated video decoding via HTML5

<br />

ColorWall is developed entirely by the awsome team of Colorwall ([@Colorwall](https://github.com/LaxentaInc), [@ColorwallOrg](https://github.com/Colorwall)).

If you want to support the continued development of the ColorWall ecosystem (including Colorwall Linux, ArchiveWalls, and more), consider supporting on [Patreon](https://patron.colorwall.xyz) or joining the [Discord](https://discord.gg/QYwhay7r2V).

<br />

## Security & Domain Hardening

The frontend includes enterprise grade web security headers configured in `next.config.ts` and an rfc 9116 disclosure file.

### HTTP Response Headers
- `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload` (enforces https across root and subdomains with browser preload eligibility).
- `X-Frame-Options`: `SAMEORIGIN` (prevents clickjacking by blocking unauthorized iframe embedding).
- `X-Content-Type-Options`: `nosniff` (stops mime-type sniffing attacks).
- `Referrer-Policy`: `strict-origin-when-cross-origin` (protects privacy on outbound link navigation).
- `Permissions-Policy`: `camera=(), microphone=(), geolocation=(), browsing-topics=()` (disables unused browser hardware and tracking apis).
- `Cross-Origin-Opener-Policy`: `same-origin-allow-popups` (isolates browsing context while supporting external popups like discord and github).
- `Cross-Origin-Resource-Policy`: `cross-origin` (guarantees tauri desktop app and subdomains can fetch apis and assets without cors or corp blocking).
- `poweredByHeader`: `false` (removes next.js fingerprint from headers).

### Security Disclosure
- `/.well-known/security.txt`: rfc 9116 compliant contact info pointing to `mailto:contact@laxenta.com`.

### Recommended DNS Records (Registrar / Cloudflare)
Whenever you want to harden email and dns at your domain registrar:
- **SPF (TXT)**: `v=spf1 -all` (blocks spammers from forging emails from @colorwall.xyz).
- **DMARC (TXT)** on `_dmarc.colorwall.xyz`: `v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s;` (instructs receiving mail servers to drop fake emails).
- **CAA (CAA)**: `0 issue "letsencrypt.org"` and `0 issuewild "letsencrypt.org"`.
- **DNSSEC**: enable via one-click toggle in your registrar or cloudflare dashboard.

---
<div align="center">
  <sub>Built out of boredom by the Colorwall Team.</sub>
</div>