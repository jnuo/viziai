-- MT-002: Turkish descriptions for hemogram metrics (36 metrics)
-- Applied to Neon test branch: metric-translations-test (ep-dry-firefly-ag9z6ef3)

-- Bazofil# (bazofil_abs)
UPDATE metric_translations SET description = 'Bağışıklık sisteminde görev alan bir beyaz kan hücresi türüdür. Alerjik tepkilerde ve bağışıklık yanıtında rol oynar.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'bazofil_abs')
  AND locale = 'tr';

-- Bazofil% (bazofil_pct)
UPDATE metric_translations SET description = 'Beyaz kan hücreleri içinde bazofillerin yüzdesini gösterir. Bağışıklık sisteminizin dengesi hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'bazofil_pct')
  AND locale = 'tr';

-- Eozinofil# (eozinofil_abs)
UPDATE metric_translations SET description = 'Bağışıklık sisteminde görev alan bir beyaz kan hücresi türüdür. Alerjik tepkilerde ve parazitlere karşı savunmada rol oynar.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'eozinofil_abs')
  AND locale = 'tr';

-- Eozinofil% (eozinofil_pct)
UPDATE metric_translations SET description = 'Beyaz kan hücreleri içinde eozinofillerin yüzdesini gösterir. Bağışıklık yanıtınız hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'eozinofil_pct')
  AND locale = 'tr';

-- Eritroblast# (eritroblast_abs)
UPDATE metric_translations SET description = 'Kemik iliğinde üretilen ve olgunlaşarak kırmızı kan hücresine dönüşen genç hücrelerdir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'eritroblast_abs')
  AND locale = 'tr';

-- Eritroblast% (eritroblast_pct)
UPDATE metric_translations SET description = 'Kanda bulunan olgunlaşmamış kırmızı kan hücrelerinin yüzdesini gösterir. Kemik iliğinizin çalışması hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'eritroblast_pct')
  AND locale = 'tr';

-- Eritrosit (eritrosit)
UPDATE metric_translations SET description = 'Kırmızı kan hücreleridir ve vücudunuzun tüm dokularına oksijen taşırlar.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'eritrosit')
  AND locale = 'tr';

-- Hematokrit (hematokrit)
UPDATE metric_translations SET description = 'Kanınızdaki kırmızı kan hücrelerinin toplam kan hacmine oranını gösterir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'hematokrit')
  AND locale = 'tr';

-- Hemoglobin (hemoglobin)
UPDATE metric_translations SET description = 'Kırmızı kan hücrelerinde bulunan ve akciğerlerden vücudunuza oksijen taşıyan bir proteindir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'hemoglobin')
  AND locale = 'tr';

-- HFR (hfr)
UPDATE metric_translations SET description = 'Kemik iliğinden yeni çıkan en genç retikülositlerin oranını gösterir. Kemik iliğinizin kan hücresi üretim hızı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'hfr')
  AND locale = 'tr';

-- İmmatür Granülosit # (ig_abs)
UPDATE metric_translations SET description = 'Kemik iliğinde henüz olgunlaşmamış genç beyaz kan hücrelerinin sayısıdır. Bağışıklık sisteminizin durumu hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'ig_abs')
  AND locale = 'tr';

-- İmmatür Granülosit % (ig_pct)
UPDATE metric_translations SET description = 'Henüz olgunlaşmamış genç beyaz kan hücrelerinin toplam beyaz kan hücrelerine oranıdır.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'ig_pct')
  AND locale = 'tr';

-- IRF (irf)
UPDATE metric_translations SET description = 'Kemik iliğinden yeni çıkan genç kırmızı kan hücrelerinin oranını gösterir. Kemik iliğinizin üretim kapasitesi hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'irf')
  AND locale = 'tr';

-- Lenfosit# (lenfosit_abs)
UPDATE metric_translations SET description = 'Bağışıklık sisteminin temel hücrelerinden biridir. Vücudunuzu enfeksiyonlara karşı korur.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'lenfosit_abs')
  AND locale = 'tr';

-- Lenfosit% (lenfosit_pct)
UPDATE metric_translations SET description = 'Beyaz kan hücreleri içinde lenfositlerin yüzdesini gösterir. Bağışıklık sisteminizin dengesi hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'lenfosit_pct')
  AND locale = 'tr';

-- LFR (lfr)
UPDATE metric_translations SET description = 'Olgun retikülositlerin oranını gösterir. Kırmızı kan hücrelerinin olgunlaşma süreci hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'lfr')
  AND locale = 'tr';

-- Lökosit (lokosit)
UPDATE metric_translations SET description = 'Beyaz kan hücreleridir ve vücudunuzu enfeksiyonlara karşı savunur. Bağışıklık sisteminizin genel durumunu gösterir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'lokosit')
  AND locale = 'tr';

-- MCH (mch)
UPDATE metric_translations SET description = 'Bir kırmızı kan hücresindeki ortalama hemoglobin miktarını gösterir. Kanınızın oksijen taşıma kapasitesi hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'mch')
  AND locale = 'tr';

-- MCHC (mchc)
UPDATE metric_translations SET description = 'Kırmızı kan hücrelerindeki hemoglobin yoğunluğunu gösterir. Kanınızın oksijen taşıma kapasitesi hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'mchc')
  AND locale = 'tr';

-- MCV (mcv)
UPDATE metric_translations SET description = 'Kırmızı kan hücrelerinizin ortalama büyüklüğünü gösterir. Kan hücresi üretimi hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'mcv')
  AND locale = 'tr';

-- MFR (mfr)
UPDATE metric_translations SET description = 'Orta olgunluktaki retikülositlerin oranını gösterir. Kırmızı kan hücrelerinin olgunlaşma süreci hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'mfr')
  AND locale = 'tr';

-- Monosit# (monosit_abs)
UPDATE metric_translations SET description = 'Bağışıklık sisteminde görev alan büyük beyaz kan hücreleridir. Vücudunuzu zararlı mikroorganizmalara karşı korurlar.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'monosit_abs')
  AND locale = 'tr';

-- Monosit% (monosit_pct)
UPDATE metric_translations SET description = 'Beyaz kan hücreleri içinde monositlerin yüzdesini gösterir. Bağışıklık sisteminizin dengesi hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'monosit_pct')
  AND locale = 'tr';

-- MPV (mpv)
UPDATE metric_translations SET description = 'Trombositlerinizin ortalama büyüklüğünü gösterir. Kemik iliğinizin trombosit üretimi hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'mpv')
  AND locale = 'tr';

-- NLR (nlr)
UPDATE metric_translations SET description = 'Nötrofil ve lenfosit sayılarının birbirine oranıdır. Vücudunuzdaki genel bağışıklık dengesi hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'nlr')
  AND locale = 'tr';

-- Nötrofil# (notrofil_abs)
UPDATE metric_translations SET description = 'Bağışıklık sisteminin en yaygın beyaz kan hücresidir. Vücudunuzu bakterilere karşı savunmada önemli rol oynar.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'notrofil_abs')
  AND locale = 'tr';

-- Nötrofil% (notrofil_pct)
UPDATE metric_translations SET description = 'Beyaz kan hücreleri içinde nötrofillerin yüzdesini gösterir. Bağışıklık sisteminizin dengesi hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'notrofil_pct')
  AND locale = 'tr';

-- PCT (pct)
UPDATE metric_translations SET description = 'Kanınızdaki trombositlerin toplam kan hacmine oranını gösterir. Pıhtılaşma sisteminiz hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'pct')
  AND locale = 'tr';

-- PDW (pdw)
UPDATE metric_translations SET description = 'Trombositlerinizin büyüklük farklılıklarını gösterir. Kemik iliğinizin trombosit üretimi hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'pdw')
  AND locale = 'tr';

-- P-LCR (plcr)
UPDATE metric_translations SET description = 'Büyük trombositlerin toplam trombositlere oranını gösterir. Trombosit üretimi hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'plcr')
  AND locale = 'tr';

-- RDW (rdw)
UPDATE metric_translations SET description = 'Kırmızı kan hücrelerinizin büyüklük farklılıklarını gösterir. Kan hücresi üretimi hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'rdw')
  AND locale = 'tr';

-- RDW-CV (rdw_cv)
UPDATE metric_translations SET description = 'Kırmızı kan hücrelerinin büyüklük dağılımını yüzde olarak gösterir. Kan hücresi üretiminin düzeni hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'rdw_cv')
  AND locale = 'tr';

-- RDW-SD (rdw_sd)
UPDATE metric_translations SET description = 'Kırmızı kan hücrelerinin büyüklük dağılımını standart sapma olarak gösterir. Kan hücresi çeşitliliği hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'rdw_sd')
  AND locale = 'tr';

-- Retikülosit # (reticulocyte_abs)
UPDATE metric_translations SET description = 'Kemik iliğinden yeni çıkan genç kırmızı kan hücrelerinin sayısıdır. Kemik iliğinizin üretim hızı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'reticulocyte_abs')
  AND locale = 'tr';

-- Retikülosit % (reticulocyte_pct)
UPDATE metric_translations SET description = 'Genç kırmızı kan hücrelerinin toplam kırmızı kan hücrelerine oranıdır. Kemik iliğinizin çalışması hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'reticulocyte_pct')
  AND locale = 'tr';

-- Trombosit (trombosit)
UPDATE metric_translations SET description = 'Kan pulcuklarıdır ve kanın pıhtılaşmasında görev alırlar. Yaralanmalarda kanamanın durmasını sağlarlar.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'trombosit')
  AND locale = 'tr';
