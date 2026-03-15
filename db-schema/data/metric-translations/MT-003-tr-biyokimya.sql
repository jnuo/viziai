-- MT-003: Turkish descriptions for biyokimya metrics (24 metrics)
-- Applied to Neon test branch: metric-translations-test (ep-dry-firefly-ag9z6ef3)

-- Albümin (albumin)
UPDATE metric_translations SET description = 'Karaciğerinizin ürettiği bir proteindir. Vücudunuzdaki sıvı dengesini korumaya yardımcı olur.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'albumin')
  AND locale = 'tr';

-- Amilaz (amilaz)
UPDATE metric_translations SET description = 'Pankreas ve tükürük bezlerinin ürettiği bir enzimdir. Nişastalı yiyeceklerin sindirilmesine yardımcı olur.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'amilaz')
  AND locale = 'tr';

-- Çinko (cinko)
UPDATE metric_translations SET description = 'Bağışıklık sistemi, yara iyileşmesi ve büyüme için gerekli bir mineraldir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'cinko')
  AND locale = 'tr';

-- Düzeltilmiş Kalsiyum (duzeltilmis_kalsiyum)
UPDATE metric_translations SET description = 'Albümin seviyesine göre düzeltilmiş kalsiyum değeridir. Gerçek kalsiyum düzeyinizi daha doğru gösterir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'duzeltilmis_kalsiyum')
  AND locale = 'tr';

-- eGFR (egfr)
UPDATE metric_translations SET description = 'Böbreklerinizin kanı ne kadar iyi süzdüğünü gösteren hesaplanmış bir değerdir. Böbrek fonksiyonu hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'egfr')
  AND locale = 'tr';

-- Fosfor (fosfor)
UPDATE metric_translations SET description = 'Kemik ve diş yapısında bulunan bir mineraldir. Vücudunuzun enerji üretiminde de rol oynar.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'fosfor')
  AND locale = 'tr';

-- Globulin (globulin)
UPDATE metric_translations SET description = 'Bağışıklık sistemi ve madde taşınması için görev yapan bir protein grubudur.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'globulin')
  AND locale = 'tr';

-- Glukoz (glukoz)
UPDATE metric_translations SET description = 'Kanınızdaki şeker seviyesini gösterir. Vücudunuzun temel enerji kaynağıdır.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'glukoz')
  AND locale = 'tr';

-- Kalsiyum (kalsiyum)
UPDATE metric_translations SET description = 'Kemik ve diş sağlığı için gerekli bir mineraldir. Kas ve sinir fonksiyonlarında da görev alır.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'kalsiyum')
  AND locale = 'tr';

-- Klorür (klorur)
UPDATE metric_translations SET description = 'Vücudunuzdaki sıvı dengesini ve asit-baz dengesini düzenleyen bir elektrolitdir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'klorur')
  AND locale = 'tr';

-- Kreatin Kinaz (kreatin_kinaz)
UPDATE metric_translations SET description = 'Kas, kalp ve beyin dokularında bulunan bir enzimdir. Kas sağlığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'kreatin_kinaz')
  AND locale = 'tr';

-- Kreatinin (kreatinin)
UPDATE metric_translations SET description = 'Kaslarınızın normal çalışması sırasında oluşan bir atık maddedir. Böbreklerinizin ne kadar iyi çalıştığını gösterir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'kreatinin')
  AND locale = 'tr';

-- Kreatinin Klerens (kreatinin_klerens)
UPDATE metric_translations SET description = 'Böbreklerinizin kreatinini kandan ne kadar hızlı temizlediğini gösterir. Böbrek fonksiyonu hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'kreatinin_klerens')
  AND locale = 'tr';

-- Lipaz (lipaz)
UPDATE metric_translations SET description = 'Pankreasın ürettiği yağ sindirimine yardımcı bir enzimdir. Pankreas sağlığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'lipaz')
  AND locale = 'tr';

-- Magnezyum (magnezyum)
UPDATE metric_translations SET description = 'Kas, sinir ve kemik sağlığı için gerekli bir mineraldir. Vücudunuzdaki birçok biyokimyasal süreçte rol oynar.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'magnezyum')
  AND locale = 'tr';

-- OGTT 0.dk (ogtt_0dk)
UPDATE metric_translations SET description = 'Şeker yükleme testi öncesi açlık kan şekeri değeridir. Vücudunuzun şekeri nasıl işlediğini anlamaya yardımcı olur.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'ogtt_0dk')
  AND locale = 'tr';

-- OGTT 60.dk (ogtt_60dk)
UPDATE metric_translations SET description = 'Şeker yükleme testinde birinci saat kan şekeri değeridir. Vücudunuzun şekeri işleme hızını gösterir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'ogtt_60dk')
  AND locale = 'tr';

-- OGTT 120.dk (ogtt_120dk)
UPDATE metric_translations SET description = 'Şeker yükleme testinde ikinci saat kan şekeri değeridir. Vücudunuzun şekeri ne kadar sürede işlediğini gösterir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'ogtt_120dk')
  AND locale = 'tr';

-- Potasyum (potasyum)
UPDATE metric_translations SET description = 'Kaslarınızın ve sinirlerinizin düzgün çalışması için gereken bir mineraldir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'potasyum')
  AND locale = 'tr';

-- Sodyum (sodyum)
UPDATE metric_translations SET description = 'Vücudunuzdaki sıvı dengesini düzenleyen bir mineraldir. Sinir ve kas fonksiyonlarında da görev alır.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'sodyum')
  AND locale = 'tr';

-- Total Protein (total_protein)
UPDATE metric_translations SET description = 'Kanınızdaki toplam protein miktarını gösterir. Genel beslenme ve organ sağlığınız hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'total_protein')
  AND locale = 'tr';

-- Kan Üre Azotu (ure)
UPDATE metric_translations SET description = 'Proteinlerin parçalanması sonucu oluşan bir atık maddedir. Böbrek fonksiyonunuz hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'ure')
  AND locale = 'tr';

-- Üre (urea)
UPDATE metric_translations SET description = 'Karaciğerinizde proteinlerin parçalanmasıyla oluşan bir atık maddedir. Böbreklerinizin bu atığı temizleme kapasitesini gösterir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'urea')
  AND locale = 'tr';

-- Ürik Asit (urik_asit)
UPDATE metric_translations SET description = 'Vücudunuzda purin adlı maddelerin parçalanmasıyla oluşan bir atık maddedir. Böbrekler tarafından atılır.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'urik_asit')
  AND locale = 'tr';
