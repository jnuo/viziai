-- MT-004: Turkish descriptions for idrar metrics (28 metrics)
-- Applied to Neon test branch: metric-translations-test (ep-dry-firefly-ag9z6ef3)

-- 24 Saat İdrar Kreatinin (idrar_24h_kreatinin)
UPDATE metric_translations SET description = 'Böbreklerinizin 24 saatte süzdüğü kreatinin miktarını gösterir. Böbrek fonksiyonunuz hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_24h_kreatinin')
  AND locale = 'tr';

-- 24 Saat İdrar Mikroalbümin (idrar_24h_mikroalbumin)
UPDATE metric_translations SET description = 'İdrarda 24 saat boyunca atılan çok küçük miktardaki albümin proteinini ölçer. Böbrek sağlığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_24h_mikroalbumin')
  AND locale = 'tr';

-- 24 Saat İdrar Protein (idrar_24h_protein)
UPDATE metric_translations SET description = 'İdrarda 24 saat boyunca atılan toplam protein miktarını gösterir. Böbreklerinizin süzme fonksiyonu hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_24h_protein')
  AND locale = 'tr';

-- İdrar Albümin (idrar_albumin)
UPDATE metric_translations SET description = 'İdrardaki albümin protein miktarını gösterir. Böbreklerinizin süzme fonksiyonu hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_albumin')
  AND locale = 'tr';

-- İdrar Albümin/Kreatinin Oranı (idrar_albumin_kreatinin)
UPDATE metric_translations SET description = 'İdrardaki albümin ve kreatinin oranını gösterir. Böbrek fonksiyonunuzu değerlendirmek için kullanılır.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_albumin_kreatinin')
  AND locale = 'tr';

-- İdrar Amorf Fosfat (idrar_amorf_fosfat)
UPDATE metric_translations SET description = 'İdrarda bulunan fosfat kristalleridir. İdrar yapısı ve mineral dengesi hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_amorf_fosfat')
  AND locale = 'tr';

-- İdrar Keton (idrar_asetoasetat)
UPDATE metric_translations SET description = 'Vücudunuz yağları enerji olarak kullandığında oluşan maddelerin idrardaki miktarını gösterir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_asetoasetat')
  AND locale = 'tr';

-- İdrar Bakteri (idrar_bakteri)
UPDATE metric_translations SET description = 'İdrarda bakteri bulunup bulunmadığını gösterir. İdrar yolu sağlığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_bakteri')
  AND locale = 'tr';

-- İdrar Bilirubin (idrar_bilirubin)
UPDATE metric_translations SET description = 'Kırmızı kan hücrelerinin parçalanmasıyla oluşan bilirubinin idrardaki miktarını gösterir. Karaciğer sağlığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_bilirubin')
  AND locale = 'tr';

-- İdrar Kalsiyum Oksalat Dihidrat (idrar_ca_oksalat_dihidrat)
UPDATE metric_translations SET description = 'İdrarda bulunan bir kristal türüdür. İdrar mineral yapısı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_ca_oksalat_dihidrat')
  AND locale = 'tr';

-- İdrar Kalsiyum Oksalat Monohidrat (idrar_ca_oksalat_monohidrat)
UPDATE metric_translations SET description = 'İdrarda bulunan bir kristal türüdür. İdrar mineral yapısı ve metabolizma hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_ca_oksalat_monohidrat')
  AND locale = 'tr';

-- İdrar Dansitesi (idrar_dansite)
UPDATE metric_translations SET description = 'İdrarınızın yoğunluğunu gösterir. Böbreklerinizin idrarı ne kadar konsantre edebildiği hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_dansite')
  AND locale = 'tr';

-- İdrar Epitel Hücresi (idrar_epitel)
UPDATE metric_translations SET description = 'İdrar yollarının iç yüzeyinden dökülen hücrelerin miktarını gösterir. İdrar yolu sağlığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_epitel')
  AND locale = 'tr';

-- İdrar Eritrosit (idrar_eritrosit)
UPDATE metric_translations SET description = 'İdrardaki kırmızı kan hücrelerinin sayısını gösterir. Böbrek ve idrar yolu sağlığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_eritrosit')
  AND locale = 'tr';

-- İdrar Glukoz (idrar_glukoz)
UPDATE metric_translations SET description = 'İdrardaki şeker miktarını gösterir. Böbreklerinizin şekeri geri emme kapasitesi hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_glukoz')
  AND locale = 'tr';

-- İdrar Granüler Silendir (idrar_granuler_silendir)
UPDATE metric_translations SET description = 'Böbrek tüplerinde oluşan tanecikli silindirik yapılardır. Böbrek fonksiyonu hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_granuler_silendir')
  AND locale = 'tr';

-- İdrar Hyalen Silendir (idrar_hyalen_silendir)
UPDATE metric_translations SET description = 'Böbrek tüplerinde oluşan saydam silindirik yapılardır. Az miktarda bulunması normaldir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_hyalen_silendir')
  AND locale = 'tr';

-- İdrar Kan (idrar_kan)
UPDATE metric_translations SET description = 'İdrarda kan bulunup bulunmadığını gösterir. Böbrek ve idrar yolu sağlığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_kan')
  AND locale = 'tr';

-- İdrar Kreatinin (idrar_kreatinin)
UPDATE metric_translations SET description = 'İdrardaki kreatinin miktarını gösterir. Böbreklerinizin atıkları ne kadar iyi süzdüğü hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_kreatinin')
  AND locale = 'tr';

-- İdrar Lökosit Mikroskopi (idrar_lokosit)
UPDATE metric_translations SET description = 'İdrardaki beyaz kan hücrelerinin mikroskopta sayılan miktarını gösterir. İdrar yolu sağlığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_lokosit')
  AND locale = 'tr';

-- İdrar Lökosit Esteraz (idrar_lokosit_esteraz)
UPDATE metric_translations SET description = 'Beyaz kan hücrelerinin ürettiği bir enzimi idrarda tespit eder. İdrar yolu sağlığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_lokosit_esteraz')
  AND locale = 'tr';

-- İdrar Maya Hücresi (idrar_maya)
UPDATE metric_translations SET description = 'İdrarda maya mantarı bulunup bulunmadığını gösterir. İdrar yolu sağlığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_maya')
  AND locale = 'tr';

-- İdrar Non-Skuamöz Epitel (idrar_non_skuamoz_epitel)
UPDATE metric_translations SET description = 'İdrar yollarının iç katmanlarından dökülen hücrelerin miktarını gösterir. Böbrek ve idrar yolu sağlığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_non_skuamoz_epitel')
  AND locale = 'tr';

-- İdrar pH (idrar_ph)
UPDATE metric_translations SET description = 'İdrarınızın asitlik veya bazlık derecesini gösterir. Böbreklerinizin asit-baz dengesini düzenleme kapasitesi hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_ph')
  AND locale = 'tr';

-- İdrar Protein (idrar_protein)
UPDATE metric_translations SET description = 'İdrardaki protein miktarını gösterir. Böbreklerinizin süzme fonksiyonu hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_protein')
  AND locale = 'tr';

-- İdrar Ürik Asit Kristali (idrar_urik_asit_kristal)
UPDATE metric_translations SET description = 'İdrarda bulunan ürik asit kristallerini gösterir. İdrar mineral yapısı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_urik_asit_kristal')
  AND locale = 'tr';

-- İdrar Ürobilinojen (idrar_urobilinojen)
UPDATE metric_translations SET description = 'Bilirubinin bağırsaklarda dönüşmesiyle oluşan bir maddenin idrardaki miktarını gösterir. Karaciğer sağlığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_urobilinojen')
  AND locale = 'tr';

-- İdrar Hacmi (idrar_volum)
UPDATE metric_translations SET description = 'Belirli bir sürede toplanan idrar miktarını gösterir. Böbrek fonksiyonu ve sıvı dengesi hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'idrar_volum')
  AND locale = 'tr';
