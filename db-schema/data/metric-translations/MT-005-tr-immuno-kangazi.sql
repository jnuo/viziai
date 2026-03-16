-- MT-005: Turkish descriptions for immunoloji (12) + kan_gazi (12) metrics
-- Applied to Neon test branch: metric-translations-test (ep-dry-firefly-ag9z6ef3)

-- ==================
-- İMMÜNOLOJİ (12)
-- ==================

-- Anti CMV IgG (anti_cmv_igg)
UPDATE metric_translations SET description = 'Sitomegalovirüs (CMV) ile daha önce karşılaşıp karşılaşmadığınızı gösteren bir antikordur.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'anti_cmv_igg')
  AND locale = 'tr';

-- Anti CMV IgM (anti_cmv_igm)
UPDATE metric_translations SET description = 'Sitomegalovirüs (CMV) ile yakın zamanda karşılaşıp karşılaşmadığınızı gösteren bir antikordur.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'anti_cmv_igm')
  AND locale = 'tr';

-- Anti HCV (anti_hcv)
UPDATE metric_translations SET description = 'Hepatit C virüsüne karşı vücudunuzun ürettiği antikorları tespit eder.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'anti_hcv')
  AND locale = 'tr';

-- Anti HIV (anti_hiv)
UPDATE metric_translations SET description = 'HIV virüsüne karşı vücudunuzun ürettiği antikorları tespit eder.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'anti_hiv')
  AND locale = 'tr';

-- Anti Rubella IgG (anti_rubella_igg)
UPDATE metric_translations SET description = 'Kızamıkçık virüsüne karşı bağışıklığınız olup olmadığını gösteren bir antikordur.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'anti_rubella_igg')
  AND locale = 'tr';

-- Anti Rubella IgM (anti_rubella_igm)
UPDATE metric_translations SET description = 'Kızamıkçık virüsü ile yakın zamanda karşılaşıp karşılaşmadığınızı gösteren bir antikordur.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'anti_rubella_igm')
  AND locale = 'tr';

-- Anti Toxoplazma IgG (anti_toxo_igg)
UPDATE metric_translations SET description = 'Toksoplazma paraziti ile daha önce karşılaşıp karşılaşmadığınızı gösteren bir antikordur.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'anti_toxo_igg')
  AND locale = 'tr';

-- Anti Toxoplazma IgM (anti_toxo_igm)
UPDATE metric_translations SET description = 'Toksoplazma paraziti ile yakın zamanda karşılaşıp karşılaşmadığınızı gösteren bir antikordur.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'anti_toxo_igm')
  AND locale = 'tr';

-- HBsAg (hbsag)
UPDATE metric_translations SET description = 'Hepatit B virüsünün yüzey antijenini tespit eder. Hepatit B taşıyıcılığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'hbsag')
  AND locale = 'tr';

-- Romatoid Faktör (romatoid_faktor)
UPDATE metric_translations SET description = 'Bağışıklık sisteminin ürettiği bir antikordur. Eklem sağlığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'romatoid_faktor')
  AND locale = 'tr';

-- Total IgE (total_ige)
UPDATE metric_translations SET description = 'Bağışıklık sisteminin ürettiği ve alerjik tepkilerde rol oynayan bir antikor türüdür.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'total_ige')
  AND locale = 'tr';

-- VDRL-RPR (vdrl_rpr)
UPDATE metric_translations SET description = 'Sifiliz enfeksiyonuna karşı vücudunuzun ürettiği antikorları tespit eden bir tarama testidir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'vdrl_rpr')
  AND locale = 'tr';

-- ==================
-- KAN GAZI (12)
-- ==================

-- Anyon Açığı (anion_gap)
UPDATE metric_translations SET description = 'Kanınızdaki pozitif ve negatif yüklü iyonlar arasındaki farkı gösterir. Asit-baz dengeniz hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'anion_gap')
  AND locale = 'tr';

-- BE-b (be_b)
UPDATE metric_translations SET description = 'Kanınızdaki baz fazlalığını veya eksikliğini gösterir. Vücudunuzun asit-baz dengesi hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'be_b')
  AND locale = 'tr';

-- BE-ecf (be_ecf)
UPDATE metric_translations SET description = 'Hücre dışı sıvıdaki baz fazlalığını gösterir. Vücudunuzun asit-baz dengesi hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'be_ecf')
  AND locale = 'tr';

-- HCO3 (hco3)
UPDATE metric_translations SET description = 'Kanınızdaki bikarbonat düzeyini gösterir. Böbreklerinizin asit-baz dengesini düzenleme kapasitesi hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'hco3')
  AND locale = 'tr';

-- İyonize Kalsiyum (ionized_calcium)
UPDATE metric_translations SET description = 'Kanınızda serbest halde dolaşan aktif kalsiyum miktarını gösterir. Kas ve sinir fonksiyonları için önemlidir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'ionized_calcium')
  AND locale = 'tr';

-- Laktat (lactate)
UPDATE metric_translations SET description = 'Hücrelerin oksijensiz enerji üretimi sırasında oluşan bir maddedir. Dokuların oksijen kullanımı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'lactate')
  AND locale = 'tr';

-- PCO2 (pco2)
UPDATE metric_translations SET description = 'Kanınızdaki karbondioksit basıncını gösterir. Akciğerlerinizin ne kadar iyi çalıştığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'pco2')
  AND locale = 'tr';

-- PO2 (po2)
UPDATE metric_translations SET description = 'Kanınızdaki oksijen basıncını gösterir. Akciğerlerinizin oksijen alma kapasitesi hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'po2')
  AND locale = 'tr';

-- SBC (sbc)
UPDATE metric_translations SET description = 'Standart koşullarda kanınızdaki bikarbonat düzeyini gösterir. Asit-baz dengeniz hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'sbc')
  AND locale = 'tr';

-- Oksijen Satürasyonu (spo2)
UPDATE metric_translations SET description = 'Hemoglobinin ne kadarının oksijen taşıdığını yüzde olarak gösterir. Vücudunuzun oksijen durumu hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'spo2')
  AND locale = 'tr';

-- TCO2 (tco2)
UPDATE metric_translations SET description = 'Kanınızdaki toplam karbondioksit miktarını gösterir. Asit-baz dengeniz hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'tco2')
  AND locale = 'tr';

-- tHb (thb)
UPDATE metric_translations SET description = 'Kan gazı analizinde ölçülen toplam hemoglobin miktarıdır. Kanınızın oksijen taşıma kapasitesini gösterir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'thb')
  AND locale = 'tr';
