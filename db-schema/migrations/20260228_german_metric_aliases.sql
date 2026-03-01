-- German metric aliases → Turkish canonical names
-- Maps common German lab report names (Laborwerte) to ViziAI canonical names

BEGIN;

INSERT INTO metric_aliases (alias, canonical_name) VALUES
  -- CBC (Blutbild)
  ('Hämoglobin', 'Hemoglobin'),
  ('Hämatokrit', 'Hematokrit'),
  ('Erythrozyten', 'Eritrosit'),
  ('Rote Blutkörperchen', 'Eritrosit'),
  ('Leukozyten', 'Lökosit'),
  ('Weiße Blutkörperchen', 'Lökosit'),
  ('Thrombozyten', 'Trombosit'),
  ('Blutplättchen', 'Trombosit'),
  ('Mittleres Thrombozytenvolumen', 'MPV (Ortalama Trombosit Hacmi)'),
  ('Neutrophile', 'Nötrofil#'),
  ('Lymphozyten', 'Lenfosit#'),
  ('Monozyten', 'Monosit#'),
  ('Eosinophile', 'Eozinofil#'),
  ('Basophile', 'Bazofil#'),

  -- Metabolic panel (Stoffwechsel)
  ('Kalium', 'Potasyum'),
  ('Natrium', 'Sodyum'),
  ('Kalzium', 'Kalsiyum'),
  ('Calcium', 'Kalsiyum'),
  ('Glukose', 'Glukoz'),
  ('Blutzucker', 'Glukoz'),
  ('Nüchternglukose', 'Glukoz'),
  ('Kreatinin', 'Kreatinin'),
  ('Harnstoff', 'Kan Üre Azotu'),
  ('Harnsäure', 'Ürik Asit'),
  ('Chlorid', 'Klorür'),
  ('Magnesium', 'Magnezyum'),
  ('Phosphat', 'Fosfor'),

  -- Liver (Leber)
  ('Alanin-Aminotransferase', 'ALT (Alanin Aminotransferaz)'),
  ('GPT', 'ALT (Alanin Aminotransferaz)'),
  ('Aspartat-Aminotransferase', 'AST (Aspartat Transaminaz)'),
  ('GOT', 'AST (Aspartat Transaminaz)'),
  ('Gamma-GT', 'GGT (Gamma Glutamil Transferaz)'),
  ('Alkalische Phosphatase', 'ALP (Alkalen Fosfataz)'),
  ('Laktatdehydrogenase', 'LDH (Laktik Dehidrogenaz)'),
  ('Gesamtbilirubin', 'Total Bilirubin'),
  ('Direktes Bilirubin', 'Direkt Bilirubin'),
  ('Konjugiertes Bilirubin', 'Direkt Bilirubin'),
  ('Albumin', 'Albümin'),
  ('Gesamteiweiß', 'Total Protein'),

  -- Kidney (Niere)
  ('Glomeruläre Filtrationsrate', 'eGFR (Glomerüler Filtrasyon Hızı)'),

  -- Lipids (Blutfette)
  ('Gesamtcholesterin', 'Total Kolesterol'),
  ('LDL-Cholesterin', 'LDL Kolesterol'),
  ('HDL-Cholesterin', 'HDL Kolesterol'),
  ('Triglyceride', 'Trigliserid'),

  -- Thyroid (Schilddrüse)
  ('Freies T3', 'Serbest T3'),
  ('Freies T4', 'Serbest T4'),

  -- Iron (Eisen)
  ('Eisen', 'Demir'),
  ('Transferrinsättigung', 'Transferrin Satürasyonu'),

  -- Inflammation (Entzündung)
  ('C-reaktives Protein', 'CRP (C-Reaktif Protein)'),
  ('Blutsenkung', 'Sedimantasyon'),
  ('Blutsenkungsgeschwindigkeit', 'Sedimantasyon'),

  -- Vitamins
  ('Folsäure', 'Folik Asit'),
  ('25-Hydroxyvitamin D', 'Vitamin D'),

  -- Coagulation (Gerinnung)
  ('Partielle Thromboplastinzeit', 'APTT (Parsiyel Tromboplastin Zamanı)'),
  ('Prothrombinzeit', 'Protrombin Zamanı')

ON CONFLICT (alias) DO NOTHING;

COMMIT;
