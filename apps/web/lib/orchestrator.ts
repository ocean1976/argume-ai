/**
 * Mesajı analiz eder ve hangi Tier (iş akışı) seviyesinde işleneceğine karar verir.
 */
export const getTier = (message: string): string => {
  const msg = message.toLowerCase().trim();
  
  // T1 - Basit (ÖNCELİKLİ KONTROL - EN ÜSTTE!)
  const t1Keywords = [
    'merhaba', 'selam', 'hey', 'hi', 'hello',
    'teşekkür', 'sağol', 'thanks', 'teşekkürler',
    'günaydın', 'iyi akşamlar', 'iyi geceler'
  ];
  
  // Tam eşleşme veya başlangıç kontrolü
  if (t1Keywords.some(k => msg === k || msg.startsWith(k + ' ') || msg.startsWith(k + ','))) {
    return 'T1';
  }
  
  // "nedir", "ne demek" gibi basit tanım soruları
  if (msg.includes('nedir') || msg.includes('ne demek') || msg.includes('nasıl yapılır') || msg.includes('nasıl açılır')) {
    return 'T1';
  }
  
  // Kısa mesajlar (2 kelime veya daha az, soru yok) → T1
  const wordCount = msg.split(' ').length;
  if (wordCount <= 2 && !msg.includes('?') && !msg.includes('mı') && !msg.includes('mi')) {
    return 'T1';
  }
  
  // T3 - Kritik (yüksek risk)
  const t3Keywords = [
    'yatırım', 'para', 'maaş', 'bütçe', 'fiyat',
    'sağlık', 'hastalık', 'ağrı', 'ilaç', 'doktor',
    'kariyer', 'istifa', 'terfi', 'iş değişikliği',
    'hukuk', 'dava', 'avukat', 'sözleşme',
    'boşanma', 'ayrılık', 'evlilik',
    'almalı mıyım', 'yapmalı mıyım', 'etmeli miyim'
  ];
  if (t3Keywords.some(k => msg.includes(k))) {
    return 'T3';
  }
  
  // T2.5 - Önemli (karar, karşılaştırma)
  const t25Keywords = [
    'hangisi', 'hangi',
    'önerir misin', 'tavsiye', 'ne dersin',
    'en iyi', 'best', 'ideal',
    'tercih', 'seçmeliyim',
    'avantaj', 'dezavantaj',
    'karşılaştır', 'vs', 'versus', 'fark'
  ];
  if (t25Keywords.some(k => msg.includes(k))) {
    return 'T2.5';
  }
  
  // "mı/mi" soru eki varsa T2.5
  if (msg.includes(' mı') || msg.includes(' mi') || msg.includes(' mu') || msg.includes(' mü')) {
    return 'T2.5';
  }
  
  // T2 - Orta (varsayılan)
  return 'T2';
};
