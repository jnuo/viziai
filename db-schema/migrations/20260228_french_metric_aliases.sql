-- French metric aliases → Turkish canonical names
-- Maps common French lab report names (analyses de sang) to ViziAI canonical names

BEGIN;

INSERT INTO metric_aliases (alias, canonical_name) VALUES
  -- NFS (Numération Formule Sanguine) / CBC
  ('Hémoglobine', 'Hemoglobin'),
  ('Hématocrite', 'Hematokrit'),
  ('Érythrocytes', 'Eritrosit'),
  ('Globules rouges', 'Eritrosit'),
  ('Leucocytes', 'Lökosit'),
  ('Globules blancs', 'Lökosit'),
  ('Plaquettes', 'Trombosit'),
  ('Thrombocytes', 'Trombosit'),
  ('Volume plaquettaire moyen', 'MPV (Ortalama Trombosit Hacmi)'),
  ('Neutrophiles', 'Nötrofil#'),
  ('Lymphocytes', 'Lenfosit#'),
  ('Monocytes', 'Monosit#'),
  ('Éosinophiles', 'Eozinofil#'),
  ('Basophiles', 'Bazofil#'),
  ('Polynucléaires neutrophiles', 'Nötrofil#'),

  -- Métabolisme / Metabolic panel
  ('Potassium', 'Potasyum'),
  ('Sodium', 'Sodyum'),
  ('Calcémie', 'Kalsiyum'),
  ('Calcium', 'Kalsiyum'),
  ('Glycémie', 'Glukoz'),
  ('Glucose', 'Glukoz'),
  ('Glycémie à jeun', 'Glukoz'),
  ('Créatinine', 'Kreatinin'),
  ('Urée', 'Kan Üre Azotu'),
  ('Acide urique', 'Ürik Asit'),
  ('Chlorure', 'Klorür'),
  ('Magnésium', 'Magnezyum'),
  ('Phosphore', 'Fosfor'),
  ('Phosphatémie', 'Fosfor'),

  -- Foie / Liver
  ('Alanine aminotransférase', 'ALT (Alanin Aminotransferaz)'),
  ('Aspartate aminotransférase', 'AST (Aspartat Transaminaz)'),
  ('Gamma-glutamyltransférase', 'GGT (Gamma Glutamil Transferaz)'),
  ('Gamma GT', 'GGT (Gamma Glutamil Transferaz)'),
  ('Phosphatase alcaline', 'ALP (Alkalen Fosfataz)'),
  ('Phosphatases alcalines', 'ALP (Alkalen Fosfataz)'),
  ('Lactate déshydrogénase', 'LDH (Laktik Dehidrogenaz)'),
  ('Bilirubine totale', 'Total Bilirubin'),
  ('Bilirubine directe', 'Direkt Bilirubin'),
  ('Bilirubine conjuguée', 'Direkt Bilirubin'),
  ('Albumine', 'Albümin'),
  ('Protéines totales', 'Total Protein'),

  -- Rein / Kidney
  ('Débit de filtration glomérulaire', 'eGFR (Glomerüler Filtrasyon Hızı)'),

  -- Lipides / Lipids
  ('Cholestérol total', 'Total Kolesterol'),
  ('LDL-cholestérol', 'LDL Kolesterol'),
  ('HDL-cholestérol', 'HDL Kolesterol'),
  ('Triglycérides', 'Trigliserid'),

  -- Thyroïde / Thyroid
  ('T3 libre', 'Serbest T3'),
  ('T4 libre', 'Serbest T4'),

  -- Fer / Iron
  ('Fer sérique', 'Demir'),
  ('Ferritine', 'Ferritin'),
  ('Saturation de la transferrine', 'Transferrin Satürasyonu'),

  -- Inflammation
  ('Protéine C-réactive', 'CRP (C-Reaktif Protein)'),
  ('Vitesse de sédimentation', 'Sedimantasyon'),

  -- Vitamines
  ('Vitamine B12', 'Vitamin B12'),
  ('Acide folique', 'Folik Asit'),
  ('25-hydroxyvitamine D', 'Vitamin D'),
  ('Vitamine D', 'Vitamin D'),

  -- Coagulation
  ('Temps de céphaline activée', 'APTT (Parsiyel Tromboplastin Zamanı)'),
  ('Temps de prothrombine', 'Protrombin Zamanı')

ON CONFLICT (alias) DO NOTHING;

COMMIT;
