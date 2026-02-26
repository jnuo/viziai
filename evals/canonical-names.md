# Canonical Metric Names

The ONE correct Turkish name for each metric. All `expected.json` files and the extraction prompt must use these names exactly.

## Hemogram (CBC)

| Canonical Name | Rejected Variants |
|---|---|
| Eritrosit | |
| Hemoglobin | |
| Hematokrit | |
| MCV | VCM, MCV (VGM) |
| MCH | HCM, MCH (HCM) |
| MCHC | Konsantrasyon HGB Küresel |
| RDW | ADE, RDW (ADE), RDW-CV |
| RDW-SD | _(distinct metric, keep)_ |
| Lökosit | |
| Nötrofil% | NEU% |
| Nötrofil# | NEU#, Nötrofil |
| Lenfosit% | LYM% |
| Lenfosit# | LYM#, Lenfosit |
| Monosit% | MON% |
| Monosit# | MON#, Monosit |
| Eozinofil% | EOS% |
| Eozinofil# | EOS#, Eozinofil |
| Bazofil% | BASO% |
| Bazofil# | BASO#, Bazofil |
| Eritroblast% | |
| Eritroblast# | |
| Trombosit | |
| MPV | Ortalama Trombosit Hacmi, Volum Platelet |
| PDW | |
| PCT | Plaquetòcrit |
| Sedimentasyon | ESR, ESR (Sedimantasyon), Santrifüj Hızı (ESR), Eritrosit Sedimentasyon Hızı |

## Serum Biochemistry

| Canonical Name | Rejected Variants |
|---|---|
| Glukoz | Srm-Glukoz |
| Üre | |
| BUN | |
| Kreatinin | |
| eGFR | Glomerular Filtrasyon Hızı, Glomerüler Filtrasyon Hızı, Filtre GFR (CKD-EPI), Filtrasyon Glomerüler CKD |
| Ürik Asit | Ürik asit, Ürat |
| Total Protein | |
| Albümin | Albumin, Albümün |
| Globulin | |
| AST | |
| ALT | |
| GGT | Ggt (Gamma Glutamil Transferaz) |
| Alkalen Fosfataz | ALP |
| LDH | Ldh (Laktik Dehidrogenaz) |
| Total Bilirubin | Bilirubin (serum) |
| Direkt Bilirubin | Bilirubin (Direkt) |

## Electrolytes

| Canonical Name | Rejected Variants |
|---|---|
| Sodyum | |
| Potasyum | |
| Kalsiyum | Kalsiyum (Ca) |
| Magnezyum | |
| Klorür | Klor |

## Lipid Panel

| Canonical Name | Rejected Variants |
|---|---|
| Kolesterol | |
| HDL Kolesterol | Kolesterol HDL |
| LDL Kolesterol | Kolesterol LDL, LDL Kolesterol (Friedewald Hesabı) |
| Non-HDL Kolesterol | |
| Trigliserit | |

## Inflammatory

| Canonical Name | Rejected Variants |
|---|---|
| CRP | C-reaktif Protein, Protein C reaktif, C-Reaktif Protein |
| Sedimentasyon | _(see Hemogram)_ |

## Hormones

| Canonical Name | Rejected Variants |
|---|---|
| TSH | |

## Autoimmune

| Canonical Name | Rejected Variants |
|---|---|
| Romatoid Faktör | |

## Urine Dipstick (İdrar prefix required)

| Canonical Name | Rejected Variants |
|---|---|
| İdrar Dansitesi | İdrar Yoğunluğu |
| İdrar Glukoz | İdrar Glukozu |
| İdrar Asetoasetat | Asetoasetat |
| İdrar Bilirubin | Bilirubin (urine) |
| İdrar Ürobilinojen | Ürobilinojen |
| İdrar pH | |
| İdrar Protein | Protein (urine) |
| İdrar Eritrosit | |
| İdrar Lökosit Esteraz | Esteraza lökosit, İdrar Esteraz Lökosit |
| İdrar Nitrit | |
| İdrar Kreatinin | |
| İdrar Albümin | Albümin (urine), Albümün |
| İdrar Albümin/Kreatinin | Albümin / Kreatinin, Albümün/Kreatinin Oranı |

## Blood Gas (Kan Gazı prefix for shared metrics)

Metrics unique to blood gas (pH, PCO2, PO2, HCO3, etc.) don't need a prefix.
Metrics that also exist in serum MUST use "Kan Gazı" prefix:

| Canonical Name | Notes |
|---|---|
| Kan Gazı Glukoz | |
| Kan Gazı Sodyum | |
| Kan Gazı Potasyum | |
| Kan Gazı Kalsiyum | |
| Kan Gazı Klorür | |
| Kan Gazı Hematokrit | |
| Kan Gazı Magnezyum | |
| pH | No prefix (unique to blood gas) |
| PCO2 | No prefix |
| PO2 | No prefix |
| HCO3 | No prefix |
| Laktat | No prefix |
| BE-ecf | No prefix |
| BE-b | No prefix |
| SBC | No prefix |
| TCO2 | No prefix |
| Gap_K | No prefix |
