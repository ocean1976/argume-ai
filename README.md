# Argume.ai

Argume.ai, kullanıcıların sorularını birden fazla AI modeline sorduğu ve AI'ların kendi aralarında tartıştığı bir platformdur. "Tek bir AI'a sorma, meclise danış" konsepti ile geliştirilmektedir.

## Proje Yapısı

Bu proje bir monorepo yapısına sahiptir ve **Turborepo** ile **pnpm** kullanmaktadır.

- `apps/web`: Next.js 14 (App Router) tabanlı web uygulaması.
- `packages/orchestrator`: AI modelleri arasındaki tartışma mantığını yöneten orkestrasyon katmanı.
- `packages/models`: Desteklenen AI modellerinin tanımlandığı registry.
- `packages/shared`: Uygulama genelinde paylaşılan tipler ve yardımcı fonksiyonlar.
- `supabase/`: Veritabanı şemaları ve migrasyon dosyaları.

## Kurulum

```bash
pnpm install
pnpm dev
```

## Lisans

MIT
