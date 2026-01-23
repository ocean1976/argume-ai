# Argume.ai Proje Durum ve Devir Raporu

**Tarih:** 23 Ocak 2026
**Yazar:** Manus AI

Bu rapor, Argume.ai projesinin mevcut durumunu, teknik mimarisini, uygulanan son UX iyileştirmelerini ve gelecekteki yol haritasını detaylandırmak amacıyla hazırlanmıştır. Bu doküman, projenin devralınması veya bağlamının başka bir yapay zeka modeline aktarılması için eksiksiz bir kaynak görevi görecektir.

## 1. Proje Vizyonu ve Konsepti

Argume.ai, kullanıcıların tek bir yapay zeka modeline güvenmek yerine, bir "AI Konseyi"ne danışmasını sağlayan bir platformdur. Temel konsept, bir soru sorulduğunda birden fazla AI modelinin kendi aralarında tartışması, farklı perspektifler sunması ve böylece kullanıcıya daha kapsamlı ve dengeli bir cevap sunulmasıdır. Slogan: **"Tek bir AI'a sorma. Meclise danış."**

## 2. Teknik Stack ve Mimari

Proje, modern ve ölçeklenebilir bir monorepo yapısı üzerine kurulmuştur.

| Bileşen | Teknoloji | Amaç |
| :--- | :--- | :--- |
| **Monorepo Yöneticisi** | Turborepo + pnpm | Hızlı build süreleri, kod paylaşımı ve bağımlılık yönetimi. |
| **Frontend** | Next.js 14 (App Router) | Hızlı, SEO dostu ve sunucu bileşenlerini destekleyen modern web uygulaması. |
| **Styling** | Tailwind CSS | Hızlı ve esnek UI geliştirme, Claude.ai tarzı light theme. |
| **Backend & DB** | Supabase (PostgreSQL) | Veritabanı, kimlik doğrulama (gelecekte) ve gerçek zamanlı özellikler için. |
| **UI Kit** | Shadcn-style Components | Profesyonel ve erişilebilir UI bileşenleri. |

### Monorepo Yapısı

| Dizin | İçerik | Açıklama |
| :--- | :--- | :--- |
| `apps/web` | Next.js Uygulaması | Frontend ve API rotalarını barındırır. |
| `packages/orchestrator` | (Henüz boş) | AI modelleri arasındaki tartışmayı yönetecek ana mantık (gelecek). |
| `packages/models` | (Henüz boş) | Farklı AI modelleri için adaptörler ve konfigürasyonlar (gelecek). |
| `packages/shared` | Utility Fonksiyonları | `apps/web` ve diğer paketler arasında paylaşılan kodlar (`cn`, `lib/utils` vb.). |

## 3. Mevcut İlerleme ve Durum

Proje, temel altyapı ve kullanıcı arayüzü açısından büyük ölçüde tamamlanmıştır.

### A. Veritabanı ve API
*   **Supabase Entegrasyonu:** Sunucu ve istemci tarafı için Supabase client konfigürasyonu tamamlandı.
*   **Veritabanı Şeması:** `profiles`, `waitlist`, `conversations`, ve `messages` tabloları için SQL migrasyonları ve RLS politikaları oluşturuldu.
*   **Waitlist API:** `/api/waitlist` POST endpoint'i e-posta doğrulama ve mükerrer kayıt kontrolü ile çalışır durumda.

### B. Kullanıcı Arayüzü (Chat UI)
*   **Tasarım:** Claude.ai tarzı profesyonel light theme (`#F9F8F6` arka plan) benimsendi.
*   **Bileşenler:** `MessageBubble.tsx`, `InterjectionNote.tsx`, `Sidebar.tsx`, `ChatInput.tsx` gibi ana bileşenler mock data ile hazırlandı.
*   **Model Renk Paleti:** Tartışmacı AI modelleri için özelleştirilmiş renkler tanımlandı:
    *   DeepSeek: Mor (`#8B5CF6`)
    *   Claude: Turuncu (`#F59E0B`)
    *   GPT: Yeşil (`#10B981`)
    *   Gemini: Mavi (`#3B82F6`)
    *   Grok: Kırmızı (`#EF4444`)

### C. Son UX İyileştirmeleri (Manus Tarafından Uygulanan)
| Alan | Yapılan İyileştirme |
| :--- | :--- |
| **Logo** | Spartan Kaskı logosu entegre edildi (`public/logo.png`). Sidebar, Landing Page ve Favicon güncellendi. |
| **Sidebar** | Alt kısma ikonlu "Krediler" ve "Ayarlar" butonları eklendi. |
| **Mesaj Balonları** | Timestamp'ler balon içine (sağ alt) taşındı ve padding/spacing ayarları optimize edildi. |
| **Dipnotlar** | İkon mantığı sadeleştirildi ve görsel hiyerarşiyi güçlendirmek için girinti (indentation) eklendi. |
| **Vercel Sorunu** | CSS yükleme sorunu için Vercel build cache'ini temizlemeye yönelik `vercel.json` dosyası eklendi. |

## 4. Kritik Dosya Yolları

Aşağıdaki dosyalar, projenin temelini oluşturur ve herhangi bir değişikliğin bu dosyalardan başlaması önerilir:

*   `/home/ubuntu/argume-ai/apps/web/app/(app)/chat/page.tsx`: Ana Chat Arayüzü.
*   `/home/ubuntu/argume-ai/apps/web/components/chat/Sidebar.tsx`: Sidebar bileşeni.
*   `/home/ubuntu/argume-ai/apps/web/components/chat/MessageBubble.tsx`: Mesaj kartı yapısı.
*   `/home/ubuntu/argume-ai/apps/web/app/globals.css`: Tailwind direktifleri ve global stiller.
*   `/home/ubuntu/argume-ai/apps/web/lib/supabase.ts`: Supabase client konfigürasyonu.

## 5. Sıradaki Adımlar (Roadmap)

Projenin bir sonraki aşaması için önerilen yol haritası:

1.  **AI Entegrasyonu:** Mock data yerine `packages/orchestrator` ve `packages/models` paketlerini kullanarak gerçek AI modellerini (örneğin OpenAI, Perplexity, OpenRouter) entegre etmek.
2.  **Kullanıcı Kimlik Doğrulama (Auth):** Supabase Auth kullanarak kullanıcı kayıt ve giriş işlemlerini tamamlamak.
3.  **Veri Kalıcılığı:** Gerçek konuşmaları Supabase veritabanına kaydetmek ve sidebar'daki konuşma listesini dinamik hale getirmek.
4.  **Kredi Sistemi:** Kullanıcıların kalan kredi miktarını yöneten ve gösteren arka plan mantığını uygulamak.

Bu raporu, Claude'a iletmek üzere bir Markdown dosyası olarak hazırladım. Dosyayı GitHub'a ekliyorum ve size iletiyorum.
