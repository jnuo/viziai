-- MT-007: English (EN) translations — display_name + description for all 155 metrics
-- Applied to Neon test branch: metric-translations-test (ep-raspy-bar-agiah0ev)

-- ==================
-- BİYOKİMYA (24)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Albumin', 'A protein made by your liver that helps maintain fluid balance in your body.'
FROM metric_definitions WHERE key = 'albumin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Amylase', 'An enzyme produced by your pancreas and salivary glands that helps digest starchy foods.'
FROM metric_definitions WHERE key = 'amilaz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Zinc', 'A mineral essential for your immune system, wound healing, and growth.'
FROM metric_definitions WHERE key = 'cinko'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Corrected Calcium', 'A calcium value adjusted for your albumin level. Provides a more accurate picture of your calcium status.'
FROM metric_definitions WHERE key = 'duzeltilmis_kalsiyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'eGFR (Estimated Glomerular Filtration Rate)', 'A calculated value showing how well your kidneys filter blood. Provides information about kidney function.'
FROM metric_definitions WHERE key = 'egfr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Phosphorus', 'A mineral found in your bones and teeth. Also plays a role in energy production.'
FROM metric_definitions WHERE key = 'fosfor'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Globulin', 'A group of proteins involved in immune function and substance transport in your body.'
FROM metric_definitions WHERE key = 'globulin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Glucose', 'Shows the sugar level in your blood. It is your body''s main energy source.'
FROM metric_definitions WHERE key = 'glukoz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Calcium', 'A mineral essential for bone and dental health. Also plays a role in muscle and nerve function.'
FROM metric_definitions WHERE key = 'kalsiyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Chloride', 'An electrolyte that helps regulate fluid balance and acid-base balance in your body.'
FROM metric_definitions WHERE key = 'klorur'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Creatine Kinase (CK)', 'An enzyme found in muscle, heart, and brain tissue. Provides information about muscle health.'
FROM metric_definitions WHERE key = 'kreatin_kinaz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Creatinine', 'A waste product from normal muscle activity. Shows how well your kidneys are working.'
FROM metric_definitions WHERE key = 'kreatinin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Creatinine Clearance', 'Shows how quickly your kidneys clear creatinine from the blood. Provides information about kidney function.'
FROM metric_definitions WHERE key = 'kreatinin_klerens'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Lipase', 'An enzyme produced by your pancreas that helps digest fats. Provides information about pancreatic health.'
FROM metric_definitions WHERE key = 'lipaz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Magnesium', 'A mineral essential for muscle, nerve, and bone health. Plays a role in many biochemical processes.'
FROM metric_definitions WHERE key = 'magnezyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'OGTT 75g Fasting (0 min)', 'The fasting blood sugar value before a glucose tolerance test. Helps understand how your body processes sugar.'
FROM metric_definitions WHERE key = 'ogtt_0dk'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'OGTT 75g 60 min', 'The blood sugar value one hour into a glucose tolerance test. Shows how quickly your body processes sugar.'
FROM metric_definitions WHERE key = 'ogtt_60dk'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'OGTT 75g 120 min', 'The blood sugar value two hours into a glucose tolerance test. Shows how long it takes your body to process sugar.'
FROM metric_definitions WHERE key = 'ogtt_120dk'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Potassium', 'A mineral needed for proper muscle and nerve function.'
FROM metric_definitions WHERE key = 'potasyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Sodium', 'A mineral that regulates fluid balance in your body. Also plays a role in nerve and muscle function.'
FROM metric_definitions WHERE key = 'sodyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Total Protein', 'Shows the total amount of protein in your blood. Provides information about overall nutrition and organ health.'
FROM metric_definitions WHERE key = 'total_protein'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Blood Urea Nitrogen (BUN)', 'A waste product from protein breakdown. Provides information about kidney function.'
FROM metric_definitions WHERE key = 'ure'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urea', 'A waste product formed by protein breakdown in your liver. Shows your kidneys'' ability to clear this waste.'
FROM metric_definitions WHERE key = 'urea'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Uric Acid', 'A waste product formed from the breakdown of purines in your body. Eliminated by the kidneys.'
FROM metric_definitions WHERE key = 'urik_asit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- DEMİR (5)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Iron', 'Shows the iron level in your blood. Your body needs iron for oxygen transport and energy production.'
FROM metric_definitions WHERE key = 'demir'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Ferritin', 'A protein that stores iron in your body. Provides information about your iron levels.'
FROM metric_definitions WHERE key = 'ferritin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'TIBC (Total Iron Binding Capacity)', 'Shows how much iron your blood proteins can carry. Provides information about iron balance.'
FROM metric_definitions WHERE key = 'tdbk'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Transferrin Saturation', 'Shows what percentage of your iron-carrying transferrin protein is loaded with iron.'
FROM metric_definitions WHERE key = 'transferrin_sat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'UIBC (Unsaturated Iron Binding Capacity)', 'Shows how much additional iron your blood proteins can still bind. Provides information about iron balance.'
FROM metric_definitions WHERE key = 'uibc'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- DİĞER (2)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'HbA1c (Glycated Hemoglobin)', 'Shows your average blood sugar level over the past two to three months. Provides information about long-term sugar control.'
FROM metric_definitions WHERE key = 'hba1c'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Parathyroid Hormone (PTH)', 'A hormone produced by the parathyroid glands. Helps regulate calcium and phosphorus balance.'
FROM metric_definitions WHERE key = 'parathormon'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- ENFLAMASYON (3)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'CRP (C-Reactive Protein)', 'A protein produced by your liver. Shows whether there is inflammation in your body.'
FROM metric_definitions WHERE key = 'crp'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Procalcitonin', 'A protein produced in your body. Provides information about the presence of bacterial infection.'
FROM metric_definitions WHERE key = 'prokalsitonin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'ESR (Erythrocyte Sedimentation Rate)', 'Measures how quickly red blood cells settle. Provides information about whether there is inflammation in your body.'
FROM metric_definitions WHERE key = 'sedimantasyon'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- HEMOGRAM (36)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Basophil Count', 'A type of white blood cell involved in your immune system. Plays a role in allergic responses and immune reactions.'
FROM metric_definitions WHERE key = 'bazofil_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Basophil %', 'Shows the percentage of basophils among white blood cells. Provides information about your immune system balance.'
FROM metric_definitions WHERE key = 'bazofil_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Eosinophil Count', 'A type of white blood cell involved in your immune system. Plays a role in allergic responses and defense against parasites.'
FROM metric_definitions WHERE key = 'eozinofil_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Eosinophil %', 'Shows the percentage of eosinophils among white blood cells. Provides information about your immune response.'
FROM metric_definitions WHERE key = 'eozinofil_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Erythroblast Count', 'Young cells produced in bone marrow that mature into red blood cells.'
FROM metric_definitions WHERE key = 'eritroblast_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Erythroblast %', 'Shows the percentage of immature red blood cells in your blood. Provides information about bone marrow function.'
FROM metric_definitions WHERE key = 'eritroblast_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Red Blood Cell Count (RBC)', 'Red blood cells that carry oxygen to all tissues in your body.'
FROM metric_definitions WHERE key = 'eritrosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Hematocrit', 'Shows the ratio of red blood cells to total blood volume in your blood.'
FROM metric_definitions WHERE key = 'hematokrit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Hemoglobin', 'A protein in red blood cells that carries oxygen from your lungs to your body.'
FROM metric_definitions WHERE key = 'hemoglobin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'HFR (High Fluorescence Reticulocyte Ratio)', 'Shows the ratio of the youngest reticulocytes newly released from bone marrow. Provides information about blood cell production rate.'
FROM metric_definitions WHERE key = 'hfr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Immature Granulocyte Count', 'The count of young white blood cells not yet fully matured in bone marrow. Provides information about your immune system status.'
FROM metric_definitions WHERE key = 'ig_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Immature Granulocyte %', 'The ratio of immature white blood cells to total white blood cells.'
FROM metric_definitions WHERE key = 'ig_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'IRF (Immature Reticulocyte Fraction)', 'Shows the ratio of young red blood cells newly released from bone marrow. Provides information about bone marrow production capacity.'
FROM metric_definitions WHERE key = 'irf'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Lymphocyte Count', 'One of the key cells of the immune system. Protects your body against infections.'
FROM metric_definitions WHERE key = 'lenfosit_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Lymphocyte %', 'Shows the percentage of lymphocytes among white blood cells. Provides information about your immune system balance.'
FROM metric_definitions WHERE key = 'lenfosit_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'LFR (Low Fluorescence Reticulocyte Ratio)', 'Shows the ratio of mature reticulocytes. Provides information about the red blood cell maturation process.'
FROM metric_definitions WHERE key = 'lfr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'White Blood Cell Count (WBC)', 'White blood cells that defend your body against infections. Shows the overall status of your immune system.'
FROM metric_definitions WHERE key = 'lokosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'MCH (Mean Corpuscular Hemoglobin)', 'Shows the average amount of hemoglobin in a single red blood cell. Provides information about oxygen-carrying capacity.'
FROM metric_definitions WHERE key = 'mch'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'MCHC (Mean Corpuscular Hemoglobin Concentration)', 'Shows the concentration of hemoglobin in red blood cells. Provides information about oxygen-carrying capacity.'
FROM metric_definitions WHERE key = 'mchc'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'MCV (Mean Corpuscular Volume)', 'Shows the average size of your red blood cells. Provides information about blood cell production.'
FROM metric_definitions WHERE key = 'mcv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'MFR (Medium Fluorescence Reticulocyte Ratio)', 'Shows the ratio of reticulocytes at an intermediate maturity stage. Provides information about the red blood cell maturation process.'
FROM metric_definitions WHERE key = 'mfr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Monocyte Count', 'Large white blood cells that are part of the immune system. They protect your body against harmful microorganisms.'
FROM metric_definitions WHERE key = 'monosit_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Monocyte %', 'Shows the percentage of monocytes among white blood cells. Provides information about your immune system balance.'
FROM metric_definitions WHERE key = 'monosit_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'MPV (Mean Platelet Volume)', 'Shows the average size of your platelets. Provides information about bone marrow platelet production.'
FROM metric_definitions WHERE key = 'mpv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'NLR (Neutrophil-to-Lymphocyte Ratio)', 'The ratio of neutrophils to lymphocytes. Provides information about overall immune balance in your body.'
FROM metric_definitions WHERE key = 'nlr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Neutrophil Count', 'The most common white blood cell in your immune system. Plays an important role in defending against bacteria.'
FROM metric_definitions WHERE key = 'notrofil_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Neutrophil %', 'Shows the percentage of neutrophils among white blood cells. Provides information about your immune system balance.'
FROM metric_definitions WHERE key = 'notrofil_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'PCT (Plateletcrit)', 'Shows the ratio of platelets to total blood volume. Provides information about your clotting system.'
FROM metric_definitions WHERE key = 'pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'PDW (Platelet Distribution Width)', 'Shows the size variation among your platelets. Provides information about bone marrow platelet production.'
FROM metric_definitions WHERE key = 'pdw'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'P-LCR (Platelet Large Cell Ratio)', 'Shows the ratio of large platelets to total platelets. Provides information about platelet production.'
FROM metric_definitions WHERE key = 'plcr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'RDW (Red Cell Distribution Width)', 'Shows the size variation among your red blood cells. Provides information about blood cell production.'
FROM metric_definitions WHERE key = 'rdw'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'RDW-CV', 'Shows the red blood cell size distribution as a percentage. Provides information about the regularity of blood cell production.'
FROM metric_definitions WHERE key = 'rdw_cv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'RDW-SD', 'Shows the red blood cell size distribution as a standard deviation. Provides information about blood cell diversity.'
FROM metric_definitions WHERE key = 'rdw_sd'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Reticulocyte Count', 'The count of young red blood cells newly released from bone marrow. Provides information about bone marrow production rate.'
FROM metric_definitions WHERE key = 'reticulocyte_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Reticulocyte %', 'The ratio of young red blood cells to total red blood cells. Provides information about bone marrow function.'
FROM metric_definitions WHERE key = 'reticulocyte_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Platelet Count', 'Blood cells that help your blood clot. They help stop bleeding after injuries.'
FROM metric_definitions WHERE key = 'trombosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- HORMON (2)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Beta-hCG', 'A hormone that increases during pregnancy. Measured for pregnancy detection and monitoring.'
FROM metric_definitions WHERE key = 'beta_hcg'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Insulin', 'A hormone secreted by the pancreas. Enables blood sugar to be transported into cells and used for energy.'
FROM metric_definitions WHERE key = 'insulin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- İDRAR (28)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', '24-Hour Urine Creatinine', 'Shows the amount of creatinine filtered by your kidneys over 24 hours. Provides information about kidney function.'
FROM metric_definitions WHERE key = 'idrar_24h_kreatinin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', '24-Hour Urine Microalbumin', 'Measures the tiny amount of albumin protein excreted in urine over 24 hours. Provides information about kidney health.'
FROM metric_definitions WHERE key = 'idrar_24h_mikroalbumin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', '24-Hour Urine Protein', 'Shows the total amount of protein excreted in urine over 24 hours. Provides information about kidney filtration function.'
FROM metric_definitions WHERE key = 'idrar_24h_protein'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine Albumin', 'Shows the amount of albumin protein in your urine. Provides information about kidney filtration function.'
FROM metric_definitions WHERE key = 'idrar_albumin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine Albumin-to-Creatinine Ratio', 'Shows the ratio of albumin to creatinine in urine. Used to evaluate kidney function.'
FROM metric_definitions WHERE key = 'idrar_albumin_kreatinin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine Amorphous Phosphate', 'Phosphate crystals found in urine. Provides information about urine composition and mineral balance.'
FROM metric_definitions WHERE key = 'idrar_amorf_fosfat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine Ketones', 'Shows the amount of substances produced when your body uses fat for energy in the urine.'
FROM metric_definitions WHERE key = 'idrar_asetoasetat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine Bacteria', 'Shows whether bacteria are present in your urine. Provides information about urinary tract health.'
FROM metric_definitions WHERE key = 'idrar_bakteri'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine Bilirubin', 'Shows the amount of bilirubin in your urine, formed from red blood cell breakdown. Provides information about liver health.'
FROM metric_definitions WHERE key = 'idrar_bilirubin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine Calcium Oxalate Dihydrate', 'A type of crystal found in urine. Provides information about urine mineral composition.'
FROM metric_definitions WHERE key = 'idrar_ca_oksalat_dihidrat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine Calcium Oxalate Monohydrate', 'A type of crystal found in urine. Provides information about urine mineral composition and metabolism.'
FROM metric_definitions WHERE key = 'idrar_ca_oksalat_monohidrat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine Specific Gravity', 'Shows the concentration of your urine. Provides information about how well your kidneys can concentrate urine.'
FROM metric_definitions WHERE key = 'idrar_dansite'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine Epithelial Cells', 'Shows the amount of cells shed from the lining of your urinary tract. Provides information about urinary tract health.'
FROM metric_definitions WHERE key = 'idrar_epitel'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine Red Blood Cells', 'Shows the count of red blood cells in your urine. Provides information about kidney and urinary tract health.'
FROM metric_definitions WHERE key = 'idrar_eritrosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine Glucose', 'Shows the amount of sugar in your urine. Provides information about your kidneys'' ability to reabsorb sugar.'
FROM metric_definitions WHERE key = 'idrar_glukoz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine Granular Cast', 'Granular cylindrical structures formed in kidney tubules. Provides information about kidney function.'
FROM metric_definitions WHERE key = 'idrar_granuler_silendir'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine Hyaline Cast', 'Transparent cylindrical structures formed in kidney tubules. Small amounts are considered normal.'
FROM metric_definitions WHERE key = 'idrar_hyalen_silendir'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine Blood', 'Shows whether blood is present in your urine. Provides information about kidney and urinary tract health.'
FROM metric_definitions WHERE key = 'idrar_kan'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine Creatinine', 'Shows the amount of creatinine in your urine. Provides information about how well your kidneys filter waste.'
FROM metric_definitions WHERE key = 'idrar_kreatinin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine White Blood Cells (Microscopy)', 'Shows the microscopic count of white blood cells in your urine. Provides information about urinary tract health.'
FROM metric_definitions WHERE key = 'idrar_lokosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine Leukocyte Esterase', 'Detects an enzyme produced by white blood cells in urine. Provides information about urinary tract health.'
FROM metric_definitions WHERE key = 'idrar_lokosit_esteraz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine Yeast Cells', 'Shows whether yeast is present in your urine. Provides information about urinary tract health.'
FROM metric_definitions WHERE key = 'idrar_maya'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine Non-Squamous Epithelial Cells', 'Shows the amount of cells shed from the inner layers of your urinary tract. Provides information about kidney and urinary tract health.'
FROM metric_definitions WHERE key = 'idrar_non_skuamoz_epitel'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine pH', 'Shows the acidity or alkalinity of your urine. Provides information about your kidneys'' ability to regulate acid-base balance.'
FROM metric_definitions WHERE key = 'idrar_ph'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine Protein', 'Shows the amount of protein in your urine. Provides information about kidney filtration function.'
FROM metric_definitions WHERE key = 'idrar_protein'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine Uric Acid Crystals', 'Shows uric acid crystals found in urine. Provides information about urine mineral composition.'
FROM metric_definitions WHERE key = 'idrar_urik_asit_kristal'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine Urobilinogen', 'Shows the amount of a substance formed when bilirubin is converted in the intestines. Provides information about liver health.'
FROM metric_definitions WHERE key = 'idrar_urobilinojen'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Urine Volume', 'Shows the amount of urine collected over a specific period. Provides information about kidney function and fluid balance.'
FROM metric_definitions WHERE key = 'idrar_volum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- İMMÜNOLOJİ (12)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Anti-CMV IgG', 'An antibody showing whether you have previously been exposed to cytomegalovirus (CMV).'
FROM metric_definitions WHERE key = 'anti_cmv_igg'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Anti-CMV IgM', 'An antibody showing whether you have recently been exposed to cytomegalovirus (CMV).'
FROM metric_definitions WHERE key = 'anti_cmv_igm'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Anti-HCV', 'Detects antibodies your body produces against the hepatitis C virus.'
FROM metric_definitions WHERE key = 'anti_hcv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Anti-HIV', 'Detects antibodies your body produces against the HIV virus.'
FROM metric_definitions WHERE key = 'anti_hiv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Anti-Rubella IgG', 'An antibody showing whether you have immunity against rubella (German measles).'
FROM metric_definitions WHERE key = 'anti_rubella_igg'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Anti-Rubella IgM', 'An antibody showing whether you have recently been exposed to rubella (German measles).'
FROM metric_definitions WHERE key = 'anti_rubella_igm'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Anti-Toxoplasma IgG', 'An antibody showing whether you have previously been exposed to the toxoplasma parasite.'
FROM metric_definitions WHERE key = 'anti_toxo_igg'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Anti-Toxoplasma IgM', 'An antibody showing whether you have recently been exposed to the toxoplasma parasite.'
FROM metric_definitions WHERE key = 'anti_toxo_igm'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'HBsAg (Hepatitis B Surface Antigen)', 'Detects the surface antigen of the hepatitis B virus. Provides information about hepatitis B carrier status.'
FROM metric_definitions WHERE key = 'hbsag'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Rheumatoid Factor (RF)', 'An antibody produced by your immune system. Provides information about joint health.'
FROM metric_definitions WHERE key = 'romatoid_faktor'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Total IgE', 'A type of antibody produced by the immune system that plays a role in allergic reactions.'
FROM metric_definitions WHERE key = 'total_ige'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'VDRL-RPR', 'A screening test that detects antibodies your body produces against syphilis infection.'
FROM metric_definitions WHERE key = 'vdrl_rpr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- KAN GAZI (12)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Anion Gap', 'Shows the difference between positively and negatively charged ions in your blood. Provides information about acid-base balance.'
FROM metric_definitions WHERE key = 'anion_gap'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Base Excess (Blood)', 'Shows the excess or deficit of base in your blood. Provides information about your body''s acid-base balance.'
FROM metric_definitions WHERE key = 'be_b'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Base Excess (ECF)', 'Shows the base excess in extracellular fluid. Provides information about your body''s acid-base balance.'
FROM metric_definitions WHERE key = 'be_ecf'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Bicarbonate (HCO3)', 'Shows the bicarbonate level in your blood. Provides information about your kidneys'' ability to regulate acid-base balance.'
FROM metric_definitions WHERE key = 'hco3'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Ionized Calcium (Ca++)', 'Shows the amount of active, free-floating calcium in your blood. Important for muscle and nerve function.'
FROM metric_definitions WHERE key = 'ionized_calcium'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Lactate', 'A substance produced when cells generate energy without oxygen. Provides information about tissue oxygen utilization.'
FROM metric_definitions WHERE key = 'lactate'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'PCO2 (Partial Pressure of Carbon Dioxide)', 'Shows the carbon dioxide pressure in your blood. Provides information about how well your lungs are working.'
FROM metric_definitions WHERE key = 'pco2'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'PO2 (Partial Pressure of Oxygen)', 'Shows the oxygen pressure in your blood. Provides information about your lungs'' oxygen-absorbing capacity.'
FROM metric_definitions WHERE key = 'po2'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'SBC (Standard Bicarbonate)', 'Shows the bicarbonate level in your blood under standard conditions. Provides information about acid-base balance.'
FROM metric_definitions WHERE key = 'sbc'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Oxygen Saturation (SpO2)', 'Shows the percentage of hemoglobin carrying oxygen. Provides information about your body''s oxygen status.'
FROM metric_definitions WHERE key = 'spo2'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Total CO2 (TCO2)', 'Shows the total amount of carbon dioxide in your blood. Provides information about acid-base balance.'
FROM metric_definitions WHERE key = 'tco2'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Total Hemoglobin (tHb)', 'The total hemoglobin amount measured in blood gas analysis. Shows your blood''s oxygen-carrying capacity.'
FROM metric_definitions WHERE key = 'thb'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- KARACİĞER (8)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'ALP (Alkaline Phosphatase)', 'An enzyme found in your liver and bones. Provides information about liver and bone health.'
FROM metric_definitions WHERE key = 'alp'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'ALT (Alanine Aminotransferase)', 'An enzyme found in your liver. Provides information about liver health.'
FROM metric_definitions WHERE key = 'alt'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'AST (Aspartate Transaminase)', 'An enzyme found in your liver, heart, and muscles. Provides information especially about liver health.'
FROM metric_definitions WHERE key = 'ast'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Direct Bilirubin', 'Shows the amount of bilirubin processed by your liver. Provides information about liver and bile duct health.'
FROM metric_definitions WHERE key = 'direkt_bilirubin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'GGT (Gamma-Glutamyl Transferase)', 'An enzyme found in your liver and bile ducts. Provides information about liver health.'
FROM metric_definitions WHERE key = 'ggt'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Indirect Bilirubin', 'Shows the amount of bilirubin from red blood cell breakdown that has not yet been processed by the liver.'
FROM metric_definitions WHERE key = 'indirekt_bilirubin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'LDH (Lactate Dehydrogenase)', 'An enzyme found in many tissues throughout your body. Provides information about cell health and tissue integrity.'
FROM metric_definitions WHERE key = 'ldh'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Total Bilirubin', 'A yellow-colored substance formed from red blood cell breakdown. Provides information about liver health.'
FROM metric_definitions WHERE key = 'total_bilirubin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- KARDİYAK (1)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Troponin I', 'A protein found in heart muscle. Provides information about heart muscle health.'
FROM metric_definitions WHERE key = 'troponin_i'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- KOAGÜLASYON (6)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'aPTT (Activated Partial Thromboplastin Time)', 'A test that measures your blood clotting time. Provides information about how your clotting system works.'
FROM metric_definitions WHERE key = 'aptt'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'D-Dimer', 'A protein fragment produced when a blood clot dissolves. Provides information about your clotting system.'
FROM metric_definitions WHERE key = 'd_dimer'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Fibrinogen', 'A protein produced by your liver that plays a role in blood clotting.'
FROM metric_definitions WHERE key = 'fibrinojen'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'INR (International Normalized Ratio)', 'Shows your blood clotting speed on a standardized scale. Provides information about your clotting system.'
FROM metric_definitions WHERE key = 'inr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Prothrombin Time (PT)', 'Measures the time it takes for your blood to clot. Provides information about your clotting factors.'
FROM metric_definitions WHERE key = 'pt'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Prothrombin Time (% Activity)', 'Shows the activity percentage of your clotting factors. Provides information about clotting system function level.'
FROM metric_definitions WHERE key = 'pt_activity'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- LİPİD (6)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'HDL Cholesterol', 'A type of fat known as good cholesterol. Helps protect your cardiovascular health.'
FROM metric_definitions WHERE key = 'hdl'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'LDL Cholesterol', 'A type of fat known as bad cholesterol. Provides information about your cardiovascular health.'
FROM metric_definitions WHERE key = 'ldl'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Non-HDL Cholesterol', 'Shows the total of all cholesterol types except HDL. Provides information about your cardiovascular health.'
FROM metric_definitions WHERE key = 'non_hdl'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Total Cholesterol', 'A fatty substance in your blood. Your body uses it for building cells and producing hormones.'
FROM metric_definitions WHERE key = 'total_kolesterol'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Triglycerides', 'A type of fat in your blood. Your body needs triglycerides to store and use energy.'
FROM metric_definitions WHERE key = 'trigliserid'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'VLDL Cholesterol', 'A type of lipoprotein produced by your liver. It is responsible for transporting triglycerides throughout the body.'
FROM metric_definitions WHERE key = 'vldl'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- TİROİD (3)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Free T3', 'An active hormone produced by your thyroid gland. Provides information about your metabolic rate and energy levels.'
FROM metric_definitions WHERE key = 'serbest_t3'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Free T4', 'A hormone produced by your thyroid gland. Provides information about thyroid function and metabolism.'
FROM metric_definitions WHERE key = 'serbest_t4'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'TSH (Thyroid-Stimulating Hormone)', 'A hormone produced by the pituitary gland in your brain. Shows how well your thyroid gland is working.'
FROM metric_definitions WHERE key = 'tsh'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- TÜMÖR BELİRTEÇLERİ (4)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'CA-125', 'A protein marker produced by certain cells in your body. Used in monitoring reproductive system health.'
FROM metric_definitions WHERE key = 'ca125'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'CA 15-3', 'A protein marker produced by certain cells in your body. Used in monitoring breast health.'
FROM metric_definitions WHERE key = 'ca153'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'CA 19-9', 'A protein marker produced by certain cells in your body. Used in monitoring digestive system health.'
FROM metric_definitions WHERE key = 'ca199'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'CEA (Carcinoembryonic Antigen)', 'A protein marker produced in your body. It is a laboratory value used in general health monitoring.'
FROM metric_definitions WHERE key = 'cea'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- VİTAMİN (3)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Vitamin B12', 'A vitamin essential for nervous system function and blood cell production. Obtained from food.'
FROM metric_definitions WHERE key = 'b12'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Folic Acid', 'A B vitamin essential for cell growth and blood cell production. Especially important during pregnancy.'
FROM metric_definitions WHERE key = 'folik_asit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'Vitamin D', 'A vitamin essential for bone and dental health. Helps your body use calcium.'
FROM metric_definitions WHERE key = 'vitamin_d'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;
