-- MT-006: Turkish descriptions for remaining categories (43 metrics)
-- Categories: demir, diger, enflamasyon, hormon, karaciger, kardiyak, koagulasyon, lipid, tiroid, tumor_belirtecleri, vitamin
-- Applied to Neon test branch: metric-translations-test (ep-raspy-bar-agiah0ev)

-- ==================
-- DEMİR (5)
-- ==================

-- Demir (demir)
UPDATE metric_translations SET description = 'Kanınızdaki demir seviyesini gösterir. Vücudunuz oksijen taşıma ve enerji üretimi için demire ihtiyaç duyar.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'demir')
  AND locale = 'tr';

-- Ferritin (ferritin)
UPDATE metric_translations SET description = 'Vücudunuzda demiri depolayan bir proteindir. Demir düzeyiniz hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'ferritin')
  AND locale = 'tr';

-- TDBK (tdbk)
UPDATE metric_translations SET description = 'Kanınızdaki proteinlerin ne kadar demir taşıyabileceğini gösterir. Demir dengesi hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'tdbk')
  AND locale = 'tr';

-- Transferrin Satürasyonu (transferrin_sat)
UPDATE metric_translations SET description = 'Demir taşıyan transferrin proteininin ne kadarının demir ile dolu olduğunu gösterir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'transferrin_sat')
  AND locale = 'tr';

-- UIBC (uibc)
UPDATE metric_translations SET description = 'Kanınızdaki proteinlerin daha ne kadar demir bağlayabileceğini gösterir. Demir dengesi hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'uibc')
  AND locale = 'tr';

-- ==================
-- DİĞER (2)
-- ==================

-- HbA1c (hba1c)
UPDATE metric_translations SET description = 'Son iki-üç aydaki ortalama kan şekeri seviyenizi gösterir. Uzun vadeli şeker kontrolünüz hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'hba1c')
  AND locale = 'tr';

-- Parathormon (parathormon)
UPDATE metric_translations SET description = 'Paratiroit bezlerinin ürettiği bir hormondur. Kalsiyum ve fosfor dengesini düzenlemeye yardımcı olur.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'parathormon')
  AND locale = 'tr';

-- ==================
-- ENFLAMASYON (3)
-- ==================

-- CRP (crp)
UPDATE metric_translations SET description = 'Karaciğerinizin ürettiği bir proteindir. Vücudunuzda bir iltihaplanma olup olmadığını gösterir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'crp')
  AND locale = 'tr';

-- Prokalsitonin (prokalsitonin)
UPDATE metric_translations SET description = 'Vücudunuzda üretilen bir proteindir. Bakteriyel bir enfeksiyonun varlığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'prokalsitonin')
  AND locale = 'tr';

-- Sedimantasyon (sedimantasyon)
UPDATE metric_translations SET description = 'Kırmızı kan hücrelerinin çökme hızını ölçer. Vücudunuzda iltihaplanma olup olmadığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'sedimantasyon')
  AND locale = 'tr';

-- ==================
-- HORMON (2)
-- ==================

-- Beta-hCG (beta_hcg)
UPDATE metric_translations SET description = 'Gebelik sırasında artan bir hormondur. Gebelik durumu ve takibi için ölçülür.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'beta_hcg')
  AND locale = 'tr';

-- İnsülin (insulin)
UPDATE metric_translations SET description = 'Pankreastan salgılanan bir hormondur. Kan şekerinizin hücrelere taşınmasını ve enerji olarak kullanılmasını sağlar.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'insulin')
  AND locale = 'tr';

-- ==================
-- KARACİĞER (8)
-- ==================

-- ALP (alp)
UPDATE metric_translations SET description = 'Karaciğer ve kemiklerde bulunan bir enzimdir. Karaciğer ve kemik sağlığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'alp')
  AND locale = 'tr';

-- ALT (alt)
UPDATE metric_translations SET description = 'Karaciğerinizde bulunan bir enzimdir. Karaciğer sağlığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'alt')
  AND locale = 'tr';

-- AST (ast)
UPDATE metric_translations SET description = 'Karaciğer, kalp ve kaslarda bulunan bir enzimdir. Özellikle karaciğer sağlığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'ast')
  AND locale = 'tr';

-- Direkt Bilirubin (direkt_bilirubin)
UPDATE metric_translations SET description = 'Karaciğerinizin işlediği bilirubin miktarını gösterir. Karaciğer ve safra yolları sağlığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'direkt_bilirubin')
  AND locale = 'tr';

-- GGT (ggt)
UPDATE metric_translations SET description = 'Karaciğer ve safra yollarında bulunan bir enzimdir. Karaciğer sağlığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'ggt')
  AND locale = 'tr';

-- İndirekt Bilirubin (indirekt_bilirubin)
UPDATE metric_translations SET description = 'Kırmızı kan hücrelerinin parçalanmasıyla oluşan ve henüz karaciğer tarafından işlenmemiş bilirubin miktarını gösterir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'indirekt_bilirubin')
  AND locale = 'tr';

-- LDH (ldh)
UPDATE metric_translations SET description = 'Vücudunuzdaki birçok dokuda bulunan bir enzimdir. Hücre sağlığı ve doku bütünlüğü hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'ldh')
  AND locale = 'tr';

-- Total Bilirubin (total_bilirubin)
UPDATE metric_translations SET description = 'Kırmızı kan hücrelerinin parçalanmasıyla oluşan sarı renkli bir maddedir. Karaciğer sağlığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'total_bilirubin')
  AND locale = 'tr';

-- ==================
-- KARDİYAK (1)
-- ==================

-- Troponin I (troponin_i)
UPDATE metric_translations SET description = 'Kalp kasında bulunan bir proteindir. Kalp kası sağlığı hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'troponin_i')
  AND locale = 'tr';

-- ==================
-- KOAGÜLASYON (6)
-- ==================

-- APTT (aptt)
UPDATE metric_translations SET description = 'Kanınızın pıhtılaşma süresini ölçen bir testtir. Pıhtılaşma sisteminizin çalışması hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'aptt')
  AND locale = 'tr';

-- D-Dimer (d_dimer)
UPDATE metric_translations SET description = 'Kan pıhtısının çözülmesi sırasında oluşan bir protein parçasıdır. Pıhtılaşma sisteminiz hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'd_dimer')
  AND locale = 'tr';

-- Fibrinojen (fibrinojen)
UPDATE metric_translations SET description = 'Karaciğerinizin ürettiği ve kanın pıhtılaşmasında görev alan bir proteindir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'fibrinojen')
  AND locale = 'tr';

-- INR (inr)
UPDATE metric_translations SET description = 'Kanınızın pıhtılaşma hızını standart bir ölçekle gösterir. Pıhtılaşma sisteminiz hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'inr')
  AND locale = 'tr';

-- Protrombin Zamanı (pt)
UPDATE metric_translations SET description = 'Kanınızın pıhtılaşması için geçen süreyi ölçer. Pıhtılaşma faktörleriniz hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'pt')
  AND locale = 'tr';

-- Protrombin Zamanı % Aktivite (pt_activity)
UPDATE metric_translations SET description = 'Pıhtılaşma faktörlerinizin aktivite yüzdesini gösterir. Pıhtılaşma sisteminizin çalışma düzeyi hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'pt_activity')
  AND locale = 'tr';

-- ==================
-- LİPİD (6)
-- ==================

-- HDL Kolesterol (hdl)
UPDATE metric_translations SET description = 'İyi kolesterol olarak bilinen bir yağ türüdür. Damar sağlığınızı korumaya yardımcı olur.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'hdl')
  AND locale = 'tr';

-- LDL Kolesterol (ldl)
UPDATE metric_translations SET description = 'Kötü kolesterol olarak bilinen bir yağ türüdür. Damar sağlığınız hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'ldl')
  AND locale = 'tr';

-- Non-HDL Kolesterol (non_hdl)
UPDATE metric_translations SET description = 'HDL dışındaki tüm kolesterol türlerinin toplamını gösterir. Damar sağlığınız hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'non_hdl')
  AND locale = 'tr';

-- Total Kolesterol (total_kolesterol)
UPDATE metric_translations SET description = 'Kanınızdaki yağımsı bir maddedir. Vücudunuz hücre yapımı ve hormon üretimi için kullanır.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'total_kolesterol')
  AND locale = 'tr';

-- Trigliserid (trigliserid)
UPDATE metric_translations SET description = 'Kanınızdaki bir yağ türüdür. Vücudunuz enerji depolamak ve kullanmak için trigliseride ihtiyaç duyar.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'trigliserid')
  AND locale = 'tr';

-- VLDL Kolesterol (vldl)
UPDATE metric_translations SET description = 'Karaciğerinizin ürettiği bir lipoprotein türüdür. Trigliseridlerin vücutta taşınmasında görev alır.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'vldl')
  AND locale = 'tr';

-- ==================
-- TİROİD (3)
-- ==================

-- Serbest T3 (serbest_t3)
UPDATE metric_translations SET description = 'Tiroit bezinizin ürettiği aktif bir hormondur. Metabolizma hızınız ve enerji düzeyiniz hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'serbest_t3')
  AND locale = 'tr';

-- Serbest T4 (serbest_t4)
UPDATE metric_translations SET description = 'Tiroit bezinizin ürettiği bir hormondur. Tiroit fonksiyonlarınız ve metabolizmanız hakkında bilgi verir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'serbest_t4')
  AND locale = 'tr';

-- TSH (tsh)
UPDATE metric_translations SET description = 'Beyindeki hipofiz bezinin ürettiği bir hormondur. Tiroit bezinizin ne kadar iyi çalıştığını gösterir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'tsh')
  AND locale = 'tr';

-- ==================
-- TÜMÖR BELİRTEÇLERİ (4)
-- ==================

-- CA-125 (ca125)
UPDATE metric_translations SET description = 'Vücudunuzda bazı hücrelerin ürettiği bir protein belirtecidir. Kadın üreme sistemi sağlığı takibinde kullanılır.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'ca125')
  AND locale = 'tr';

-- CA-15-3 (ca153)
UPDATE metric_translations SET description = 'Vücudunuzda bazı hücrelerin ürettiği bir protein belirtecidir. Meme sağlığı takibinde kullanılır.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'ca153')
  AND locale = 'tr';

-- CA-19-9 (ca199)
UPDATE metric_translations SET description = 'Vücudunuzda bazı hücrelerin ürettiği bir protein belirtecidir. Sindirim sistemi sağlığı takibinde kullanılır.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'ca199')
  AND locale = 'tr';

-- CEA (cea)
UPDATE metric_translations SET description = 'Vücudunuzda üretilen bir protein belirtecidir. Genel sağlık takibinde kullanılan bir laboratuvar değeridir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'cea')
  AND locale = 'tr';

-- ==================
-- VİTAMİN (3)
-- ==================

-- Vitamin B12 (b12)
UPDATE metric_translations SET description = 'Sinir sistemi ve kan hücresi üretimi için gerekli bir vitamindir. Besinlerden elde edilir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'b12')
  AND locale = 'tr';

-- Folik Asit (folik_asit)
UPDATE metric_translations SET description = 'Hücre büyümesi ve kan hücresi üretimi için gerekli bir B vitaminidir. Özellikle gebelikte önemlidir.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'folik_asit')
  AND locale = 'tr';

-- Vitamin D (vitamin_d)
UPDATE metric_translations SET description = 'Kemik ve diş sağlığı için gerekli olan bir vitamindir. Vücudunuzun kalsiyum kullanmasına yardımcı olur.'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'vitamin_d')
  AND locale = 'tr';
