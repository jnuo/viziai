-- MT-010: French (FR) translations — display_name + description for all 155 metrics
-- Applied to Neon test branch: metric-translations-test (ep-raspy-bar-agiah0ev)

-- ==================
-- BİYOKİMYA (24)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Albumine', 'Proteine produite par le foie qui maintient l''equilibre des liquides dans l''organisme.'
FROM metric_definitions WHERE key = 'albumin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Amylase', 'Enzyme produite par le pancreas et les glandes salivaires qui aide a digerer les feculents.'
FROM metric_definitions WHERE key = 'amilaz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Zinc', 'Mineral essentiel pour le systeme immunitaire, la cicatrisation et la croissance.'
FROM metric_definitions WHERE key = 'cinko'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Calcium Corrige', 'Valeur du calcium ajustee en fonction du taux d''albumine. Offre une image plus precise du statut calcique.'
FROM metric_definitions WHERE key = 'duzeltilmis_kalsiyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'DFGe (Debit de Filtration Glomerulaire estime)', 'Valeur calculee indiquant l''efficacite de la filtration renale. Renseigne sur la fonction des reins.'
FROM metric_definitions WHERE key = 'egfr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Phosphore', 'Mineral present dans les os et les dents. Intervient egalement dans la production d''energie.'
FROM metric_definitions WHERE key = 'fosfor'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Globuline', 'Groupe de proteines impliquees dans la defense immunitaire et le transport de substances dans l''organisme.'
FROM metric_definitions WHERE key = 'globulin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Glucose', 'Indique le taux de sucre dans le sang. C''est la principale source d''energie de l''organisme.'
FROM metric_definitions WHERE key = 'glukoz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Calcium', 'Mineral essentiel pour la sante des os et des dents. Intervient aussi dans la fonction musculaire et nerveuse.'
FROM metric_definitions WHERE key = 'kalsiyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Chlorure', 'Electrolyte qui aide a reguler l''equilibre des liquides et l''equilibre acido-basique de l''organisme.'
FROM metric_definitions WHERE key = 'klorur'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Creatine Kinase (CK)', 'Enzyme presente dans les muscles, le coeur et le cerveau. Renseigne sur la sante musculaire.'
FROM metric_definitions WHERE key = 'kreatin_kinaz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Creatinine', 'Dechet issu de l''activite musculaire normale. Indique le bon fonctionnement des reins.'
FROM metric_definitions WHERE key = 'kreatinin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Clairance de la Creatinine', 'Mesure la vitesse a laquelle les reins eliminent la creatinine du sang. Renseigne sur la fonction renale.'
FROM metric_definitions WHERE key = 'kreatinin_klerens'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Lipase', 'Enzyme produite par le pancreas qui aide a digerer les graisses. Renseigne sur la sante pancreatique.'
FROM metric_definitions WHERE key = 'lipaz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Magnesium', 'Mineral essentiel pour les muscles, les nerfs et les os. Intervient dans de nombreux processus biochimiques.'
FROM metric_definitions WHERE key = 'magnezyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'HGPO 75g a jeun (0 min)', 'Glycemie a jeun avant un test de tolerance au glucose. Aide a comprendre comment l''organisme gere le sucre.'
FROM metric_definitions WHERE key = 'ogtt_0dk'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'HGPO 75g 60 min', 'Glycemie une heure apres le debut du test de tolerance au glucose. Montre la vitesse de traitement du sucre.'
FROM metric_definitions WHERE key = 'ogtt_60dk'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'HGPO 75g 120 min', 'Glycemie deux heures apres le debut du test de tolerance au glucose. Montre le temps de traitement du sucre.'
FROM metric_definitions WHERE key = 'ogtt_120dk'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Potassium', 'Mineral necessaire au bon fonctionnement des muscles et des nerfs.'
FROM metric_definitions WHERE key = 'potasyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Sodium', 'Mineral qui regule l''equilibre des liquides dans l''organisme. Intervient aussi dans la fonction nerveuse et musculaire.'
FROM metric_definitions WHERE key = 'sodyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Proteines Totales', 'Indique la quantite totale de proteines dans le sang. Renseigne sur la nutrition et la sante des organes.'
FROM metric_definitions WHERE key = 'total_protein'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Azote Ureique Sanguin (BUN)', 'Dechet issu de la degradation des proteines. Renseigne sur la fonction renale.'
FROM metric_definitions WHERE key = 'ure'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Uree', 'Dechet forme par la degradation des proteines dans le foie. Reflete la capacite des reins a l''eliminer.'
FROM metric_definitions WHERE key = 'urea'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Acide Urique', 'Dechet issu de la degradation des purines dans l''organisme. Elimine par les reins.'
FROM metric_definitions WHERE key = 'urik_asit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- DEMİR (5)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Fer', 'Indique le taux de fer dans le sang. L''organisme a besoin de fer pour transporter l''oxygene et produire de l''energie.'
FROM metric_definitions WHERE key = 'demir'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Ferritine', 'Proteine qui stocke le fer dans l''organisme. Renseigne sur les reserves en fer.'
FROM metric_definitions WHERE key = 'ferritin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'CTF (Capacite Totale de Fixation du Fer)', 'Indique la quantite de fer que les proteines sanguines peuvent transporter. Renseigne sur l''equilibre en fer.'
FROM metric_definitions WHERE key = 'tdbk'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Saturation de la Transferrine', 'Indique le pourcentage de transferrine chargee en fer dans le sang.'
FROM metric_definitions WHERE key = 'transferrin_sat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'CLNF (Capacite Latente de Fixation du Fer)', 'Indique la quantite de fer supplementaire que les proteines sanguines peuvent encore fixer. Renseigne sur l''equilibre en fer.'
FROM metric_definitions WHERE key = 'uibc'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- DİĞER (2)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'HbA1c (Hemoglobine Glyquee)', 'Reflete la glycemie moyenne des deux a trois derniers mois. Renseigne sur le controle du sucre a long terme.'
FROM metric_definitions WHERE key = 'hba1c'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Hormone Parathyroidienne (PTH)', 'Hormone produite par les glandes parathyroides. Aide a reguler l''equilibre du calcium et du phosphore.'
FROM metric_definitions WHERE key = 'parathormon'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- ENFLAMASYON (3)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'CRP (Proteine C-Reactive)', 'Proteine produite par le foie. Indique la presence d''une inflammation dans l''organisme.'
FROM metric_definitions WHERE key = 'crp'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Procalcitonine', 'Proteine produite dans l''organisme. Renseigne sur la presence d''une infection bacterienne.'
FROM metric_definitions WHERE key = 'prokalsitonin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'VS (Vitesse de Sedimentation)', 'Mesure la vitesse a laquelle les globules rouges sedimentent. Renseigne sur la presence d''une inflammation.'
FROM metric_definitions WHERE key = 'sedimantasyon'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- HEMOGRAM (36)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Basophiles (nombre)', 'Type de globule blanc implique dans le systeme immunitaire. Intervient dans les reactions allergiques et immunitaires.'
FROM metric_definitions WHERE key = 'bazofil_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Basophiles %', 'Indique le pourcentage de basophiles parmi les globules blancs. Renseigne sur l''equilibre du systeme immunitaire.'
FROM metric_definitions WHERE key = 'bazofil_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Eosinophiles (nombre)', 'Type de globule blanc implique dans le systeme immunitaire. Intervient dans les reactions allergiques et la defense antiparasitaire.'
FROM metric_definitions WHERE key = 'eozinofil_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Eosinophiles %', 'Indique le pourcentage d''eosinophiles parmi les globules blancs. Renseigne sur la reponse immunitaire.'
FROM metric_definitions WHERE key = 'eozinofil_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Erythroblastes (nombre)', 'Cellules jeunes produites dans la moelle osseuse qui deviennent des globules rouges en murissant.'
FROM metric_definitions WHERE key = 'eritroblast_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Erythroblastes %', 'Indique le pourcentage de globules rouges immatures dans le sang. Renseigne sur la fonction de la moelle osseuse.'
FROM metric_definitions WHERE key = 'eritroblast_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Globules Rouges (GR)', 'Cellules sanguines qui transportent l''oxygene vers tous les tissus de l''organisme.'
FROM metric_definitions WHERE key = 'eritrosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Hematocrite', 'Indique la proportion de globules rouges par rapport au volume total de sang.'
FROM metric_definitions WHERE key = 'hematokrit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Hemoglobine', 'Proteine des globules rouges qui transporte l''oxygene des poumons vers le reste du corps.'
FROM metric_definitions WHERE key = 'hemoglobin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'HFR (Fraction Reticulocytaire de Haute Fluorescence)', 'Indique la proportion des reticulocytes les plus jeunes liberes par la moelle osseuse. Renseigne sur le rythme de production sanguine.'
FROM metric_definitions WHERE key = 'hfr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Granulocytes Immatures (nombre)', 'Nombre de jeunes globules blancs pas encore arrives a maturite dans la moelle osseuse. Renseigne sur l''etat du systeme immunitaire.'
FROM metric_definitions WHERE key = 'ig_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Granulocytes Immatures %', 'Rapport entre les globules blancs immatures et le total des globules blancs.'
FROM metric_definitions WHERE key = 'ig_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'IRF (Fraction Reticulocytaire Immature)', 'Indique la proportion de jeunes globules rouges liberes par la moelle osseuse. Renseigne sur la capacite de production medullaire.'
FROM metric_definitions WHERE key = 'irf'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Lymphocytes (nombre)', 'Cellule cle du systeme immunitaire. Protege l''organisme contre les infections.'
FROM metric_definitions WHERE key = 'lenfosit_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Lymphocytes %', 'Indique le pourcentage de lymphocytes parmi les globules blancs. Renseigne sur l''equilibre du systeme immunitaire.'
FROM metric_definitions WHERE key = 'lenfosit_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'LFR (Fraction Reticulocytaire de Basse Fluorescence)', 'Indique la proportion de reticulocytes matures. Renseigne sur le processus de maturation des globules rouges.'
FROM metric_definitions WHERE key = 'lfr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Globules Blancs (GB)', 'Cellules sanguines qui defendent l''organisme contre les infections. Reflete l''etat general du systeme immunitaire.'
FROM metric_definitions WHERE key = 'lokosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'TCMH (Teneur Corpusculaire Moyenne en Hemoglobine)', 'Indique la quantite moyenne d''hemoglobine dans un globule rouge. Renseigne sur la capacite de transport d''oxygene.'
FROM metric_definitions WHERE key = 'mch'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'CCMH (Concentration Corpusculaire Moyenne en Hemoglobine)', 'Indique la concentration d''hemoglobine dans les globules rouges. Renseigne sur la capacite de transport d''oxygene.'
FROM metric_definitions WHERE key = 'mchc'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'VGM (Volume Globulaire Moyen)', 'Indique la taille moyenne des globules rouges. Renseigne sur la production des cellules sanguines.'
FROM metric_definitions WHERE key = 'mcv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'MFR (Fraction Reticulocytaire de Fluorescence Moyenne)', 'Indique la proportion de reticulocytes a un stade intermediaire de maturation. Renseigne sur la maturation des globules rouges.'
FROM metric_definitions WHERE key = 'mfr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Monocytes (nombre)', 'Grands globules blancs du systeme immunitaire. Protegent l''organisme contre les micro-organismes nuisibles.'
FROM metric_definitions WHERE key = 'monosit_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Monocytes %', 'Indique le pourcentage de monocytes parmi les globules blancs. Renseigne sur l''equilibre du systeme immunitaire.'
FROM metric_definitions WHERE key = 'monosit_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'VPM (Volume Plaquettaire Moyen)', 'Indique la taille moyenne des plaquettes. Renseigne sur la production plaquettaire de la moelle osseuse.'
FROM metric_definitions WHERE key = 'mpv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'RNL (Rapport Neutrophiles/Lymphocytes)', 'Rapport entre les neutrophiles et les lymphocytes. Renseigne sur l''equilibre immunitaire global de l''organisme.'
FROM metric_definitions WHERE key = 'nlr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Neutrophiles (nombre)', 'Globule blanc le plus frequent du systeme immunitaire. Joue un role majeur dans la defense contre les bacteries.'
FROM metric_definitions WHERE key = 'notrofil_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Neutrophiles %', 'Indique le pourcentage de neutrophiles parmi les globules blancs. Renseigne sur l''equilibre du systeme immunitaire.'
FROM metric_definitions WHERE key = 'notrofil_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'PCT (Plaquettocrite)', 'Indique la proportion de plaquettes par rapport au volume total de sang. Renseigne sur le systeme de coagulation.'
FROM metric_definitions WHERE key = 'pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'IDPl (Indice de Distribution Plaquettaire)', 'Indique la variation de taille des plaquettes. Renseigne sur la production plaquettaire de la moelle osseuse.'
FROM metric_definitions WHERE key = 'pdw'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'P-LCR (Rapport de Grandes Plaquettes)', 'Indique la proportion de grandes plaquettes par rapport au total. Renseigne sur la production plaquettaire.'
FROM metric_definitions WHERE key = 'plcr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'IDR (Indice de Distribution des Globules Rouges)', 'Indique la variation de taille des globules rouges. Renseigne sur la production des cellules sanguines.'
FROM metric_definitions WHERE key = 'rdw'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'IDR-CV', 'Indique la distribution de taille des globules rouges en pourcentage. Renseigne sur la regularite de la production sanguine.'
FROM metric_definitions WHERE key = 'rdw_cv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'IDR-SD', 'Indique la distribution de taille des globules rouges en ecart-type. Renseigne sur la diversite des cellules sanguines.'
FROM metric_definitions WHERE key = 'rdw_sd'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Reticulocytes (nombre)', 'Nombre de jeunes globules rouges liberes par la moelle osseuse. Renseigne sur le rythme de production medullaire.'
FROM metric_definitions WHERE key = 'reticulocyte_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Reticulocytes %', 'Proportion de jeunes globules rouges par rapport au total. Renseigne sur la fonction de la moelle osseuse.'
FROM metric_definitions WHERE key = 'reticulocyte_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Plaquettes', 'Cellules sanguines qui participent a la coagulation. Aident a stopper les saignements apres une blessure.'
FROM metric_definitions WHERE key = 'trombosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- HORMON (2)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Beta-hCG', 'Hormone qui augmente pendant la grossesse. Mesuree pour la detection et le suivi de la grossesse.'
FROM metric_definitions WHERE key = 'beta_hcg'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Insuline', 'Hormone secretee par le pancreas. Permet au sucre sanguin d''entrer dans les cellules pour produire de l''energie.'
FROM metric_definitions WHERE key = 'insulin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- İDRAR (28)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Creatinine Urinaire 24h', 'Indique la quantite de creatinine filtree par les reins en 24 heures. Renseigne sur la fonction renale.'
FROM metric_definitions WHERE key = 'idrar_24h_kreatinin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Microalbumine Urinaire 24h', 'Mesure la faible quantite de proteine albumine excretee dans les urines sur 24 heures. Renseigne sur la sante renale.'
FROM metric_definitions WHERE key = 'idrar_24h_mikroalbumin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Proteinurie 24h', 'Indique la quantite totale de proteines excretees dans les urines sur 24 heures. Renseigne sur la filtration renale.'
FROM metric_definitions WHERE key = 'idrar_24h_protein'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Albumine Urinaire', 'Indique la quantite de proteine albumine dans les urines. Renseigne sur la fonction de filtration renale.'
FROM metric_definitions WHERE key = 'idrar_albumin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Rapport Albumine/Creatinine Urinaire', 'Rapport entre l''albumine et la creatinine dans les urines. Utilise pour evaluer la fonction renale.'
FROM metric_definitions WHERE key = 'idrar_albumin_kreatinin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Phosphates Amorphes Urinaires', 'Cristaux de phosphate retrouves dans les urines. Renseigne sur la composition urinaire et l''equilibre mineral.'
FROM metric_definitions WHERE key = 'idrar_amorf_fosfat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Corps Cetoniques Urinaires', 'Indique la quantite de substances produites lorsque l''organisme utilise les graisses comme source d''energie.'
FROM metric_definitions WHERE key = 'idrar_asetoasetat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Bacteries Urinaires', 'Indique la presence de bacteries dans les urines. Renseigne sur la sante des voies urinaires.'
FROM metric_definitions WHERE key = 'idrar_bakteri'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Bilirubine Urinaire', 'Indique la quantite de bilirubine dans les urines, issue de la degradation des globules rouges. Renseigne sur la sante hepatique.'
FROM metric_definitions WHERE key = 'idrar_bilirubin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Oxalate de Calcium Dihydrate Urinaire', 'Type de cristal retrouve dans les urines. Renseigne sur la composition minerale des urines.'
FROM metric_definitions WHERE key = 'idrar_ca_oksalat_dihidrat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Oxalate de Calcium Monohydrate Urinaire', 'Type de cristal retrouve dans les urines. Renseigne sur la composition minerale et le metabolisme.'
FROM metric_definitions WHERE key = 'idrar_ca_oksalat_monohidrat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Densite Urinaire', 'Indique la concentration des urines. Renseigne sur la capacite des reins a concentrer les urines.'
FROM metric_definitions WHERE key = 'idrar_dansite'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Cellules Epitheliales Urinaires', 'Indique la quantite de cellules desquamees de la paroi des voies urinaires. Renseigne sur la sante urinaire.'
FROM metric_definitions WHERE key = 'idrar_epitel'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Globules Rouges Urinaires', 'Indique le nombre de globules rouges dans les urines. Renseigne sur la sante renale et des voies urinaires.'
FROM metric_definitions WHERE key = 'idrar_eritrosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Glucose Urinaire', 'Indique la quantite de sucre dans les urines. Renseigne sur la capacite des reins a reabsorber le sucre.'
FROM metric_definitions WHERE key = 'idrar_glukoz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Cylindres Granuleux Urinaires', 'Structures cylindriques granuleuses formees dans les tubules renaux. Renseigne sur la fonction renale.'
FROM metric_definitions WHERE key = 'idrar_granuler_silendir'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Cylindres Hyalins Urinaires', 'Structures cylindriques transparentes formees dans les tubules renaux. De petites quantites sont normales.'
FROM metric_definitions WHERE key = 'idrar_hyalen_silendir'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Sang Urinaire', 'Indique la presence de sang dans les urines. Renseigne sur la sante renale et des voies urinaires.'
FROM metric_definitions WHERE key = 'idrar_kan'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Creatinine Urinaire', 'Indique la quantite de creatinine dans les urines. Renseigne sur la capacite de filtration des reins.'
FROM metric_definitions WHERE key = 'idrar_kreatinin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Leucocytes Urinaires (microscopie)', 'Indique le nombre microscopique de globules blancs dans les urines. Renseigne sur la sante des voies urinaires.'
FROM metric_definitions WHERE key = 'idrar_lokosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Leucocyte Esterase Urinaire', 'Detecte une enzyme produite par les globules blancs dans les urines. Renseigne sur la sante des voies urinaires.'
FROM metric_definitions WHERE key = 'idrar_lokosit_esteraz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Levures Urinaires', 'Indique la presence de levures dans les urines. Renseigne sur la sante des voies urinaires.'
FROM metric_definitions WHERE key = 'idrar_maya'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Cellules Epitheliales Non Malpighiennes Urinaires', 'Indique la quantite de cellules des couches profondes des voies urinaires. Renseigne sur la sante renale et urinaire.'
FROM metric_definitions WHERE key = 'idrar_non_skuamoz_epitel'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'pH Urinaire', 'Indique l''acidite ou l''alcalinite des urines. Renseigne sur la capacite des reins a reguler l''equilibre acido-basique.'
FROM metric_definitions WHERE key = 'idrar_ph'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Proteine Urinaire', 'Indique la quantite de proteines dans les urines. Renseigne sur la fonction de filtration renale.'
FROM metric_definitions WHERE key = 'idrar_protein'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Cristaux d''Acide Urique Urinaires', 'Cristaux d''acide urique retrouves dans les urines. Renseigne sur la composition minerale des urines.'
FROM metric_definitions WHERE key = 'idrar_urik_asit_kristal'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Urobilinogene Urinaire', 'Indique la quantite d''une substance formee par la transformation de la bilirubine dans les intestins. Renseigne sur la sante hepatique.'
FROM metric_definitions WHERE key = 'idrar_urobilinojen'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Volume Urinaire', 'Indique la quantite d''urine recueillie sur une periode donnee. Renseigne sur la fonction renale et l''equilibre hydrique.'
FROM metric_definitions WHERE key = 'idrar_volum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- İMMÜNOLOJİ (12)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Anti-CMV IgG', 'Anticorps indiquant une exposition anterieure au cytomegalovirus (CMV).'
FROM metric_definitions WHERE key = 'anti_cmv_igg'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Anti-CMV IgM', 'Anticorps indiquant une exposition recente au cytomegalovirus (CMV).'
FROM metric_definitions WHERE key = 'anti_cmv_igm'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Anti-VHC', 'Detecte les anticorps produits par l''organisme contre le virus de l''hepatite C.'
FROM metric_definitions WHERE key = 'anti_hcv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Anti-VIH', 'Detecte les anticorps produits par l''organisme contre le virus du VIH.'
FROM metric_definitions WHERE key = 'anti_hiv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Anti-Rubeole IgG', 'Anticorps indiquant une immunite contre la rubeole.'
FROM metric_definitions WHERE key = 'anti_rubella_igg'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Anti-Rubeole IgM', 'Anticorps indiquant une exposition recente a la rubeole.'
FROM metric_definitions WHERE key = 'anti_rubella_igm'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Anti-Toxoplasme IgG', 'Anticorps indiquant une exposition anterieure au parasite toxoplasme.'
FROM metric_definitions WHERE key = 'anti_toxo_igg'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Anti-Toxoplasme IgM', 'Anticorps indiquant une exposition recente au parasite toxoplasme.'
FROM metric_definitions WHERE key = 'anti_toxo_igm'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'AgHBs (Antigene de Surface de l''Hepatite B)', 'Detecte l''antigene de surface du virus de l''hepatite B. Renseigne sur le statut de porteur de l''hepatite B.'
FROM metric_definitions WHERE key = 'hbsag'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Facteur Rhumatoide (FR)', 'Anticorps produit par le systeme immunitaire. Renseigne sur la sante articulaire.'
FROM metric_definitions WHERE key = 'romatoid_faktor'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'IgE Totales', 'Type d''anticorps produit par le systeme immunitaire qui intervient dans les reactions allergiques.'
FROM metric_definitions WHERE key = 'total_ige'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'VDRL-RPR', 'Test de depistage qui detecte les anticorps produits par l''organisme contre l''infection syphilitique.'
FROM metric_definitions WHERE key = 'vdrl_rpr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- KAN GAZI (12)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Trou Anionique', 'Indique la difference entre les ions positifs et negatifs dans le sang. Renseigne sur l''equilibre acido-basique.'
FROM metric_definitions WHERE key = 'anion_gap'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Exces de Base (Sang)', 'Indique l''exces ou le deficit de bases dans le sang. Renseigne sur l''equilibre acido-basique de l''organisme.'
FROM metric_definitions WHERE key = 'be_b'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Exces de Base (LEC)', 'Indique l''exces de bases dans le liquide extracellulaire. Renseigne sur l''equilibre acido-basique de l''organisme.'
FROM metric_definitions WHERE key = 'be_ecf'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Bicarbonates (HCO3)', 'Indique le taux de bicarbonates dans le sang. Renseigne sur la capacite des reins a reguler l''equilibre acido-basique.'
FROM metric_definitions WHERE key = 'hco3'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Calcium Ionise (Ca++)', 'Indique la quantite de calcium actif et libre dans le sang. Important pour la fonction musculaire et nerveuse.'
FROM metric_definitions WHERE key = 'ionized_calcium'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Lactate', 'Substance produite lorsque les cellules generent de l''energie sans oxygene. Renseigne sur l''utilisation de l''oxygene par les tissus.'
FROM metric_definitions WHERE key = 'lactate'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'PCO2 (Pression Partielle de Dioxyde de Carbone)', 'Indique la pression de dioxyde de carbone dans le sang. Renseigne sur le bon fonctionnement des poumons.'
FROM metric_definitions WHERE key = 'pco2'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'PO2 (Pression Partielle d''Oxygene)', 'Indique la pression d''oxygene dans le sang. Renseigne sur la capacite d''absorption d''oxygene des poumons.'
FROM metric_definitions WHERE key = 'po2'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'BSC (Bicarbonates Standard)', 'Indique le taux de bicarbonates dans le sang dans des conditions standard. Renseigne sur l''equilibre acido-basique.'
FROM metric_definitions WHERE key = 'sbc'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Saturation en Oxygene (SpO2)', 'Indique le pourcentage d''hemoglobine transportant de l''oxygene. Renseigne sur le statut en oxygene de l''organisme.'
FROM metric_definitions WHERE key = 'spo2'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'CO2 Total (TCO2)', 'Indique la quantite totale de dioxyde de carbone dans le sang. Renseigne sur l''equilibre acido-basique.'
FROM metric_definitions WHERE key = 'tco2'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Hemoglobine Totale (tHb)', 'Quantite totale d''hemoglobine mesuree par gazometrie sanguine. Indique la capacite de transport d''oxygene du sang.'
FROM metric_definitions WHERE key = 'thb'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- KARACİĞER (8)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'PAL (Phosphatase Alcaline)', 'Enzyme presente dans le foie et les os. Renseigne sur la sante hepatique et osseuse.'
FROM metric_definitions WHERE key = 'alp'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'ALAT (Alanine Aminotransferase)', 'Enzyme presente dans le foie. Renseigne sur la sante hepatique.'
FROM metric_definitions WHERE key = 'alt'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'ASAT (Aspartate Aminotransferase)', 'Enzyme presente dans le foie, le coeur et les muscles. Renseigne principalement sur la sante hepatique.'
FROM metric_definitions WHERE key = 'ast'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Bilirubine Directe', 'Indique la quantite de bilirubine traitee par le foie. Renseigne sur la sante du foie et des voies biliaires.'
FROM metric_definitions WHERE key = 'direkt_bilirubin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'GGT (Gamma-Glutamyl Transferase)', 'Enzyme presente dans le foie et les voies biliaires. Renseigne sur la sante hepatique.'
FROM metric_definitions WHERE key = 'ggt'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Bilirubine Indirecte', 'Indique la quantite de bilirubine issue de la degradation des globules rouges non encore traitee par le foie.'
FROM metric_definitions WHERE key = 'indirekt_bilirubin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'LDH (Lactate Deshydrogenase)', 'Enzyme presente dans de nombreux tissus de l''organisme. Renseigne sur la sante cellulaire et l''integrite des tissus.'
FROM metric_definitions WHERE key = 'ldh'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Bilirubine Totale', 'Substance jaunatre formee par la degradation des globules rouges. Renseigne sur la sante hepatique.'
FROM metric_definitions WHERE key = 'total_bilirubin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- KARDİYAK (1)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Troponine I', 'Proteine presente dans le muscle cardiaque. Renseigne sur la sante du muscle du coeur.'
FROM metric_definitions WHERE key = 'troponin_i'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- KOAGÜLASYON (6)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'TCA (Temps de Cephaline Activee)', 'Test qui mesure le temps de coagulation du sang. Renseigne sur le fonctionnement du systeme de coagulation.'
FROM metric_definitions WHERE key = 'aptt'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'D-Dimeres', 'Fragment de proteine produit lors de la dissolution d''un caillot sanguin. Renseigne sur le systeme de coagulation.'
FROM metric_definitions WHERE key = 'd_dimer'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Fibrinogene', 'Proteine produite par le foie qui joue un role dans la coagulation sanguine.'
FROM metric_definitions WHERE key = 'fibrinojen'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'INR (Rapport Normalise International)', 'Indique la vitesse de coagulation du sang sur une echelle standardisee. Renseigne sur le systeme de coagulation.'
FROM metric_definitions WHERE key = 'inr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Temps de Prothrombine (TP)', 'Mesure le temps necessaire a la coagulation du sang. Renseigne sur les facteurs de coagulation.'
FROM metric_definitions WHERE key = 'pt'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Temps de Prothrombine (% Activite)', 'Indique le pourcentage d''activite des facteurs de coagulation. Renseigne sur le niveau de fonctionnement du systeme.'
FROM metric_definitions WHERE key = 'pt_activity'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- LİPİD (6)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Cholesterol HDL', 'Type de graisse connu comme le bon cholesterol. Aide a proteger la sante cardiovasculaire.'
FROM metric_definitions WHERE key = 'hdl'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Cholesterol LDL', 'Type de graisse connu comme le mauvais cholesterol. Renseigne sur la sante cardiovasculaire.'
FROM metric_definitions WHERE key = 'ldl'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Cholesterol Non-HDL', 'Indique le total de tous les types de cholesterol sauf le HDL. Renseigne sur la sante cardiovasculaire.'
FROM metric_definitions WHERE key = 'non_hdl'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Cholesterol Total', 'Substance grasse presente dans le sang. L''organisme l''utilise pour construire des cellules et produire des hormones.'
FROM metric_definitions WHERE key = 'total_kolesterol'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Triglycerides', 'Type de graisse presente dans le sang. L''organisme a besoin de triglycerides pour stocker et utiliser l''energie.'
FROM metric_definitions WHERE key = 'trigliserid'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Cholesterol VLDL', 'Type de lipoproteines produit par le foie. Responsable du transport des triglycerides dans l''organisme.'
FROM metric_definitions WHERE key = 'vldl'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- TİROİD (3)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'T3 Libre', 'Hormone active produite par la glande thyroide. Renseigne sur le metabolisme et les niveaux d''energie.'
FROM metric_definitions WHERE key = 'serbest_t3'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'T4 Libre', 'Hormone produite par la glande thyroide. Renseigne sur la fonction thyroidienne et le metabolisme.'
FROM metric_definitions WHERE key = 'serbest_t4'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'TSH (Hormone Thyreostimulante)', 'Hormone produite par l''hypophyse. Indique le bon fonctionnement de la glande thyroide.'
FROM metric_definitions WHERE key = 'tsh'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- TÜMÖR BELİRTEÇLERİ (4)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'CA-125', 'Marqueur proteique produit par certaines cellules de l''organisme. Utilise dans le suivi de la sante de l''appareil reproducteur.'
FROM metric_definitions WHERE key = 'ca125'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'CA 15-3', 'Marqueur proteique produit par certaines cellules de l''organisme. Utilise dans le suivi de la sante mammaire.'
FROM metric_definitions WHERE key = 'ca153'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'CA 19-9', 'Marqueur proteique produit par certaines cellules de l''organisme. Utilise dans le suivi de la sante digestive.'
FROM metric_definitions WHERE key = 'ca199'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'ACE (Antigene Carcino-Embryonnaire)', 'Marqueur proteique produit dans l''organisme. Valeur de laboratoire utilisee dans le suivi de la sante generale.'
FROM metric_definitions WHERE key = 'cea'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- VİTAMİN (3)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Vitamine B12', 'Vitamine essentielle au fonctionnement du systeme nerveux et a la production de cellules sanguines. Obtenue par l''alimentation.'
FROM metric_definitions WHERE key = 'b12'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Acide Folique', 'Vitamine B essentielle a la croissance cellulaire et a la production de cellules sanguines. Particulierement importante pendant la grossesse.'
FROM metric_definitions WHERE key = 'folik_asit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'fr', 'Vitamine D', 'Vitamine essentielle a la sante des os et des dents. Aide l''organisme a utiliser le calcium.'
FROM metric_definitions WHERE key = 'vitamin_d'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;
