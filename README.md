# TraderMind OS

**ژورنال معاملاتی حرفه‌ای — نسخه دسکتاپ آفلاین**

TraderMind یک ابزار جامع ثبت و تحلیل معاملات است که کاملاً آفلاین و روی کامپیوتر شما اجرا می‌شود. تمام داده‌ها در IndexedDB مرورگر ذخیره می‌شوند — هیچ اطلاعاتی به سرور ارسال نمی‌شود.

---

## دانلود

آخرین نسخه را از [صفحه Releases](../../releases/latest) دانلود کنید.

| پلتفرم | فایل |
|--------|------|
| ویندوز | `TraderMind-Setup-*.exe` |
| macOS  | `TraderMind-*.dmg` |

---

## امکانات

- **ژورنال معاملات** — ثبت کامل ورود/خروج، حجم، P&L، تصاویر چارت
- **تحلیل Edge** — پیدا کردن لبه معاملاتی از داده‌های تاریخی
- **Risk Management** — محاسبه ریسک، پلنر معاملاتی
- **Performance Dashboard** — شاخص‌های کامل عملکرد
- **Psychology Tracker** — ردیابی وضعیت ذهنی
- **Knowledge Base** — دانش‌نامه شخصی معاملات
- **Trade Replay** — بازپخش معاملات قبلی
- **پشتیبان‌گیری** — Export/Import کامل داده‌ها

---

## توسعه

### پیش‌نیازها
- Node.js 20+
- pnpm 10+

### اجرا در Replit
```bash
pnpm --filter @workspace/tradermind run dev
```

### ساخت نصب‌کننده ویندوز (GitHub Actions)
با push کردن یک tag جدید، فرآیند ساخت خودکار شروع می‌شود:

```bash
git tag v1.2.0
git push origin v1.2.0
```

فایل `TraderMind-Setup-1.2.0.exe` در بخش Releases قرار می‌گیرد.

### ساخت دستی
```bash
# ساخت renderer (Vite)
pnpm --filter @workspace/tradermind run electron:build:vite

# کامپایل Electron main
pnpm --filter @workspace/tradermind run electron:compile

# ساخت نصب‌کننده ویندوز
pnpm --filter @workspace/tradermind run electron:build:win
```

---

## Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Desktop:** Electron 36
- **Database:** Dexie (IndexedDB wrapper)
- **State:** Zustand
- **Charts:** Recharts
- **Build:** Vite 7, electron-builder

---

## لایسنس

Copyright © 2025 TraderMind — All rights reserved.
