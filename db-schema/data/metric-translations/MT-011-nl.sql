-- MT-011: Dutch (NL) translations — display_name + description for all 155 metrics
-- Applied to Neon test branch: metric-translations-test (ep-raspy-bar-agiah0ev)

-- ==================
-- BIOCHEMIE (24)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Albumine', 'Een eiwit dat door de lever wordt aangemaakt en helpt bij het handhaven van de vochtbalans in het lichaam.'
FROM metric_definitions WHERE key = 'albumin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Amylase', 'Een enzym dat door de alvleesklier en speekselklieren wordt geproduceerd en helpt bij de vertering van zetmeelrijke voeding.'
FROM metric_definitions WHERE key = 'amilaz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Zink', 'Een mineraal dat essentieel is voor het immuunsysteem, wondgenezing en groei.'
FROM metric_definitions WHERE key = 'cinko'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Gecorrigeerd Calcium', 'Een calciumwaarde gecorrigeerd voor het albuminegehalte. Geeft een nauwkeuriger beeld van de calciumstatus.'
FROM metric_definitions WHERE key = 'duzeltilmis_kalsiyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'eGFR (Geschatte Glomerulaire Filtratiesnelheid)', 'Een berekende waarde die aangeeft hoe goed de nieren het bloed filteren. Geeft informatie over de nierfunctie.'
FROM metric_definitions WHERE key = 'egfr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Fosfor', 'Een mineraal dat voorkomt in botten en tanden. Speelt ook een rol bij de energieproductie.'
FROM metric_definitions WHERE key = 'fosfor'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Globuline', 'Een groep eiwitten die betrokken zijn bij de afweerfunctie en het transport van stoffen in het lichaam.'
FROM metric_definitions WHERE key = 'globulin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Glucose', 'Toont het suikergehalte in het bloed. Het is de belangrijkste energiebron voor het lichaam.'
FROM metric_definitions WHERE key = 'glukoz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Calcium', 'Een mineraal dat essentieel is voor de gezondheid van botten en tanden. Speelt ook een rol bij spier- en zenuwfunctie.'
FROM metric_definitions WHERE key = 'kalsiyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Chloride', 'Een elektrolyt die helpt bij het reguleren van de vochtbalans en het zuur-base-evenwicht in het lichaam.'
FROM metric_definitions WHERE key = 'klorur'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Creatinekinase (CK)', 'Een enzym dat voorkomt in spier-, hart- en hersenweefsel. Geeft informatie over de spiergezondheid.'
FROM metric_definitions WHERE key = 'kreatin_kinaz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Creatinine', 'Een afvalstof van de normale spieractiviteit. Toont hoe goed de nieren functioneren.'
FROM metric_definitions WHERE key = 'kreatinin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Creatinineklaring', 'Toont hoe snel de nieren creatinine uit het bloed verwijderen. Geeft informatie over de nierfunctie.'
FROM metric_definitions WHERE key = 'kreatinin_klerens'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Lipase', 'Een enzym dat door de alvleesklier wordt geproduceerd en helpt bij de vetvertering. Geeft informatie over de alvleeskliergezondheid.'
FROM metric_definitions WHERE key = 'lipaz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Magnesium', 'Een mineraal dat essentieel is voor spier-, zenuw- en botgezondheid. Speelt een rol bij vele biochemische processen.'
FROM metric_definitions WHERE key = 'magnezyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'OGTT 75g Nuchter (0 min)', 'De nuchtere bloedsuikerwaarde voor een glucosetolerantietest. Helpt te begrijpen hoe het lichaam suiker verwerkt.'
FROM metric_definitions WHERE key = 'ogtt_0dk'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'OGTT 75g 60 min', 'De bloedsuikerwaarde een uur na een glucosetolerantietest. Toont hoe snel het lichaam suiker verwerkt.'
FROM metric_definitions WHERE key = 'ogtt_60dk'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'OGTT 75g 120 min', 'De bloedsuikerwaarde twee uur na een glucosetolerantietest. Toont hoe lang het lichaam nodig heeft om suiker te verwerken.'
FROM metric_definitions WHERE key = 'ogtt_120dk'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Kalium', 'Een mineraal dat nodig is voor een goede spier- en zenuwfunctie.'
FROM metric_definitions WHERE key = 'potasyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Natrium', 'Een mineraal dat de vochtbalans in het lichaam reguleert. Speelt ook een rol bij zenuw- en spierfunctie.'
FROM metric_definitions WHERE key = 'sodyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Totaal Eiwit', 'Toont de totale hoeveelheid eiwit in het bloed. Geeft informatie over de algehele voeding en orgaangezondheid.'
FROM metric_definitions WHERE key = 'total_protein'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Bloedureumstikstof (BUN)', 'Een afvalstof van de eiwitafbraak. Geeft informatie over de nierfunctie.'
FROM metric_definitions WHERE key = 'ure'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Ureum', 'Een afvalstof die door eiwitafbraak in de lever wordt gevormd. Toont hoe goed de nieren functioneren.'
FROM metric_definitions WHERE key = 'urea'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urinezuur', 'Een afvalstof die ontstaat bij de afbraak van purines in het lichaam. Wordt door de nieren uitgescheiden.'
FROM metric_definitions WHERE key = 'urik_asit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- IJZERSTATUS (5)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'IJzer', 'Toont het ijzergehalte in het bloed. Het lichaam heeft ijzer nodig voor zuurstoftransport en energieproductie.'
FROM metric_definitions WHERE key = 'demir'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Ferritine', 'Een eiwit dat ijzer opslaat in het lichaam. Geeft informatie over de ijzervoorraad.'
FROM metric_definitions WHERE key = 'ferritin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'TIJBC (Totale IJzerbindingscapaciteit)', 'Toont hoeveel ijzer de bloedeiwitten kunnen transporteren. Geeft informatie over de ijzerbalans.'
FROM metric_definitions WHERE key = 'tdbk'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Transferrineverzadiging', 'Toont welk percentage van het ijzertransporterende transferrine-eiwit beladen is met ijzer.'
FROM metric_definitions WHERE key = 'transferrin_sat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'UIBC (Onverzadigde IJzerbindingscapaciteit)', 'Toont hoeveel extra ijzer de bloedeiwitten nog kunnen binden. Geeft informatie over de ijzerbalans.'
FROM metric_definitions WHERE key = 'uibc'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- HORMONEN & SPECIALE TESTEN (3)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'HbA1c (Geglyceerd Hemoglobine)', 'Toont het gemiddelde bloedsuikergehalte over de afgelopen twee tot drie maanden. Geeft informatie over de langetermijn suikerregulatie.'
FROM metric_definitions WHERE key = 'hba1c'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Parathyreoied Hormoon (PTH)', 'Een hormoon dat door de bijschildklieren wordt geproduceerd. Helpt bij het reguleren van de calcium- en fosforbalans.'
FROM metric_definitions WHERE key = 'parathormon'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- ONTSTEKINGSMARKERS (3)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'CRP (C-Reactief Proteïne)', 'Een eiwit dat door de lever wordt geproduceerd. Toont of er ontsteking aanwezig is in het lichaam.'
FROM metric_definitions WHERE key = 'crp'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Procalcitonine', 'Een eiwit dat in het lichaam wordt geproduceerd. Geeft informatie over de aanwezigheid van bacteriële infectie.'
FROM metric_definitions WHERE key = 'prokalsitonin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'BSE (Bezinkingssnelheid van Erytrocyten)', 'Meet hoe snel rode bloedcellen bezinken. Geeft informatie over de aanwezigheid van ontsteking in het lichaam.'
FROM metric_definitions WHERE key = 'sedimantasyon'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- HEMOGRAM (36)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Basofielen Aantal', 'Een type witte bloedcel dat betrokken is bij het immuunsysteem. Speelt een rol bij allergische reacties en afweerreacties.'
FROM metric_definitions WHERE key = 'bazofil_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Basofielen %', 'Toont het percentage basofielen onder de witte bloedcellen. Geeft informatie over de balans van het immuunsysteem.'
FROM metric_definitions WHERE key = 'bazofil_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Eosinofielen Aantal', 'Een type witte bloedcel dat betrokken is bij het immuunsysteem. Speelt een rol bij allergische reacties en verdediging tegen parasieten.'
FROM metric_definitions WHERE key = 'eozinofil_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Eosinofielen %', 'Toont het percentage eosinofielen onder de witte bloedcellen. Geeft informatie over de afweerreactie.'
FROM metric_definitions WHERE key = 'eozinofil_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Erytroblasten Aantal', 'Jonge cellen die in het beenmerg worden geproduceerd en uitrijpen tot rode bloedcellen.'
FROM metric_definitions WHERE key = 'eritroblast_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Erytroblasten %', 'Toont het percentage onrijpe rode bloedcellen in het bloed. Geeft informatie over de beenmergfunctie.'
FROM metric_definitions WHERE key = 'eritroblast_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Rode Bloedcellen (RBC)', 'Rode bloedcellen die zuurstof naar alle weefsels in het lichaam transporteren.'
FROM metric_definitions WHERE key = 'eritrosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Hematocriet', 'Toont de verhouding tussen rode bloedcellen en het totale bloedvolume.'
FROM metric_definitions WHERE key = 'hematokrit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Hemoglobine', 'Een eiwit in rode bloedcellen dat zuurstof van de longen naar het lichaam transporteert.'
FROM metric_definitions WHERE key = 'hemoglobin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'HFR (Hoge Fluorescentie Reticulocytenratio)', 'Toont de verhouding van de jongste reticulocyten die pas uit het beenmerg zijn vrijgekomen. Geeft informatie over de bloedcelproductiesnelheid.'
FROM metric_definitions WHERE key = 'hfr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Onrijpe Granulocyten Aantal', 'Het aantal jonge witte bloedcellen die nog niet volledig zijn uitgerijpt in het beenmerg. Geeft informatie over de status van het immuunsysteem.'
FROM metric_definitions WHERE key = 'ig_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Onrijpe Granulocyten %', 'De verhouding van onrijpe witte bloedcellen tot het totale aantal witte bloedcellen.'
FROM metric_definitions WHERE key = 'ig_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'IRF (Onrijpe Reticulocytenfractie)', 'Toont de verhouding van jonge rode bloedcellen die pas uit het beenmerg zijn vrijgekomen. Geeft informatie over de productiecapaciteit van het beenmerg.'
FROM metric_definitions WHERE key = 'irf'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Lymfocyten Aantal', 'Een van de belangrijkste cellen van het immuunsysteem. Beschermt het lichaam tegen infecties.'
FROM metric_definitions WHERE key = 'lenfosit_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Lymfocyten %', 'Toont het percentage lymfocyten onder de witte bloedcellen. Geeft informatie over de balans van het immuunsysteem.'
FROM metric_definitions WHERE key = 'lenfosit_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'LFR (Lage Fluorescentie Reticulocytenratio)', 'Toont de verhouding van rijpe reticulocyten. Geeft informatie over het rijpingsproces van rode bloedcellen.'
FROM metric_definitions WHERE key = 'lfr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Witte Bloedcellen (WBC)', 'Witte bloedcellen die het lichaam verdedigen tegen infecties. Toont de algehele status van het immuunsysteem.'
FROM metric_definitions WHERE key = 'lokosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'MCH (Gemiddeld Cellulair Hemoglobine)', 'Toont de gemiddelde hoeveelheid hemoglobine in een enkele rode bloedcel. Geeft informatie over de zuurstoftransportcapaciteit.'
FROM metric_definitions WHERE key = 'mch'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'MCHC (Gemiddelde Cellulaire Hemoglobineconcentratie)', 'Toont de concentratie hemoglobine in rode bloedcellen. Geeft informatie over de zuurstoftransportcapaciteit.'
FROM metric_definitions WHERE key = 'mchc'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'MCV (Gemiddeld Cellulair Volume)', 'Toont de gemiddelde grootte van de rode bloedcellen. Geeft informatie over de bloedcelproductie.'
FROM metric_definitions WHERE key = 'mcv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'MFR (Medium Fluorescentie Reticulocytenratio)', 'Toont de verhouding van reticulocyten in een tussenliggend rijpingsstadium. Geeft informatie over het rijpingsproces van rode bloedcellen.'
FROM metric_definitions WHERE key = 'mfr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Monocyten Aantal', 'Grote witte bloedcellen die deel uitmaken van het immuunsysteem. Ze beschermen het lichaam tegen schadelijke micro-organismen.'
FROM metric_definitions WHERE key = 'monosit_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Monocyten %', 'Toont het percentage monocyten onder de witte bloedcellen. Geeft informatie over de balans van het immuunsysteem.'
FROM metric_definitions WHERE key = 'monosit_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'MPV (Gemiddeld Trombocytenvolume)', 'Toont de gemiddelde grootte van de bloedplaatjes. Geeft informatie over de bloedplaatjesproductie in het beenmerg.'
FROM metric_definitions WHERE key = 'mpv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'NLR (Neutrofielen-Lymfocytenratio)', 'De verhouding van neutrofielen tot lymfocyten. Geeft informatie over de algehele afweerbalans in het lichaam.'
FROM metric_definitions WHERE key = 'nlr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Neutrofielen Aantal', 'De meest voorkomende witte bloedcel in het immuunsysteem. Speelt een belangrijke rol bij de verdediging tegen bacterien.'
FROM metric_definitions WHERE key = 'notrofil_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Neutrofielen %', 'Toont het percentage neutrofielen onder de witte bloedcellen. Geeft informatie over de balans van het immuunsysteem.'
FROM metric_definitions WHERE key = 'notrofil_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'PCT (Trombocytcriet)', 'Toont de verhouding van bloedplaatjes tot het totale bloedvolume. Geeft informatie over het stollingssysteem.'
FROM metric_definitions WHERE key = 'pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'PDW (Trombocytendistributiebreedte)', 'Toont de groottevariatie onder de bloedplaatjes. Geeft informatie over de bloedplaatjesproductie in het beenmerg.'
FROM metric_definitions WHERE key = 'pdw'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'P-LCR (Trombocyten Grote Celratio)', 'Toont de verhouding van grote bloedplaatjes tot het totale aantal bloedplaatjes. Geeft informatie over de bloedplaatjesproductie.'
FROM metric_definitions WHERE key = 'plcr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'RDW (Rode Celdistributiebreedte)', 'Toont de groottevariatie onder de rode bloedcellen. Geeft informatie over de bloedcelproductie.'
FROM metric_definitions WHERE key = 'rdw'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'RDW-CV', 'Toont de grootteverdeling van rode bloedcellen als percentage. Geeft informatie over de regelmaat van de bloedcelproductie.'
FROM metric_definitions WHERE key = 'rdw_cv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'RDW-SD', 'Toont de grootteverdeling van rode bloedcellen als standaardafwijking. Geeft informatie over de diversiteit van bloedcellen.'
FROM metric_definitions WHERE key = 'rdw_sd'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Reticulocyten Aantal', 'Het aantal jonge rode bloedcellen die pas uit het beenmerg zijn vrijgekomen. Geeft informatie over de productiesnelheid van het beenmerg.'
FROM metric_definitions WHERE key = 'reticulocyte_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Reticulocyten %', 'De verhouding van jonge rode bloedcellen tot het totale aantal rode bloedcellen. Geeft informatie over de beenmergfunctie.'
FROM metric_definitions WHERE key = 'reticulocyte_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Bloedplaatjes', 'Bloedcellen die helpen bij de bloedstolling. Ze helpen bloedingen te stoppen na verwondingen.'
FROM metric_definitions WHERE key = 'trombosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- HORMONEN (2)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Beta-hCG', 'Een hormoon dat toeneemt tijdens de zwangerschap. Wordt gemeten voor zwangerschapsdetectie en -monitoring.'
FROM metric_definitions WHERE key = 'beta_hcg'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Insuline', 'Een hormoon dat door de alvleesklier wordt afgescheiden. Zorgt ervoor dat bloedsuiker naar cellen wordt getransporteerd en als energie wordt gebruikt.'
FROM metric_definitions WHERE key = 'insulin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- URINEONDERZOEK (29)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', '24-uurs Urine Creatinine', 'Toont de hoeveelheid creatinine die de nieren in 24 uur filteren. Geeft informatie over de nierfunctie.'
FROM metric_definitions WHERE key = 'idrar_24h_kreatinin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', '24-uurs Urine Microalbumine', 'Meet de kleine hoeveelheid albumine-eiwit die in 24 uur in de urine wordt uitgescheiden. Geeft informatie over de niergezondheid.'
FROM metric_definitions WHERE key = 'idrar_24h_mikroalbumin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', '24-uurs Urine Eiwit', 'Toont de totale hoeveelheid eiwit die in 24 uur in de urine wordt uitgescheiden. Geeft informatie over de nierfilterfunctie.'
FROM metric_definitions WHERE key = 'idrar_24h_protein'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urine Albumine', 'Toont de hoeveelheid albumine-eiwit in de urine. Geeft informatie over de nierfilterfunctie.'
FROM metric_definitions WHERE key = 'idrar_albumin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urine Albumine-Creatinine Ratio', 'Toont de verhouding van albumine tot creatinine in de urine. Wordt gebruikt om de nierfunctie te evalueren.'
FROM metric_definitions WHERE key = 'idrar_albumin_kreatinin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urine Amorf Fosfaat', 'Fosfaatkristallen die in de urine worden gevonden. Geeft informatie over de urinesamenstelling en mineralenbalans.'
FROM metric_definitions WHERE key = 'idrar_amorf_fosfat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urine Ketonen', 'Toont de hoeveelheid stoffen in de urine die worden geproduceerd wanneer het lichaam vet als energiebron gebruikt.'
FROM metric_definitions WHERE key = 'idrar_asetoasetat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urine Bacterien', 'Toont of er bacterien aanwezig zijn in de urine. Geeft informatie over de gezondheid van de urinewegen.'
FROM metric_definitions WHERE key = 'idrar_bakteri'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urine Bilirubine', 'Toont de hoeveelheid bilirubine in de urine, gevormd bij de afbraak van rode bloedcellen. Geeft informatie over de levergezondheid.'
FROM metric_definitions WHERE key = 'idrar_bilirubin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urine Calciumoxalaat Dihydraat', 'Een type kristal dat in de urine wordt gevonden. Geeft informatie over de mineralensamenstelling van de urine.'
FROM metric_definitions WHERE key = 'idrar_ca_oksalat_dihidrat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urine Calciumoxalaat Monohydraat', 'Een type kristal dat in de urine wordt gevonden. Geeft informatie over de mineralensamenstelling en het metabolisme van de urine.'
FROM metric_definitions WHERE key = 'idrar_ca_oksalat_monohidrat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urine Soortelijk Gewicht', 'Toont de concentratie van de urine. Geeft informatie over hoe goed de nieren de urine kunnen concentreren.'
FROM metric_definitions WHERE key = 'idrar_dansite'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urine Epitheelcellen', 'Toont de hoeveelheid cellen die van de bekleding van de urinewegen zijn losgelaten. Geeft informatie over de gezondheid van de urinewegen.'
FROM metric_definitions WHERE key = 'idrar_epitel'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urine Rode Bloedcellen', 'Toont het aantal rode bloedcellen in de urine. Geeft informatie over de nier- en urinewegengezondheid.'
FROM metric_definitions WHERE key = 'idrar_eritrosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urine Glucose', 'Toont de hoeveelheid suiker in de urine. Geeft informatie over de nierfunctie en suikerregulatie.'
FROM metric_definitions WHERE key = 'idrar_glukoz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urine Granulaire Cilinder', 'Granulaire cilindrische structuren die in de niertubuli worden gevormd. Geeft informatie over de nierfunctie.'
FROM metric_definitions WHERE key = 'idrar_granuler_silendir'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urine Hyaliene Cilinder', 'Doorzichtige cilindrische structuren die in de niertubuli worden gevormd. Kleine hoeveelheden worden als normaal beschouwd.'
FROM metric_definitions WHERE key = 'idrar_hyalen_silendir'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urine Bloed', 'Toont of er bloed aanwezig is in de urine. Geeft informatie over de nier- en urinewegengezondheid.'
FROM metric_definitions WHERE key = 'idrar_kan'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urine Creatinine', 'Toont de hoeveelheid creatinine in de urine. Geeft informatie over hoe goed de nieren afvalstoffen filteren.'
FROM metric_definitions WHERE key = 'idrar_kreatinin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urine Witte Bloedcellen (Microscopie)', 'Toont het microscopische aantal witte bloedcellen in de urine. Geeft informatie over de gezondheid van de urinewegen.'
FROM metric_definitions WHERE key = 'idrar_lokosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urine Leukocytenesterase', 'Detecteert een enzym dat door witte bloedcellen in de urine wordt geproduceerd. Geeft informatie over de gezondheid van de urinewegen.'
FROM metric_definitions WHERE key = 'idrar_lokosit_esteraz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urine Gistcellen', 'Toont of er gist aanwezig is in de urine. Geeft informatie over de gezondheid van de urinewegen.'
FROM metric_definitions WHERE key = 'idrar_maya'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urine Niet-Plaveisel Epitheelcellen', 'Toont de hoeveelheid cellen die van de binnenste lagen van de urinewegen zijn losgelaten. Geeft informatie over de nier- en urinewegengezondheid.'
FROM metric_definitions WHERE key = 'idrar_non_skuamoz_epitel'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urine pH', 'Toont de zuurgraad of alkaliteit van de urine. Geeft informatie over de nierfunctie en het zuur-base-evenwicht.'
FROM metric_definitions WHERE key = 'idrar_ph'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urine Eiwit', 'Toont de hoeveelheid eiwit in de urine. Geeft informatie over de nierfilterfunctie.'
FROM metric_definitions WHERE key = 'idrar_protein'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urine Urinezuurkristallen', 'Toont urinezuurkristallen die in de urine worden gevonden. Geeft informatie over de mineralensamenstelling van de urine.'
FROM metric_definitions WHERE key = 'idrar_urik_asit_kristal'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urine Urobilinogeen', 'Toont de hoeveelheid van een stof die wordt gevormd wanneer bilirubine in de darmen wordt omgezet. Geeft informatie over de levergezondheid.'
FROM metric_definitions WHERE key = 'idrar_urobilinojen'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Urinevolume', 'Toont de hoeveelheid urine die over een bepaalde periode is verzameld. Geeft informatie over de nierfunctie en vochtbalans.'
FROM metric_definitions WHERE key = 'idrar_volum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- IMMUNOLOGIE & SEROLOGIE (12)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Anti-CMV IgG', 'Een antilichaam dat aantoont of u eerder bent blootgesteld aan het cytomegalovirus (CMV).'
FROM metric_definitions WHERE key = 'anti_cmv_igg'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Anti-CMV IgM', 'Een antilichaam dat aantoont of u recentelijk bent blootgesteld aan het cytomegalovirus (CMV).'
FROM metric_definitions WHERE key = 'anti_cmv_igm'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Anti-HCV', 'Detecteert antilichamen die het lichaam aanmaakt tegen het hepatitis C-virus.'
FROM metric_definitions WHERE key = 'anti_hcv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Anti-HIV', 'Detecteert antilichamen die het lichaam aanmaakt tegen het hiv-virus.'
FROM metric_definitions WHERE key = 'anti_hiv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Anti-Rubella IgG', 'Een antilichaam dat aantoont of u immuniteit heeft tegen rubella (rode hond).'
FROM metric_definitions WHERE key = 'anti_rubella_igg'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Anti-Rubella IgM', 'Een antilichaam dat aantoont of u recentelijk bent blootgesteld aan rubella (rode hond).'
FROM metric_definitions WHERE key = 'anti_rubella_igm'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Anti-Toxoplasma IgG', 'Een antilichaam dat aantoont of u eerder bent blootgesteld aan de toxoplasmaparasiet.'
FROM metric_definitions WHERE key = 'anti_toxo_igg'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Anti-Toxoplasma IgM', 'Een antilichaam dat aantoont of u recentelijk bent blootgesteld aan de toxoplasmaparasiet.'
FROM metric_definitions WHERE key = 'anti_toxo_igm'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'HBsAg (Hepatitis B Oppervlakte-antigeen)', 'Detecteert het oppervlakte-antigeen van het hepatitis B-virus. Geeft informatie over de hepatitis B-dragerstatus.'
FROM metric_definitions WHERE key = 'hbsag'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Reumafactor (RF)', 'Een antilichaam dat door het immuunsysteem wordt geproduceerd. Geeft informatie over de gewrichtsgezondheid.'
FROM metric_definitions WHERE key = 'romatoid_faktor'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Totaal IgE', 'Een type antilichaam dat door het immuunsysteem wordt geproduceerd en een rol speelt bij allergische reacties.'
FROM metric_definitions WHERE key = 'total_ige'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'VDRL-RPR', 'Een screeningstest die antilichamen detecteert die het lichaam aanmaakt tegen syfilisinfectie.'
FROM metric_definitions WHERE key = 'vdrl_rpr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- BLOEDGAS (12)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Aniongat', 'Toont het verschil tussen positief en negatief geladen ionen in het bloed. Geeft informatie over het zuur-base-evenwicht.'
FROM metric_definitions WHERE key = 'anion_gap'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Base Excess (Bloed)', 'Toont het overschot of tekort aan base in het bloed. Geeft informatie over het zuur-base-evenwicht van het lichaam.'
FROM metric_definitions WHERE key = 'be_b'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Base Excess (ECF)', 'Toont het base-overschot in de extracellulaire vloeistof. Geeft informatie over het zuur-base-evenwicht van het lichaam.'
FROM metric_definitions WHERE key = 'be_ecf'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Bicarbonaat (HCO3)', 'Toont het bicarbonaatgehalte in het bloed. Geeft informatie over de nierfunctie en het zuur-base-evenwicht.'
FROM metric_definitions WHERE key = 'hco3'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Geioniseerd Calcium (Ca++)', 'Toont de hoeveelheid actief, vrij zwevend calcium in het bloed. Belangrijk voor spier- en zenuwfunctie.'
FROM metric_definitions WHERE key = 'ionized_calcium'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Lactaat', 'Een stof die wordt geproduceerd wanneer cellen energie opwekken zonder zuurstof. Geeft informatie over het zuurstofgebruik van de weefsels.'
FROM metric_definitions WHERE key = 'lactate'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'PCO2 (Kooldioxide Partieeldruk)', 'Toont de kooldioxidedruk in het bloed. Geeft informatie over hoe goed de longen functioneren.'
FROM metric_definitions WHERE key = 'pco2'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'PO2 (Zuurstof Partieeldruk)', 'Toont de zuurstofdruk in het bloed. Geeft informatie over de longfunctie en zuurstofopname.'
FROM metric_definitions WHERE key = 'po2'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'SBC (Standaard Bicarbonaat)', 'Toont het bicarbonaatgehalte in het bloed onder standaardomstandigheden. Geeft informatie over het zuur-base-evenwicht.'
FROM metric_definitions WHERE key = 'sbc'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Zuurstofsaturatie (SpO2)', 'Toont het percentage hemoglobine dat zuurstof draagt. Geeft informatie over de zuurstofvoorziening van het lichaam.'
FROM metric_definitions WHERE key = 'spo2'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Totaal CO2 (TCO2)', 'Toont de totale hoeveelheid kooldioxide in het bloed. Geeft informatie over het zuur-base-evenwicht.'
FROM metric_definitions WHERE key = 'tco2'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Totaal Hemoglobine (tHb)', 'De totale hemoglobinehoeveelheid gemeten bij bloedgasanalyse. Toont de zuurstoftransportcapaciteit van het bloed.'
FROM metric_definitions WHERE key = 'thb'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- LEVERFUNCTIE (8)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'ALP (Alkalische Fosfatase)', 'Een enzym dat voorkomt in de lever en botten. Geeft informatie over de lever- en botgezondheid.'
FROM metric_definitions WHERE key = 'alp'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'ALT (Alanineaminotransferase)', 'Een enzym dat in de lever voorkomt. Geeft informatie over de levergezondheid.'
FROM metric_definitions WHERE key = 'alt'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'AST (Aspartaataminotransferase)', 'Een enzym dat in de lever, het hart en de spieren voorkomt. Geeft vooral informatie over de levergezondheid.'
FROM metric_definitions WHERE key = 'ast'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Direct Bilirubine', 'Toont de hoeveelheid bilirubine die door de lever is verwerkt. Geeft informatie over de lever- en galweggezondheid.'
FROM metric_definitions WHERE key = 'direkt_bilirubin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'GGT (Gamma-Glutamyltransferase)', 'Een enzym dat in de lever en galwegen voorkomt. Geeft informatie over de levergezondheid.'
FROM metric_definitions WHERE key = 'ggt'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Indirect Bilirubine', 'Toont de hoeveelheid bilirubine uit de afbraak van rode bloedcellen die nog niet door de lever is verwerkt.'
FROM metric_definitions WHERE key = 'indirekt_bilirubin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'LDH (Lactaatdehydrogenase)', 'Een enzym dat in veel weefsels in het lichaam voorkomt. Geeft informatie over de celgezondheid en weefselintegriteit.'
FROM metric_definitions WHERE key = 'ldh'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Totaal Bilirubine', 'Een geelgekleurde stof die wordt gevormd bij de afbraak van rode bloedcellen. Geeft informatie over de levergezondheid.'
FROM metric_definitions WHERE key = 'total_bilirubin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- HARTMARKERS (1)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Troponine I', 'Een eiwit dat in de hartspier voorkomt. Geeft informatie over de gezondheid van de hartspier.'
FROM metric_definitions WHERE key = 'troponin_i'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- STOLLING (6)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'aPTT (Geactiveerde Partiele Tromboplastinetijd)', 'Een test die de bloedstollingstijd meet. Geeft informatie over de werking van het stollingssysteem.'
FROM metric_definitions WHERE key = 'aptt'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'D-Dimeer', 'Een eiwitfragment dat wordt geproduceerd wanneer een bloedstolsel oplost. Geeft informatie over het stollingssysteem.'
FROM metric_definitions WHERE key = 'd_dimer'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Fibrinogeen', 'Een eiwit dat door de lever wordt geproduceerd en een rol speelt bij de bloedstolling.'
FROM metric_definitions WHERE key = 'fibrinojen'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'INR (Internationaal Genormaliseerde Ratio)', 'Toont de bloedstollingssnelheid op een gestandaardiseerde schaal. Geeft informatie over het stollingssysteem.'
FROM metric_definitions WHERE key = 'inr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Protrombinetijd (PT)', 'Meet de tijd die het bloed nodig heeft om te stollen. Geeft informatie over de stollingsfactoren.'
FROM metric_definitions WHERE key = 'pt'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Protrombinetijd (% Activiteit)', 'Toont het activiteitspercentage van de stollingsfactoren. Geeft informatie over het functieniveau van het stollingssysteem.'
FROM metric_definitions WHERE key = 'pt_activity'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- LIPIDENPROFIEL (6)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'HDL-Cholesterol', 'Een type vet dat bekendstaat als goed cholesterol. Helpt bij de bescherming van de hart- en vaatgezondheid.'
FROM metric_definitions WHERE key = 'hdl'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'LDL-Cholesterol', 'Een type vet dat bekendstaat als slecht cholesterol. Geeft informatie over de hart- en vaatgezondheid.'
FROM metric_definitions WHERE key = 'ldl'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Non-HDL-Cholesterol', 'Toont het totaal van alle cholesteroltypes behalve HDL. Geeft informatie over de hart- en vaatgezondheid.'
FROM metric_definitions WHERE key = 'non_hdl'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Totaal Cholesterol', 'Een vetachtige stof in het bloed. Het lichaam gebruikt het voor de opbouw van cellen en de productie van hormonen.'
FROM metric_definitions WHERE key = 'total_kolesterol'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Triglyceriden', 'Een type vet in het bloed. Het lichaam heeft triglyceriden nodig om energie op te slaan en te gebruiken.'
FROM metric_definitions WHERE key = 'trigliserid'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'VLDL-Cholesterol', 'Een type lipoproteïne dat door de lever wordt geproduceerd. Verantwoordelijk voor het transport van triglyceriden door het lichaam.'
FROM metric_definitions WHERE key = 'vldl'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- SCHILDKLIER (3)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Vrij T3', 'Een actief hormoon dat door de schildklier wordt geproduceerd. Geeft informatie over de stofwisselingssnelheid en het energieniveau.'
FROM metric_definitions WHERE key = 'serbest_t3'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Vrij T4', 'Een hormoon dat door de schildklier wordt geproduceerd. Geeft informatie over de schildklierfunctie en stofwisseling.'
FROM metric_definitions WHERE key = 'serbest_t4'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'TSH (Schildklierstimulerend Hormoon)', 'Een hormoon dat door de hypofyse in de hersenen wordt geproduceerd. Toont hoe goed de schildklier functioneert.'
FROM metric_definitions WHERE key = 'tsh'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- TUMORMARKERS (4)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'CA-125', 'Een eiwitmarker die door bepaalde cellen in het lichaam wordt geproduceerd. Wordt gebruikt bij de monitoring van de gezondheid van het voortplantingssysteem.'
FROM metric_definitions WHERE key = 'ca125'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'CA 15-3', 'Een eiwitmarker die door bepaalde cellen in het lichaam wordt geproduceerd. Wordt gebruikt bij de monitoring van de borstgezondheid.'
FROM metric_definitions WHERE key = 'ca153'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'CA 19-9', 'Een eiwitmarker die door bepaalde cellen in het lichaam wordt geproduceerd. Wordt gebruikt bij de monitoring van de gezondheid van het spijsverteringssysteem.'
FROM metric_definitions WHERE key = 'ca199'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'CEA (Carcino-Embryonaal Antigeen)', 'Een eiwitmarker die in het lichaam wordt geproduceerd. Het is een laboratoriumwaarde die wordt gebruikt bij de algehele gezondheidsmonitoring.'
FROM metric_definitions WHERE key = 'cea'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- VITAMINEN (3)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Vitamine B12', 'Een vitamine dat essentieel is voor de werking van het zenuwstelsel en de aanmaak van bloedcellen. Wordt uit voeding verkregen.'
FROM metric_definitions WHERE key = 'b12'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Foliumzuur', 'Een B-vitamine dat essentieel is voor celgroei en de aanmaak van bloedcellen. Bijzonder belangrijk tijdens de zwangerschap.'
FROM metric_definitions WHERE key = 'folik_asit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'nl', 'Vitamine D', 'Een vitamine dat essentieel is voor de gezondheid van botten en tanden. Helpt het lichaam calcium op te nemen.'
FROM metric_definitions WHERE key = 'vitamin_d'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;
