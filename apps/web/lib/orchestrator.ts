/**
 * Mesajı analiz eder ve hangi Tier (iş akışı) seviyesinde işleneceğine karar verir.
 */
export const getTier = (message: string): string => {
  const msg = message.toLowerCase();
  
  // T1 - Basit (tek cevap yeterli)
  const t1Keywords = [
    'merhaba', 'selam', 'hey', 'hi', 'hello',
    'teşekkür', 'sağol', 'thanks',
    'nedir', 'ne demek',
    'nasıl yapılır', 'nasıl açılır'
  ];
  if (t1Keywords.some(k => msg.includes(k))) {
    return 'T1';
  }
  
  // T3 - Kritik (kapışma + sentez ZORUNLU)
  // ÖNCELİKLİ! T2.5'ten önce kontrol edilir
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
  
  // T2.5 - Önemli (kapışma, antitez ZORUNLU)
  const t25Keywords = [
    'mı', 'mi', 'mu', 'mü',
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
  
  // T2 - Orta (varsayılan)
  return 'T2';
};
