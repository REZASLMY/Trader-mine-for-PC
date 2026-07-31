# TraderMind OS

ژورنال معاملاتی حرفه‌ای — نرم‌افزار دسکتاپ آفلاین برای ثبت، تحلیل و بهبود معاملات.

## Run & Operate

- `pnpm --filter @workspace/tradermind run dev` — اجرا در Replit (پیش‌نمایش وب)
- `pnpm run typecheck` — بررسی تایپ‌اسکریپت کل پروژه
- `pnpm run build` — typecheck + build کامل
- `pnpm --filter @workspace/tradermind run electron:build:win` — ساخت نصب‌کننده ویندوز (باید روی ویندوز یا GitHub Actions اجرا شود)
- `pnpm --filter @workspace/tradermind run test` — اجرای تست‌ها

## ساخت setup.exe (GitHub Actions)

با tag زدن یک نسخه جدید، فرآیند ساخت خودکار اجرا می‌شود:

```bash
git tag v1.2.0
git push origin v1.2.0
```

فایل `.exe` در بخش Releases گیت‌هاب قرار می‌گیرد.

## Stack

- pnpm workspaces, Node.js 20+, TypeScript 5.9
- **Frontend:** React 19, Vite 7, Tailwind CSS v4, shadcn/ui
- **Desktop:** Electron 36 + electron-builder (NSIS installer)
- **Database:** Dexie (IndexedDB) — کاملاً آفلاین، بدون سرور
- **State:** Zustand
- **Charts:** Recharts

## ساختار پروژه

```
artifacts/
  tradermind/          # اپلیکیشن اصلی TraderMind OS
    electron/          # فایل‌های اصلی Electron (main.ts, preload.ts)
    src/               # کد React (pages, components, services, db)
    public/            # آیکون و فایل‌های استاتیک
    electron-builder.json  # تنظیمات بسته‌بندی نصب‌کننده
  api-server/          # Express API server (برای نسخه وب Replit)
lib/                   # کتابخانه‌های مشترک
.github/workflows/     # GitHub Actions برای ساخت خودکار .exe
```

## Architecture

- برنامه کاملاً آفلاین است — تمام داده‌ها در IndexedDB (Dexie v4) ذخیره می‌شوند
- در Replit به عنوان وب‌اپ اجرا می‌شود؛ در تولید به عنوان Electron desktop app
- Router از hash-based navigation استفاده می‌کند تا هم در مرورگر و هم در `file://` کار کند
- Electron main فایل‌های HTML را از `dist/public/` بارگذاری می‌کند

## User preferences

- زبان کد: TypeScript/فارسی (کامنت‌ها فارسی)
- نصب‌کننده: NSIS با پشتیبانی زبان فارسی
- هدف: کاربران ایرانی

## Gotchas

- برای ساخت `.exe` حتماً از GitHub Actions استفاده کنید — Replit محیط Linux است
- `pnpm-lock.yaml` ممکن است با نصب‌های جزئی تغییر کند؛ قبل از commit بررسی کنید
- `electron-builder.json` فایل `public/icon.png` را برای آیکون استفاده می‌کند
- `tsconfig.electron.json` جداگانه است و Electron main را کامپایل می‌کند

## Pointers

- Schema DB: `artifacts/tradermind/src/db/database.ts`
- ورودی اپ: `artifacts/tradermind/src/App.tsx`
- Electron main: `artifacts/tradermind/electron/main.ts`
- تنظیمات build: `artifacts/tradermind/electron-builder.json`
- GitHub Actions: `.github/workflows/build-electron.yml`
