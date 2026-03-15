-- MT-009: German (DE) translations — display_name + description for all 155 metrics
-- Applied to Neon test branch: metric-translations-test (ep-raspy-bar-agiah0ev)

-- ==================
-- BİYOKİMYA (24)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Albumin', 'Ein von der Leber gebildetes Protein, das den Flüssigkeitshaushalt im Körper reguliert.'
FROM metric_definitions WHERE key = 'albumin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Amylase', 'Ein Enzym aus Bauchspeicheldrüse und Speicheldrüsen, das stärkehaltige Nahrung verdaut.'
FROM metric_definitions WHERE key = 'amilaz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Zink', 'Ein Spurenelement, das für Immunabwehr, Wundheilung und Wachstum wichtig ist.'
FROM metric_definitions WHERE key = 'cinko'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Korrigiertes Kalzium', 'Ein auf den Albuminspiegel angepasster Kalziumwert. Gibt ein genaueres Bild des Kalziumstatus.'
FROM metric_definitions WHERE key = 'duzeltilmis_kalsiyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'eGFR (Geschätzte glomeruläre Filtrationsrate)', 'Ein berechneter Wert, der zeigt, wie gut die Nieren das Blut filtern. Gibt Auskunft über die Nierenfunktion.'
FROM metric_definitions WHERE key = 'egfr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Phosphor', 'Ein Mineralstoff in Knochen und Zähnen, der auch an der Energiegewinnung beteiligt ist.'
FROM metric_definitions WHERE key = 'fosfor'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Globulin', 'Eine Gruppe von Proteinen, die an der Immunabwehr und dem Stofftransport im Körper beteiligt sind.'
FROM metric_definitions WHERE key = 'globulin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Glukose', 'Zeigt den Blutzuckerspiegel. Glukose ist die wichtigste Energiequelle des Körpers.'
FROM metric_definitions WHERE key = 'glukoz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Kalzium', 'Ein Mineralstoff für Knochen- und Zahngesundheit, der auch bei Muskel- und Nervenfunktion eine Rolle spielt.'
FROM metric_definitions WHERE key = 'kalsiyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Chlorid', 'Ein Elektrolyt, das den Flüssigkeits- und Säure-Basen-Haushalt im Körper reguliert.'
FROM metric_definitions WHERE key = 'klorur'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Kreatinkinase (CK)', 'Ein Enzym in Muskel-, Herz- und Hirngewebe. Gibt Auskunft über die Muskelgesundheit.'
FROM metric_definitions WHERE key = 'kreatin_kinaz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Kreatinin', 'Ein Abfallprodukt des normalen Muskelstoffwechsels. Zeigt, wie gut die Nieren arbeiten.'
FROM metric_definitions WHERE key = 'kreatinin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Kreatinin-Clearance', 'Zeigt, wie schnell die Nieren Kreatinin aus dem Blut entfernen. Gibt Auskunft über die Nierenfunktion.'
FROM metric_definitions WHERE key = 'kreatinin_klerens'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Lipase', 'Ein Enzym der Bauchspeicheldrüse, das bei der Fettverdauung hilft. Gibt Auskunft über die Pankreasgesundheit.'
FROM metric_definitions WHERE key = 'lipaz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Magnesium', 'Ein Mineralstoff für Muskel-, Nerven- und Knochengesundheit. Spielt bei vielen Stoffwechselprozessen eine Rolle.'
FROM metric_definitions WHERE key = 'magnezyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'OGTT 75g nüchtern (0 Min.)', 'Der Nüchternblutzucker vor einem Glukosetoleranztest. Zeigt, wie der Körper Zucker verarbeitet.'
FROM metric_definitions WHERE key = 'ogtt_0dk'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'OGTT 75g 60 Min.', 'Der Blutzucker eine Stunde nach dem Glukosetoleranztest. Zeigt, wie schnell der Körper Zucker verarbeitet.'
FROM metric_definitions WHERE key = 'ogtt_60dk'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'OGTT 75g 120 Min.', 'Der Blutzucker zwei Stunden nach dem Glukosetoleranztest. Zeigt, wie lange der Körper zur Zuckerverarbeitung braucht.'
FROM metric_definitions WHERE key = 'ogtt_120dk'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Kalium', 'Ein Mineralstoff, der für die Muskel- und Nervenfunktion benötigt wird.'
FROM metric_definitions WHERE key = 'potasyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Natrium', 'Ein Mineralstoff, der den Flüssigkeitshaushalt reguliert und bei Nerven- und Muskelfunktion mitwirkt.'
FROM metric_definitions WHERE key = 'sodyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Gesamteiweiß', 'Zeigt die gesamte Proteinmenge im Blut. Gibt Auskunft über Ernährungszustand und Organfunktion.'
FROM metric_definitions WHERE key = 'total_protein'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Harnstoff-Stickstoff (BUN)', 'Ein Abfallprodukt des Eiweißabbaus. Gibt Auskunft über die Nierenfunktion.'
FROM metric_definitions WHERE key = 'ure'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Harnstoff', 'Ein Abfallprodukt des Eiweißstoffwechsels in der Leber. Zeigt die Fähigkeit der Nieren, diesen Stoff auszuscheiden.'
FROM metric_definitions WHERE key = 'urea'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Harnsäure', 'Ein Abfallprodukt des Purinstoffwechsels im Körper. Wird über die Nieren ausgeschieden.'
FROM metric_definitions WHERE key = 'urik_asit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- DEMİR (5)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Eisen', 'Zeigt den Eisenspiegel im Blut. Der Körper benötigt Eisen für den Sauerstofftransport und die Energiegewinnung.'
FROM metric_definitions WHERE key = 'demir'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Ferritin', 'Ein Protein, das Eisen im Körper speichert. Gibt Auskunft über die Eisenreserven.'
FROM metric_definitions WHERE key = 'ferritin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'TEBK (Totale Eisenbindungskapazität)', 'Zeigt, wie viel Eisen die Blutproteine transportieren können. Gibt Auskunft über den Eisenhaushalt.'
FROM metric_definitions WHERE key = 'tdbk'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Transferrinsättigung', 'Zeigt, welcher Anteil des eisentragenden Transferrin-Proteins mit Eisen beladen ist.'
FROM metric_definitions WHERE key = 'transferrin_sat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'UEBK (Ungesättigte Eisenbindungskapazität)', 'Zeigt, wie viel zusätzliches Eisen die Blutproteine noch binden können. Gibt Auskunft über den Eisenhaushalt.'
FROM metric_definitions WHERE key = 'uibc'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- DİĞER (2)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'HbA1c (Glykiertes Hämoglobin)', 'Zeigt den durchschnittlichen Blutzucker der letzten zwei bis drei Monate. Gibt Auskunft über die langfristige Blutzuckereinstellung.'
FROM metric_definitions WHERE key = 'hba1c'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Parathormon (PTH)', 'Ein Hormon der Nebenschilddrüsen. Reguliert den Kalzium- und Phosphorhaushalt im Körper.'
FROM metric_definitions WHERE key = 'parathormon'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- ENFLAMASYON (3)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'CRP (C-reaktives Protein)', 'Ein von der Leber gebildetes Protein. Zeigt an, ob eine Entzündung im Körper vorliegt.'
FROM metric_definitions WHERE key = 'crp'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Procalcitonin', 'Ein im Körper gebildetes Protein. Gibt Auskunft über das Vorliegen einer bakteriellen Infektion.'
FROM metric_definitions WHERE key = 'prokalsitonin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'BSG (Blutkörperchensenkungsgeschwindigkeit)', 'Misst, wie schnell rote Blutkörperchen absinken. Gibt Auskunft über mögliche Entzündungsprozesse im Körper.'
FROM metric_definitions WHERE key = 'sedimantasyon'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- HEMOGRAM (36)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Basophile (absolut)', 'Eine Art weißer Blutkörperchen des Immunsystems. Spielt bei allergischen Reaktionen und Immunantworten eine Rolle.'
FROM metric_definitions WHERE key = 'bazofil_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Basophile %', 'Zeigt den prozentualen Anteil der Basophilen an den weißen Blutkörperchen. Gibt Auskunft über das Immunsystem.'
FROM metric_definitions WHERE key = 'bazofil_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Eosinophile (absolut)', 'Eine Art weißer Blutkörperchen des Immunsystems. Spielt bei allergischen Reaktionen und Parasitenabwehr eine Rolle.'
FROM metric_definitions WHERE key = 'eozinofil_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Eosinophile %', 'Zeigt den prozentualen Anteil der Eosinophilen an den weißen Blutkörperchen. Gibt Auskunft über die Immunantwort.'
FROM metric_definitions WHERE key = 'eozinofil_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Erythroblasten (absolut)', 'Junge Zellen aus dem Knochenmark, die zu roten Blutkörperchen heranreifen.'
FROM metric_definitions WHERE key = 'eritroblast_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Erythroblasten %', 'Zeigt den Anteil unreifer roter Blutkörperchen im Blut. Gibt Auskunft über die Knochenmarkfunktion.'
FROM metric_definitions WHERE key = 'eritroblast_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Erythrozyten (RBC)', 'Rote Blutkörperchen, die Sauerstoff zu allen Geweben im Körper transportieren.'
FROM metric_definitions WHERE key = 'eritrosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Hämatokrit', 'Zeigt das Verhältnis der roten Blutkörperchen zum gesamten Blutvolumen.'
FROM metric_definitions WHERE key = 'hematokrit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Hämoglobin', 'Ein Protein in roten Blutkörperchen, das Sauerstoff von der Lunge in den Körper transportiert.'
FROM metric_definitions WHERE key = 'hemoglobin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'HFR (Hochfluoreszierende Retikulozytenrate)', 'Zeigt den Anteil der jüngsten, neu aus dem Knochenmark freigesetzten Retikulozyten. Gibt Auskunft über die Blutbildungsrate.'
FROM metric_definitions WHERE key = 'hfr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Unreife Granulozyten (absolut)', 'Die Anzahl junger, noch nicht ausgereifter weißer Blutkörperchen aus dem Knochenmark. Gibt Auskunft über den Immunstatus.'
FROM metric_definitions WHERE key = 'ig_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Unreife Granulozyten %', 'Der Anteil unreifer weißer Blutkörperchen an der Gesamtleukozytenzahl.'
FROM metric_definitions WHERE key = 'ig_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'IRF (Unreife Retikulozytenfraktion)', 'Zeigt den Anteil junger roter Blutkörperchen, die neu aus dem Knochenmark freigesetzt wurden. Gibt Auskunft über die Knochenmarkproduktion.'
FROM metric_definitions WHERE key = 'irf'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Lymphozyten (absolut)', 'Eine der wichtigsten Zellen des Immunsystems. Schützt den Körper vor Infektionen.'
FROM metric_definitions WHERE key = 'lenfosit_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Lymphozyten %', 'Zeigt den prozentualen Anteil der Lymphozyten an den weißen Blutkörperchen. Gibt Auskunft über das Immunsystem.'
FROM metric_definitions WHERE key = 'lenfosit_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'LFR (Niedrigfluoreszierende Retikulozytenrate)', 'Zeigt den Anteil reifer Retikulozyten. Gibt Auskunft über den Reifungsprozess der roten Blutkörperchen.'
FROM metric_definitions WHERE key = 'lfr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Leukozyten (WBC)', 'Weiße Blutkörperchen, die den Körper vor Infektionen schützen. Zeigt den Gesamtstatus des Immunsystems.'
FROM metric_definitions WHERE key = 'lokosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'MCH (Mittleres korpuskuläres Hämoglobin)', 'Zeigt die durchschnittliche Hämoglobinmenge in einem einzelnen roten Blutkörperchen. Gibt Auskunft über die Sauerstofftransportkapazität.'
FROM metric_definitions WHERE key = 'mch'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'MCHC (Mittlere korpuskuläre Hämoglobinkonzentration)', 'Zeigt die Hämoglobinkonzentration in roten Blutkörperchen. Gibt Auskunft über die Sauerstofftransportkapazität.'
FROM metric_definitions WHERE key = 'mchc'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'MCV (Mittleres korpuskuläres Volumen)', 'Zeigt die durchschnittliche Größe der roten Blutkörperchen. Gibt Auskunft über die Blutbildung.'
FROM metric_definitions WHERE key = 'mcv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'MFR (Mittelfluoreszierende Retikulozytenrate)', 'Zeigt den Anteil der Retikulozyten im mittleren Reifestadium. Gibt Auskunft über den Reifungsprozess roter Blutkörperchen.'
FROM metric_definitions WHERE key = 'mfr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Monozyten (absolut)', 'Große weiße Blutkörperchen des Immunsystems. Sie schützen den Körper vor schädlichen Mikroorganismen.'
FROM metric_definitions WHERE key = 'monosit_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Monozyten %', 'Zeigt den prozentualen Anteil der Monozyten an den weißen Blutkörperchen. Gibt Auskunft über das Immunsystem.'
FROM metric_definitions WHERE key = 'monosit_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'MPV (Mittleres Thrombozytenvolumen)', 'Zeigt die durchschnittliche Größe der Thrombozyten. Gibt Auskunft über die Thrombozytenbildung im Knochenmark.'
FROM metric_definitions WHERE key = 'mpv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'NLR (Neutrophilen-Lymphozyten-Verhältnis)', 'Das Verhältnis von Neutrophilen zu Lymphozyten. Gibt Auskunft über das immunologische Gleichgewicht im Körper.'
FROM metric_definitions WHERE key = 'nlr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Neutrophile (absolut)', 'Die häufigsten weißen Blutkörperchen des Immunsystems. Spielen eine wichtige Rolle bei der Abwehr von Bakterien.'
FROM metric_definitions WHERE key = 'notrofil_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Neutrophile %', 'Zeigt den prozentualen Anteil der Neutrophilen an den weißen Blutkörperchen. Gibt Auskunft über das Immunsystem.'
FROM metric_definitions WHERE key = 'notrofil_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'PCT (Thrombokrit)', 'Zeigt das Verhältnis der Thrombozyten zum gesamten Blutvolumen. Gibt Auskunft über das Gerinnungssystem.'
FROM metric_definitions WHERE key = 'pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'PDW (Thrombozytenverteilungsbreite)', 'Zeigt die Größenvariation der Thrombozyten. Gibt Auskunft über die Thrombozytenbildung im Knochenmark.'
FROM metric_definitions WHERE key = 'pdw'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'P-LCR (Anteil großer Thrombozyten)', 'Zeigt den Anteil großer Thrombozyten an der Gesamtzahl. Gibt Auskunft über die Thrombozytenproduktion.'
FROM metric_definitions WHERE key = 'plcr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'RDW (Erythrozytenverteilungsbreite)', 'Zeigt die Größenvariation der roten Blutkörperchen. Gibt Auskunft über die Blutbildung.'
FROM metric_definitions WHERE key = 'rdw'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'RDW-CV', 'Zeigt die Erythrozytengrößenverteilung als Prozentsatz. Gibt Auskunft über die Regelmäßigkeit der Blutbildung.'
FROM metric_definitions WHERE key = 'rdw_cv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'RDW-SD', 'Zeigt die Erythrozytengrößenverteilung als Standardabweichung. Gibt Auskunft über die Blutkörperchenvielfalt.'
FROM metric_definitions WHERE key = 'rdw_sd'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Retikulozyten (absolut)', 'Die Anzahl junger roter Blutkörperchen, die neu aus dem Knochenmark freigesetzt wurden. Gibt Auskunft über die Produktionsrate.'
FROM metric_definitions WHERE key = 'reticulocyte_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Retikulozyten %', 'Der Anteil junger roter Blutkörperchen an der Gesamterythrozytenzahl. Gibt Auskunft über die Knochenmarkfunktion.'
FROM metric_definitions WHERE key = 'reticulocyte_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Thrombozyten', 'Blutzellen, die bei der Blutgerinnung helfen. Sie stoppen Blutungen nach Verletzungen.'
FROM metric_definitions WHERE key = 'trombosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- HORMON (2)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Beta-hCG', 'Ein Hormon, das während der Schwangerschaft ansteigt. Wird zur Schwangerschaftserkennung und -überwachung bestimmt.'
FROM metric_definitions WHERE key = 'beta_hcg'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Insulin', 'Ein Hormon der Bauchspeicheldrüse. Ermöglicht den Transport von Blutzucker in die Zellen zur Energiegewinnung.'
FROM metric_definitions WHERE key = 'insulin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- İDRAR (28)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', '24-Stunden-Urin-Kreatinin', 'Zeigt die Menge an Kreatinin, die die Nieren in 24 Stunden filtern. Gibt Auskunft über die Nierenfunktion.'
FROM metric_definitions WHERE key = 'idrar_24h_kreatinin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', '24-Stunden-Urin-Mikroalbumin', 'Misst die geringe Menge an Albumin, die in 24 Stunden über den Urin ausgeschieden wird. Gibt Auskunft über die Nierengesundheit.'
FROM metric_definitions WHERE key = 'idrar_24h_mikroalbumin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', '24-Stunden-Urin-Protein', 'Zeigt die gesamte Proteinmenge, die in 24 Stunden über den Urin ausgeschieden wird. Gibt Auskunft über die Nierenfiltration.'
FROM metric_definitions WHERE key = 'idrar_24h_protein'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urin-Albumin', 'Zeigt die Menge an Albumin-Protein im Urin. Gibt Auskunft über die Nierenfiltrationsfunktion.'
FROM metric_definitions WHERE key = 'idrar_albumin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urin-Albumin-Kreatinin-Quotient', 'Zeigt das Verhältnis von Albumin zu Kreatinin im Urin. Wird zur Beurteilung der Nierenfunktion verwendet.'
FROM metric_definitions WHERE key = 'idrar_albumin_kreatinin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urin Amorphes Phosphat', 'Phosphatkristalle im Urin. Gibt Auskunft über die Urinzusammensetzung und den Mineralhaushalt.'
FROM metric_definitions WHERE key = 'idrar_amorf_fosfat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urin-Ketone', 'Zeigt die Menge an Substanzen im Urin, die bei der Fettverbrennung des Körpers entstehen.'
FROM metric_definitions WHERE key = 'idrar_asetoasetat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urin-Bakterien', 'Zeigt, ob Bakterien im Urin vorhanden sind. Gibt Auskunft über die Gesundheit der Harnwege.'
FROM metric_definitions WHERE key = 'idrar_bakteri'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urin-Bilirubin', 'Zeigt die Bilirubinmenge im Urin, die beim Abbau roter Blutkörperchen entsteht. Gibt Auskunft über die Lebergesundheit.'
FROM metric_definitions WHERE key = 'idrar_bilirubin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urin Kalziumoxalat-Dihydrat', 'Eine Kristallart im Urin. Gibt Auskunft über die mineralische Zusammensetzung des Urins.'
FROM metric_definitions WHERE key = 'idrar_ca_oksalat_dihidrat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urin Kalziumoxalat-Monohydrat', 'Eine Kristallart im Urin. Gibt Auskunft über die Urinzusammensetzung und den Stoffwechsel.'
FROM metric_definitions WHERE key = 'idrar_ca_oksalat_monohidrat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urin Spezifisches Gewicht', 'Zeigt die Konzentration des Urins. Gibt Auskunft über die Konzentrationsfähigkeit der Nieren.'
FROM metric_definitions WHERE key = 'idrar_dansite'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urin-Epithelzellen', 'Zeigt die Menge abgeschilfter Zellen der Harnwegsschleimhaut. Gibt Auskunft über die Harnwegsgesundheit.'
FROM metric_definitions WHERE key = 'idrar_epitel'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urin-Erythrozyten', 'Zeigt die Anzahl roter Blutkörperchen im Urin. Gibt Auskunft über die Nieren- und Harnwegsgesundheit.'
FROM metric_definitions WHERE key = 'idrar_eritrosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urin-Glukose', 'Zeigt die Zuckermenge im Urin. Gibt Auskunft über die Fähigkeit der Nieren, Zucker rückzuresorbieren.'
FROM metric_definitions WHERE key = 'idrar_glukoz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urin Granulierter Zylinder', 'Granuläre zylindrische Strukturen aus den Nierentubuli. Gibt Auskunft über die Nierenfunktion.'
FROM metric_definitions WHERE key = 'idrar_granuler_silendir'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urin Hyaliner Zylinder', 'Durchsichtige zylindrische Strukturen aus den Nierentubuli. In geringen Mengen als normal einzustufen.'
FROM metric_definitions WHERE key = 'idrar_hyalen_silendir'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urin-Blut', 'Zeigt, ob Blut im Urin vorhanden ist. Gibt Auskunft über die Nieren- und Harnwegsgesundheit.'
FROM metric_definitions WHERE key = 'idrar_kan'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urin-Kreatinin', 'Zeigt die Kreatininmenge im Urin. Gibt Auskunft über die Filtrationsleistung der Nieren.'
FROM metric_definitions WHERE key = 'idrar_kreatinin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urin-Leukozyten (Mikroskopie)', 'Zeigt die mikroskopische Anzahl weißer Blutkörperchen im Urin. Gibt Auskunft über die Harnwegsgesundheit.'
FROM metric_definitions WHERE key = 'idrar_lokosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urin-Leukozytenesterase', 'Weist ein von weißen Blutkörperchen produziertes Enzym im Urin nach. Gibt Auskunft über die Harnwegsgesundheit.'
FROM metric_definitions WHERE key = 'idrar_lokosit_esteraz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urin-Hefezellen', 'Zeigt, ob Hefepilze im Urin vorhanden sind. Gibt Auskunft über die Harnwegsgesundheit.'
FROM metric_definitions WHERE key = 'idrar_maya'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urin Nicht-Plattenepithelzellen', 'Zeigt die Menge abgeschilfter Zellen der inneren Harnwegsschichten. Gibt Auskunft über die Nieren- und Harnwegsgesundheit.'
FROM metric_definitions WHERE key = 'idrar_non_skuamoz_epitel'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urin-pH', 'Zeigt den Säure- oder Basengehalt des Urins. Gibt Auskunft über die Fähigkeit der Nieren, den Säure-Basen-Haushalt zu regulieren.'
FROM metric_definitions WHERE key = 'idrar_ph'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urin-Protein', 'Zeigt die Proteinmenge im Urin. Gibt Auskunft über die Nierenfiltrationsfunktion.'
FROM metric_definitions WHERE key = 'idrar_protein'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urin Harnsäurekristalle', 'Zeigt Harnsäurekristalle im Urin. Gibt Auskunft über die mineralische Urinzusammensetzung.'
FROM metric_definitions WHERE key = 'idrar_urik_asit_kristal'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urin-Urobilinogen', 'Zeigt die Menge eines Stoffes, der bei der Bilirubinumwandlung im Darm entsteht. Gibt Auskunft über die Lebergesundheit.'
FROM metric_definitions WHERE key = 'idrar_urobilinojen'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Urinvolumen', 'Zeigt die über einen bestimmten Zeitraum gesammelte Urinmenge. Gibt Auskunft über Nierenfunktion und Flüssigkeitshaushalt.'
FROM metric_definitions WHERE key = 'idrar_volum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- İMMÜNOLOJİ (12)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Anti-CMV-IgG', 'Ein Antikörper, der zeigt, ob man zuvor mit dem Zytomegalievirus (CMV) in Kontakt war.'
FROM metric_definitions WHERE key = 'anti_cmv_igg'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Anti-CMV-IgM', 'Ein Antikörper, der zeigt, ob man kürzlich mit dem Zytomegalievirus (CMV) in Kontakt war.'
FROM metric_definitions WHERE key = 'anti_cmv_igm'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Anti-HCV', 'Weist Antikörper nach, die der Körper gegen das Hepatitis-C-Virus bildet.'
FROM metric_definitions WHERE key = 'anti_hcv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Anti-HIV', 'Weist Antikörper nach, die der Körper gegen das HI-Virus bildet.'
FROM metric_definitions WHERE key = 'anti_hiv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Anti-Röteln-IgG', 'Ein Antikörper, der zeigt, ob eine Immunität gegen Röteln besteht.'
FROM metric_definitions WHERE key = 'anti_rubella_igg'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Anti-Röteln-IgM', 'Ein Antikörper, der zeigt, ob man kürzlich mit dem Rötelnvirus in Kontakt war.'
FROM metric_definitions WHERE key = 'anti_rubella_igm'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Anti-Toxoplasma-IgG', 'Ein Antikörper, der zeigt, ob man zuvor mit dem Toxoplasma-Parasiten in Kontakt war.'
FROM metric_definitions WHERE key = 'anti_toxo_igg'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Anti-Toxoplasma-IgM', 'Ein Antikörper, der zeigt, ob man kürzlich mit dem Toxoplasma-Parasiten in Kontakt war.'
FROM metric_definitions WHERE key = 'anti_toxo_igm'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'HBsAg (Hepatitis-B-Oberflächenantigen)', 'Weist das Oberflächenantigen des Hepatitis-B-Virus nach. Gibt Auskunft über den Hepatitis-B-Trägerstatus.'
FROM metric_definitions WHERE key = 'hbsag'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Rheumafaktor (RF)', 'Ein vom Immunsystem gebildeter Antikörper. Gibt Auskunft über die Gelenkgesundheit.'
FROM metric_definitions WHERE key = 'romatoid_faktor'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Gesamt-IgE', 'Ein vom Immunsystem gebildeter Antikörpertyp, der bei allergischen Reaktionen eine Rolle spielt.'
FROM metric_definitions WHERE key = 'total_ige'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'VDRL-RPR', 'Ein Suchtest, der Antikörper gegen die Syphilis-Infektion nachweist.'
FROM metric_definitions WHERE key = 'vdrl_rpr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- KAN GAZI (12)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Anionenlücke', 'Zeigt die Differenz zwischen positiv und negativ geladenen Ionen im Blut. Gibt Auskunft über den Säure-Basen-Haushalt.'
FROM metric_definitions WHERE key = 'anion_gap'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Basenüberschuss (Blut)', 'Zeigt den Überschuss oder Mangel an Basen im Blut. Gibt Auskunft über den Säure-Basen-Haushalt des Körpers.'
FROM metric_definitions WHERE key = 'be_b'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Basenüberschuss (EZF)', 'Zeigt den Basenüberschuss in der extrazellulären Flüssigkeit. Gibt Auskunft über den Säure-Basen-Haushalt des Körpers.'
FROM metric_definitions WHERE key = 'be_ecf'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Bikarbonat (HCO3)', 'Zeigt den Bikarbonatspiegel im Blut. Gibt Auskunft über die Fähigkeit der Nieren, den Säure-Basen-Haushalt zu regulieren.'
FROM metric_definitions WHERE key = 'hco3'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Ionisiertes Kalzium (Ca++)', 'Zeigt die Menge an aktivem, frei gelöstem Kalzium im Blut. Wichtig für Muskel- und Nervenfunktion.'
FROM metric_definitions WHERE key = 'ionized_calcium'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Laktat', 'Ein Stoff, der entsteht, wenn Zellen Energie ohne Sauerstoff erzeugen. Gibt Auskunft über die Sauerstoffversorgung der Gewebe.'
FROM metric_definitions WHERE key = 'lactate'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'PCO2 (Kohlendioxidpartialdruck)', 'Zeigt den Kohlendioxiddruck im Blut. Gibt Auskunft über die Lungenfunktion.'
FROM metric_definitions WHERE key = 'pco2'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'PO2 (Sauerstoffpartialdruck)', 'Zeigt den Sauerstoffdruck im Blut. Gibt Auskunft über die Sauerstoffaufnahme der Lunge.'
FROM metric_definitions WHERE key = 'po2'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'SBC (Standardbikarbonat)', 'Zeigt den Bikarbonatspiegel im Blut unter Standardbedingungen. Gibt Auskunft über den Säure-Basen-Haushalt.'
FROM metric_definitions WHERE key = 'sbc'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Sauerstoffsättigung (SpO2)', 'Zeigt den Anteil des sauerstofftragenden Hämoglobins. Gibt Auskunft über die Sauerstoffversorgung des Körpers.'
FROM metric_definitions WHERE key = 'spo2'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Gesamt-CO2 (TCO2)', 'Zeigt die Gesamtmenge an Kohlendioxid im Blut. Gibt Auskunft über den Säure-Basen-Haushalt.'
FROM metric_definitions WHERE key = 'tco2'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Gesamthämoglobin (tHb)', 'Die in der Blutgasanalyse gemessene Gesamthämoglobinmenge. Zeigt die Sauerstofftransportkapazität des Blutes.'
FROM metric_definitions WHERE key = 'thb'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- KARACİĞER (8)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'AP (Alkalische Phosphatase)', 'Ein Enzym in Leber und Knochen. Gibt Auskunft über die Leber- und Knochengesundheit.'
FROM metric_definitions WHERE key = 'alp'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'ALT (Alanin-Aminotransferase)', 'Ein Enzym in der Leber. Gibt Auskunft über die Lebergesundheit.'
FROM metric_definitions WHERE key = 'alt'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'AST (Aspartat-Aminotransferase)', 'Ein Enzym in Leber, Herz und Muskulatur. Gibt besonders Auskunft über die Lebergesundheit.'
FROM metric_definitions WHERE key = 'ast'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Direktes Bilirubin', 'Zeigt die Menge an von der Leber verarbeitetem Bilirubin. Gibt Auskunft über Leber- und Gallenwegsgesundheit.'
FROM metric_definitions WHERE key = 'direkt_bilirubin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'GGT (Gamma-Glutamyltransferase)', 'Ein Enzym in Leber und Gallenwegen. Gibt Auskunft über die Lebergesundheit.'
FROM metric_definitions WHERE key = 'ggt'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Indirektes Bilirubin', 'Zeigt die Menge an Bilirubin aus dem Abbau roter Blutkörperchen, das noch nicht von der Leber verarbeitet wurde.'
FROM metric_definitions WHERE key = 'indirekt_bilirubin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'LDH (Laktatdehydrogenase)', 'Ein Enzym, das in vielen Geweben des Körpers vorkommt. Gibt Auskunft über Zellgesundheit und Gewebeintegrität.'
FROM metric_definitions WHERE key = 'ldh'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Gesamtbilirubin', 'Ein gelber Farbstoff, der beim Abbau roter Blutkörperchen entsteht. Gibt Auskunft über die Lebergesundheit.'
FROM metric_definitions WHERE key = 'total_bilirubin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- KARDİYAK (1)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Troponin I', 'Ein Protein im Herzmuskel. Gibt Auskunft über die Gesundheit des Herzmuskels.'
FROM metric_definitions WHERE key = 'troponin_i'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- KOAGÜLASYON (6)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'aPTT (Aktivierte partielle Thromboplastinzeit)', 'Ein Test, der die Blutgerinnungszeit misst. Gibt Auskunft über die Funktion des Gerinnungssystems.'
FROM metric_definitions WHERE key = 'aptt'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'D-Dimer', 'Ein Proteinfragment, das bei der Auflösung von Blutgerinnseln entsteht. Gibt Auskunft über das Gerinnungssystem.'
FROM metric_definitions WHERE key = 'd_dimer'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Fibrinogen', 'Ein von der Leber gebildetes Protein, das bei der Blutgerinnung eine Rolle spielt.'
FROM metric_definitions WHERE key = 'fibrinojen'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'INR (International Normalized Ratio)', 'Zeigt die Blutgerinnungsgeschwindigkeit auf einer standardisierten Skala. Gibt Auskunft über das Gerinnungssystem.'
FROM metric_definitions WHERE key = 'inr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Prothrombinzeit (PT)', 'Misst die Zeit, die das Blut zur Gerinnung benötigt. Gibt Auskunft über die Gerinnungsfaktoren.'
FROM metric_definitions WHERE key = 'pt'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Prothrombinzeit (% Aktivität)', 'Zeigt die Aktivität der Gerinnungsfaktoren in Prozent. Gibt Auskunft über die Funktion des Gerinnungssystems.'
FROM metric_definitions WHERE key = 'pt_activity'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- LİPİD (6)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'HDL-Cholesterin', 'Ein als gutes Cholesterin bekannter Blutfettwert. Trägt zum Schutz der Herz-Kreislauf-Gesundheit bei.'
FROM metric_definitions WHERE key = 'hdl'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'LDL-Cholesterin', 'Ein als schlechtes Cholesterin bekannter Blutfettwert. Gibt Auskunft über die Herz-Kreislauf-Gesundheit.'
FROM metric_definitions WHERE key = 'ldl'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Non-HDL-Cholesterin', 'Zeigt die Summe aller Cholesterinarten außer HDL. Gibt Auskunft über die Herz-Kreislauf-Gesundheit.'
FROM metric_definitions WHERE key = 'non_hdl'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Gesamtcholesterin', 'Ein Fettstoff im Blut. Der Körper benötigt ihn zum Zellaufbau und zur Hormonproduktion.'
FROM metric_definitions WHERE key = 'total_kolesterol'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Triglyzeride', 'Eine Art Blutfett. Der Körper benötigt Triglyzeride zur Energiespeicherung und -nutzung.'
FROM metric_definitions WHERE key = 'trigliserid'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'VLDL-Cholesterin', 'Ein von der Leber gebildetes Lipoprotein. Es ist für den Transport von Triglyzeriden im Körper verantwortlich.'
FROM metric_definitions WHERE key = 'vldl'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- TİROİD (3)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Freies T3', 'Ein aktives Hormon der Schilddrüse. Gibt Auskunft über Stoffwechselrate und Energielevel.'
FROM metric_definitions WHERE key = 'serbest_t3'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Freies T4', 'Ein Hormon der Schilddrüse. Gibt Auskunft über Schilddrüsenfunktion und Stoffwechsel.'
FROM metric_definitions WHERE key = 'serbest_t4'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'TSH (Thyreoidea-stimulierendes Hormon)', 'Ein Hormon der Hirnanhangdrüse. Zeigt, wie gut die Schilddrüse funktioniert.'
FROM metric_definitions WHERE key = 'tsh'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- TÜMÖR BELİRTEÇLERİ (4)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'CA-125', 'Ein Proteinmarker, der von bestimmten Körperzellen gebildet wird. Wird zur Überwachung der Gesundheit des Fortpflanzungssystems verwendet.'
FROM metric_definitions WHERE key = 'ca125'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'CA 15-3', 'Ein Proteinmarker, der von bestimmten Körperzellen gebildet wird. Wird zur Überwachung der Brustgesundheit verwendet.'
FROM metric_definitions WHERE key = 'ca153'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'CA 19-9', 'Ein Proteinmarker, der von bestimmten Körperzellen gebildet wird. Wird zur Überwachung der Gesundheit des Verdauungssystems verwendet.'
FROM metric_definitions WHERE key = 'ca199'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'CEA (Karzinoembryonales Antigen)', 'Ein im Körper gebildeter Proteinmarker. Ein Laborwert, der zur allgemeinen Gesundheitsüberwachung eingesetzt wird.'
FROM metric_definitions WHERE key = 'cea'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- VİTAMİN (3)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Vitamin B12', 'Ein Vitamin, das für die Nervenfunktion und die Blutbildung unverzichtbar ist. Wird über die Nahrung aufgenommen.'
FROM metric_definitions WHERE key = 'b12'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Folsäure', 'Ein B-Vitamin, das für Zellwachstum und Blutbildung wesentlich ist. Besonders wichtig in der Schwangerschaft.'
FROM metric_definitions WHERE key = 'folik_asit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'de', 'Vitamin D', 'Ein Vitamin für die Knochen- und Zahngesundheit. Hilft dem Körper, Kalzium aufzunehmen.'
FROM metric_definitions WHERE key = 'vitamin_d'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;
