-- MT-008: Spanish (ES) translations — display_name + description for all 155 metrics
-- Applied to Neon test branch: metric-translations-test (ep-raspy-bar-agiah0ev)

-- ==================
-- BİYOKİMYA (24)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Albúmina', 'Proteína producida por el hígado que ayuda a mantener el equilibrio de líquidos en el cuerpo.'
FROM metric_definitions WHERE key = 'albumin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Amilasa', 'Enzima producida por el páncreas y las glándulas salivales que ayuda a digerir los alimentos con almidón.'
FROM metric_definitions WHERE key = 'amilaz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Zinc', 'Mineral esencial para el sistema inmunitario, la cicatrización de heridas y el crecimiento.'
FROM metric_definitions WHERE key = 'cinko'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Calcio Corregido', 'Valor de calcio ajustado según el nivel de albúmina. Ofrece una imagen más precisa del estado del calcio.'
FROM metric_definitions WHERE key = 'duzeltilmis_kalsiyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'TFGe (Tasa de Filtración Glomerular Estimada)', 'Valor calculado que muestra la capacidad de los riñones para filtrar la sangre. Informa sobre la función renal.'
FROM metric_definitions WHERE key = 'egfr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Fósforo', 'Mineral presente en los huesos y dientes. También participa en la producción de energía.'
FROM metric_definitions WHERE key = 'fosfor'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Globulina', 'Grupo de proteínas que participan en la función inmunitaria y el transporte de sustancias en el cuerpo.'
FROM metric_definitions WHERE key = 'globulin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Glucosa', 'Muestra el nivel de azúcar en sangre. Es la principal fuente de energía del cuerpo.'
FROM metric_definitions WHERE key = 'glukoz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Calcio', 'Mineral esencial para la salud ósea y dental. También interviene en la función muscular y nerviosa.'
FROM metric_definitions WHERE key = 'kalsiyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Cloruro', 'Electrolito que ayuda a regular el equilibrio de líquidos y el equilibrio ácido-base en el cuerpo.'
FROM metric_definitions WHERE key = 'klorur'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Creatina Quinasa (CK)', 'Enzima presente en el tejido muscular, cardíaco y cerebral. Informa sobre la salud muscular.'
FROM metric_definitions WHERE key = 'kreatin_kinaz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Creatinina', 'Producto de desecho de la actividad muscular normal. Muestra el funcionamiento de los riñones.'
FROM metric_definitions WHERE key = 'kreatinin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Aclaramiento de Creatinina', 'Muestra la rapidez con que los riñones eliminan la creatinina de la sangre. Informa sobre la función renal.'
FROM metric_definitions WHERE key = 'kreatinin_klerens'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Lipasa', 'Enzima producida por el páncreas que ayuda a digerir las grasas. Informa sobre la salud pancreática.'
FROM metric_definitions WHERE key = 'lipaz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Magnesio', 'Mineral esencial para la salud muscular, nerviosa y ósea. Participa en muchos procesos bioquímicos.'
FROM metric_definitions WHERE key = 'magnezyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'PTOG 75g Ayunas (0 min)', 'Valor de glucosa en ayunas antes de la prueba de tolerancia a la glucosa. Ayuda a evaluar el metabolismo del azúcar.'
FROM metric_definitions WHERE key = 'ogtt_0dk'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'PTOG 75g 60 min', 'Valor de glucosa una hora después de la prueba de tolerancia. Muestra la velocidad de procesamiento del azúcar.'
FROM metric_definitions WHERE key = 'ogtt_60dk'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'PTOG 75g 120 min', 'Valor de glucosa dos horas después de la prueba de tolerancia. Muestra cuánto tarda el cuerpo en procesar el azúcar.'
FROM metric_definitions WHERE key = 'ogtt_120dk'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Potasio', 'Mineral necesario para el correcto funcionamiento de los músculos y los nervios.'
FROM metric_definitions WHERE key = 'potasyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Sodio', 'Mineral que regula el equilibrio de líquidos en el cuerpo. También interviene en la función nerviosa y muscular.'
FROM metric_definitions WHERE key = 'sodyum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Proteínas Totales', 'Muestra la cantidad total de proteínas en sangre. Informa sobre el estado nutricional y la salud de los órganos.'
FROM metric_definitions WHERE key = 'total_protein'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Nitrógeno Ureico en Sangre (BUN)', 'Producto de desecho de la descomposición de proteínas. Informa sobre la función renal.'
FROM metric_definitions WHERE key = 'ure'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Urea', 'Producto de desecho formado por la descomposición de proteínas en el hígado. Muestra la capacidad de los riñones para eliminarlo.'
FROM metric_definitions WHERE key = 'urea'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Ácido Úrico', 'Producto de desecho formado por la descomposición de purinas en el cuerpo. Se elimina a través de los riñones.'
FROM metric_definitions WHERE key = 'urik_asit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- DEMİR (5)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Hierro', 'Muestra el nivel de hierro en sangre. El cuerpo necesita hierro para transportar oxígeno y producir energía.'
FROM metric_definitions WHERE key = 'demir'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Ferritina', 'Proteína que almacena hierro en el cuerpo. Informa sobre las reservas de hierro.'
FROM metric_definitions WHERE key = 'ferritin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'CTFH (Capacidad Total de Fijación del Hierro)', 'Muestra cuánto hierro pueden transportar las proteínas de la sangre. Informa sobre el equilibrio del hierro.'
FROM metric_definitions WHERE key = 'tdbk'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Saturación de Transferrina', 'Muestra qué porcentaje de la proteína transferrina está cargada con hierro.'
FROM metric_definitions WHERE key = 'transferrin_sat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'CLIH (Capacidad Latente de Fijación del Hierro)', 'Muestra cuánto hierro adicional pueden unir las proteínas de la sangre. Informa sobre el equilibrio del hierro.'
FROM metric_definitions WHERE key = 'uibc'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- DİĞER (2)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'HbA1c (Hemoglobina Glicosilada)', 'Muestra el nivel promedio de azúcar en sangre en los últimos dos a tres meses. Informa sobre el control glucémico a largo plazo.'
FROM metric_definitions WHERE key = 'hba1c'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Hormona Paratiroidea (PTH)', 'Hormona producida por las glándulas paratiroides. Ayuda a regular el equilibrio de calcio y fósforo.'
FROM metric_definitions WHERE key = 'parathormon'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- ENFLAMASYON (3)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'PCR (Proteína C Reactiva)', 'Proteína producida por el hígado. Indica si existe inflamación en el cuerpo.'
FROM metric_definitions WHERE key = 'crp'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Procalcitonina', 'Proteína producida en el cuerpo. Informa sobre la presencia de infección bacteriana.'
FROM metric_definitions WHERE key = 'prokalsitonin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'VSG (Velocidad de Sedimentación Globular)', 'Mide la rapidez con que los glóbulos rojos sedimentan. Informa sobre la presencia de inflamación en el cuerpo.'
FROM metric_definitions WHERE key = 'sedimantasyon'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- HEMOGRAM (36)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Recuento de Basófilos', 'Tipo de glóbulo blanco del sistema inmunitario. Participa en las respuestas alérgicas y las reacciones inmunitarias.'
FROM metric_definitions WHERE key = 'bazofil_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Basófilos %', 'Muestra el porcentaje de basófilos entre los glóbulos blancos. Informa sobre el equilibrio del sistema inmunitario.'
FROM metric_definitions WHERE key = 'bazofil_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Recuento de Eosinófilos', 'Tipo de glóbulo blanco del sistema inmunitario. Participa en las respuestas alérgicas y la defensa contra parásitos.'
FROM metric_definitions WHERE key = 'eozinofil_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Eosinófilos %', 'Muestra el porcentaje de eosinófilos entre los glóbulos blancos. Informa sobre la respuesta inmunitaria.'
FROM metric_definitions WHERE key = 'eozinofil_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Recuento de Eritroblastos', 'Células jóvenes producidas en la médula ósea que maduran hasta convertirse en glóbulos rojos.'
FROM metric_definitions WHERE key = 'eritroblast_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Eritroblastos %', 'Muestra el porcentaje de glóbulos rojos inmaduros en sangre. Informa sobre la función de la médula ósea.'
FROM metric_definitions WHERE key = 'eritroblast_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Recuento de Glóbulos Rojos (GR)', 'Glóbulos rojos que transportan oxígeno a todos los tejidos del cuerpo.'
FROM metric_definitions WHERE key = 'eritrosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Hematocrito', 'Muestra la proporción de glóbulos rojos respecto al volumen total de sangre.'
FROM metric_definitions WHERE key = 'hematokrit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Hemoglobina', 'Proteína de los glóbulos rojos que transporta el oxígeno desde los pulmones al resto del cuerpo.'
FROM metric_definitions WHERE key = 'hemoglobin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'HFR (Fracción de Reticulocitos de Alta Fluorescencia)', 'Muestra la proporción de los reticulocitos más jóvenes liberados de la médula ósea. Informa sobre la producción de células sanguíneas.'
FROM metric_definitions WHERE key = 'hfr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Recuento de Granulocitos Inmaduros', 'Recuento de glóbulos blancos jóvenes aún no maduros en la médula ósea. Informa sobre el estado del sistema inmunitario.'
FROM metric_definitions WHERE key = 'ig_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Granulocitos Inmaduros %', 'Proporción de glóbulos blancos inmaduros respecto al total de glóbulos blancos.'
FROM metric_definitions WHERE key = 'ig_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'IRF (Fracción de Reticulocitos Inmaduros)', 'Muestra la proporción de glóbulos rojos jóvenes recién liberados de la médula ósea. Informa sobre la capacidad de producción medular.'
FROM metric_definitions WHERE key = 'irf'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Recuento de Linfocitos', 'Una de las células clave del sistema inmunitario. Protege al cuerpo contra las infecciones.'
FROM metric_definitions WHERE key = 'lenfosit_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Linfocitos %', 'Muestra el porcentaje de linfocitos entre los glóbulos blancos. Informa sobre el equilibrio del sistema inmunitario.'
FROM metric_definitions WHERE key = 'lenfosit_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'LFR (Fracción de Reticulocitos de Baja Fluorescencia)', 'Muestra la proporción de reticulocitos maduros. Informa sobre el proceso de maduración de los glóbulos rojos.'
FROM metric_definitions WHERE key = 'lfr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Recuento de Glóbulos Blancos (GB)', 'Glóbulos blancos que defienden al cuerpo contra las infecciones. Muestra el estado general del sistema inmunitario.'
FROM metric_definitions WHERE key = 'lokosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'HCM (Hemoglobina Corpuscular Media)', 'Muestra la cantidad promedio de hemoglobina en un glóbulo rojo. Informa sobre la capacidad de transporte de oxígeno.'
FROM metric_definitions WHERE key = 'mch'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'CCMH (Concentración de Hemoglobina Corpuscular Media)', 'Muestra la concentración de hemoglobina en los glóbulos rojos. Informa sobre la capacidad de transporte de oxígeno.'
FROM metric_definitions WHERE key = 'mchc'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'VCM (Volumen Corpuscular Medio)', 'Muestra el tamaño promedio de los glóbulos rojos. Informa sobre la producción de células sanguíneas.'
FROM metric_definitions WHERE key = 'mcv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'MFR (Fracción de Reticulocitos de Fluorescencia Media)', 'Muestra la proporción de reticulocitos en etapa intermedia de maduración. Informa sobre el proceso de maduración eritrocitaria.'
FROM metric_definitions WHERE key = 'mfr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Recuento de Monocitos', 'Glóbulos blancos grandes del sistema inmunitario. Protegen al cuerpo contra microorganismos nocivos.'
FROM metric_definitions WHERE key = 'monosit_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Monocitos %', 'Muestra el porcentaje de monocitos entre los glóbulos blancos. Informa sobre el equilibrio del sistema inmunitario.'
FROM metric_definitions WHERE key = 'monosit_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'VPM (Volumen Plaquetario Medio)', 'Muestra el tamaño promedio de las plaquetas. Informa sobre la producción plaquetaria en la médula ósea.'
FROM metric_definitions WHERE key = 'mpv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'INL (Índice Neutrófilo-Linfocito)', 'Relación entre neutrófilos y linfocitos. Informa sobre el equilibrio inmunitario general del cuerpo.'
FROM metric_definitions WHERE key = 'nlr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Recuento de Neutrófilos', 'El glóbulo blanco más abundante del sistema inmunitario. Cumple un papel importante en la defensa contra bacterias.'
FROM metric_definitions WHERE key = 'notrofil_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Neutrófilos %', 'Muestra el porcentaje de neutrófilos entre los glóbulos blancos. Informa sobre el equilibrio del sistema inmunitario.'
FROM metric_definitions WHERE key = 'notrofil_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'PCT (Plaquetocrito)', 'Muestra la proporción de plaquetas respecto al volumen total de sangre. Informa sobre el sistema de coagulación.'
FROM metric_definitions WHERE key = 'pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'ADP (Amplitud de Distribución Plaquetaria)', 'Muestra la variación de tamaño entre las plaquetas. Informa sobre la producción plaquetaria en la médula ósea.'
FROM metric_definitions WHERE key = 'pdw'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'P-LCR (Proporción de Plaquetas Grandes)', 'Muestra la proporción de plaquetas grandes respecto al total. Informa sobre la producción plaquetaria.'
FROM metric_definitions WHERE key = 'plcr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'ADE (Amplitud de Distribución Eritrocitaria)', 'Muestra la variación de tamaño entre los glóbulos rojos. Informa sobre la producción de células sanguíneas.'
FROM metric_definitions WHERE key = 'rdw'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'ADE-CV', 'Muestra la distribución del tamaño de los glóbulos rojos como porcentaje. Informa sobre la regularidad de la producción sanguínea.'
FROM metric_definitions WHERE key = 'rdw_cv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'ADE-DE', 'Muestra la distribución del tamaño de los glóbulos rojos como desviación estándar. Informa sobre la diversidad celular sanguínea.'
FROM metric_definitions WHERE key = 'rdw_sd'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Recuento de Reticulocitos', 'Recuento de glóbulos rojos jóvenes recién liberados de la médula ósea. Informa sobre la velocidad de producción medular.'
FROM metric_definitions WHERE key = 'reticulocyte_abs'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Reticulocitos %', 'Proporción de glóbulos rojos jóvenes respecto al total de glóbulos rojos. Informa sobre la función de la médula ósea.'
FROM metric_definitions WHERE key = 'reticulocyte_pct'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Recuento de Plaquetas', 'Células sanguíneas que ayudan a la coagulación. Contribuyen a detener el sangrado tras una lesión.'
FROM metric_definitions WHERE key = 'trombosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- HORMON (2)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Beta-hCG', 'Hormona que aumenta durante el embarazo. Se mide para la detección y seguimiento del embarazo.'
FROM metric_definitions WHERE key = 'beta_hcg'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Insulina', 'Hormona secretada por el páncreas. Permite que el azúcar en sangre sea transportado a las células para producir energía.'
FROM metric_definitions WHERE key = 'insulin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- İDRAR (28)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Creatinina en Orina de 24 Horas', 'Muestra la cantidad de creatinina filtrada por los riñones en 24 horas. Informa sobre la función renal.'
FROM metric_definitions WHERE key = 'idrar_24h_kreatinin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Microalbúmina en Orina de 24 Horas', 'Mide la pequeña cantidad de proteína albúmina excretada en la orina durante 24 horas. Informa sobre la salud renal.'
FROM metric_definitions WHERE key = 'idrar_24h_mikroalbumin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Proteínas en Orina de 24 Horas', 'Muestra la cantidad total de proteínas excretadas en la orina durante 24 horas. Informa sobre la función de filtración renal.'
FROM metric_definitions WHERE key = 'idrar_24h_protein'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Albúmina en Orina', 'Muestra la cantidad de proteína albúmina en la orina. Informa sobre la función de filtración renal.'
FROM metric_definitions WHERE key = 'idrar_albumin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Cociente Albúmina/Creatinina en Orina', 'Muestra la relación entre albúmina y creatinina en orina. Se utiliza para evaluar la función renal.'
FROM metric_definitions WHERE key = 'idrar_albumin_kreatinin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Fosfato Amorfo en Orina', 'Cristales de fosfato presentes en la orina. Informa sobre la composición urinaria y el equilibrio mineral.'
FROM metric_definitions WHERE key = 'idrar_amorf_fosfat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Cetonas en Orina', 'Muestra sustancias producidas cuando el cuerpo utiliza grasa como fuente de energía.'
FROM metric_definitions WHERE key = 'idrar_asetoasetat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Bacterias en Orina', 'Indica si hay bacterias presentes en la orina. Informa sobre la salud del tracto urinario.'
FROM metric_definitions WHERE key = 'idrar_bakteri'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Bilirrubina en Orina', 'Muestra la cantidad de bilirrubina en la orina, formada por la descomposición de glóbulos rojos. Informa sobre la salud hepática.'
FROM metric_definitions WHERE key = 'idrar_bilirubin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Oxalato de Calcio Dihidratado en Orina', 'Tipo de cristal presente en la orina. Informa sobre la composición mineral de la orina.'
FROM metric_definitions WHERE key = 'idrar_ca_oksalat_dihidrat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Oxalato de Calcio Monohidratado en Orina', 'Tipo de cristal presente en la orina. Informa sobre la composición mineral y el metabolismo urinario.'
FROM metric_definitions WHERE key = 'idrar_ca_oksalat_monohidrat'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Densidad Urinaria', 'Muestra la concentración de la orina. Informa sobre la capacidad de los riñones para concentrar la orina.'
FROM metric_definitions WHERE key = 'idrar_dansite'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Células Epiteliales en Orina', 'Muestra las células desprendidas del revestimiento del tracto urinario. Informa sobre la salud del tracto urinario.'
FROM metric_definitions WHERE key = 'idrar_epitel'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Glóbulos Rojos en Orina', 'Muestra el recuento de glóbulos rojos en la orina. Informa sobre la salud renal y del tracto urinario.'
FROM metric_definitions WHERE key = 'idrar_eritrosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Glucosa en Orina', 'Muestra la cantidad de azúcar en la orina. Informa sobre la capacidad de los riñones para reabsorber el azúcar.'
FROM metric_definitions WHERE key = 'idrar_glukoz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Cilindro Granuloso en Orina', 'Estructuras cilíndricas granulosas formadas en los túbulos renales. Informa sobre la función renal.'
FROM metric_definitions WHERE key = 'idrar_granuler_silendir'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Cilindro Hialino en Orina', 'Estructuras cilíndricas transparentes formadas en los túbulos renales. Pequeñas cantidades se consideran normales.'
FROM metric_definitions WHERE key = 'idrar_hyalen_silendir'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Sangre en Orina', 'Indica si hay sangre presente en la orina. Informa sobre la salud renal y del tracto urinario.'
FROM metric_definitions WHERE key = 'idrar_kan'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Creatinina en Orina', 'Muestra la cantidad de creatinina en la orina. Informa sobre la capacidad de filtración de los riñones.'
FROM metric_definitions WHERE key = 'idrar_kreatinin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Glóbulos Blancos en Orina (Microscopía)', 'Muestra el recuento microscópico de glóbulos blancos en la orina. Informa sobre la salud del tracto urinario.'
FROM metric_definitions WHERE key = 'idrar_lokosit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Esterasa Leucocitaria en Orina', 'Detecta una enzima producida por los glóbulos blancos en la orina. Informa sobre la salud del tracto urinario.'
FROM metric_definitions WHERE key = 'idrar_lokosit_esteraz'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Levaduras en Orina', 'Indica si hay levaduras presentes en la orina. Informa sobre la salud del tracto urinario.'
FROM metric_definitions WHERE key = 'idrar_maya'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Células Epiteliales No Escamosas en Orina', 'Muestra las células desprendidas de las capas internas del tracto urinario. Informa sobre la salud renal y urinaria.'
FROM metric_definitions WHERE key = 'idrar_non_skuamoz_epitel'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'pH Urinario', 'Muestra la acidez o alcalinidad de la orina. Informa sobre la capacidad de los riñones para regular el equilibrio ácido-base.'
FROM metric_definitions WHERE key = 'idrar_ph'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Proteínas en Orina', 'Muestra la cantidad de proteínas en la orina. Informa sobre la función de filtración renal.'
FROM metric_definitions WHERE key = 'idrar_protein'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Cristales de Ácido Úrico en Orina', 'Muestra cristales de ácido úrico presentes en la orina. Informa sobre la composición mineral urinaria.'
FROM metric_definitions WHERE key = 'idrar_urik_asit_kristal'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Urobilinógeno en Orina', 'Muestra la cantidad de una sustancia formada al convertirse la bilirrubina en los intestinos. Informa sobre la salud hepática.'
FROM metric_definitions WHERE key = 'idrar_urobilinojen'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Volumen de Orina', 'Muestra la cantidad de orina recogida en un período determinado. Informa sobre la función renal y el equilibrio de líquidos.'
FROM metric_definitions WHERE key = 'idrar_volum'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- İMMÜNOLOJİ (12)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Anti-CMV IgG', 'Anticuerpo que indica si ha habido exposición previa al citomegalovirus (CMV).'
FROM metric_definitions WHERE key = 'anti_cmv_igg'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Anti-CMV IgM', 'Anticuerpo que indica si ha habido exposición reciente al citomegalovirus (CMV).'
FROM metric_definitions WHERE key = 'anti_cmv_igm'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Anti-VHC', 'Detecta anticuerpos producidos por el cuerpo contra el virus de la hepatitis C.'
FROM metric_definitions WHERE key = 'anti_hcv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Anti-VIH', 'Detecta anticuerpos producidos por el cuerpo contra el virus del VIH.'
FROM metric_definitions WHERE key = 'anti_hiv'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Anti-Rubéola IgG', 'Anticuerpo que indica si existe inmunidad contra la rubéola.'
FROM metric_definitions WHERE key = 'anti_rubella_igg'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Anti-Rubéola IgM', 'Anticuerpo que indica si ha habido exposición reciente a la rubéola.'
FROM metric_definitions WHERE key = 'anti_rubella_igm'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Anti-Toxoplasma IgG', 'Anticuerpo que indica si ha habido exposición previa al parásito toxoplasma.'
FROM metric_definitions WHERE key = 'anti_toxo_igg'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Anti-Toxoplasma IgM', 'Anticuerpo que indica si ha habido exposición reciente al parásito toxoplasma.'
FROM metric_definitions WHERE key = 'anti_toxo_igm'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'HBsAg (Antígeno de Superficie de Hepatitis B)', 'Detecta el antígeno de superficie del virus de la hepatitis B. Informa sobre el estado de portador.'
FROM metric_definitions WHERE key = 'hbsag'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Factor Reumatoide (FR)', 'Anticuerpo producido por el sistema inmunitario. Informa sobre la salud articular.'
FROM metric_definitions WHERE key = 'romatoid_faktor'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'IgE Total', 'Tipo de anticuerpo producido por el sistema inmunitario que participa en las reacciones alérgicas.'
FROM metric_definitions WHERE key = 'total_ige'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'VDRL-RPR', 'Prueba de detección que identifica anticuerpos producidos por el cuerpo contra la infección por sífilis.'
FROM metric_definitions WHERE key = 'vdrl_rpr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- KAN GAZI (12)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Brecha Aniónica', 'Muestra la diferencia entre iones con carga positiva y negativa en sangre. Informa sobre el equilibrio ácido-base.'
FROM metric_definitions WHERE key = 'anion_gap'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Exceso de Base (Sangre)', 'Muestra el exceso o déficit de base en la sangre. Informa sobre el equilibrio ácido-base del cuerpo.'
FROM metric_definitions WHERE key = 'be_b'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Exceso de Base (LEC)', 'Muestra el exceso de base en el líquido extracelular. Informa sobre el equilibrio ácido-base del cuerpo.'
FROM metric_definitions WHERE key = 'be_ecf'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Bicarbonato (HCO3)', 'Muestra el nivel de bicarbonato en sangre. Informa sobre la capacidad de los riñones para regular el equilibrio ácido-base.'
FROM metric_definitions WHERE key = 'hco3'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Calcio Ionizado (Ca++)', 'Muestra la cantidad de calcio activo libre en la sangre. Importante para la función muscular y nerviosa.'
FROM metric_definitions WHERE key = 'ionized_calcium'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Lactato', 'Sustancia producida cuando las células generan energía sin oxígeno. Informa sobre la utilización tisular de oxígeno.'
FROM metric_definitions WHERE key = 'lactate'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'PCO2 (Presión Parcial de Dióxido de Carbono)', 'Muestra la presión de dióxido de carbono en sangre. Informa sobre el funcionamiento de los pulmones.'
FROM metric_definitions WHERE key = 'pco2'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'PO2 (Presión Parcial de Oxígeno)', 'Muestra la presión de oxígeno en sangre. Informa sobre la capacidad de los pulmones para absorber oxígeno.'
FROM metric_definitions WHERE key = 'po2'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'SBC (Bicarbonato Estándar)', 'Muestra el nivel de bicarbonato en sangre bajo condiciones estándar. Informa sobre el equilibrio ácido-base.'
FROM metric_definitions WHERE key = 'sbc'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Saturación de Oxígeno (SpO2)', 'Muestra el porcentaje de hemoglobina que transporta oxígeno. Informa sobre el estado de oxigenación del cuerpo.'
FROM metric_definitions WHERE key = 'spo2'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'CO2 Total (TCO2)', 'Muestra la cantidad total de dióxido de carbono en sangre. Informa sobre el equilibrio ácido-base.'
FROM metric_definitions WHERE key = 'tco2'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Hemoglobina Total (tHb)', 'Cantidad total de hemoglobina medida en gasometría. Muestra la capacidad de transporte de oxígeno de la sangre.'
FROM metric_definitions WHERE key = 'thb'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- KARACİĞER (8)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'FA (Fosfatasa Alcalina)', 'Enzima presente en el hígado y los huesos. Informa sobre la salud hepática y ósea.'
FROM metric_definitions WHERE key = 'alp'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'ALT (Alanina Aminotransferasa)', 'Enzima presente en el hígado. Informa sobre la salud hepática.'
FROM metric_definitions WHERE key = 'alt'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'AST (Aspartato Aminotransferasa)', 'Enzima presente en el hígado, el corazón y los músculos. Informa especialmente sobre la salud hepática.'
FROM metric_definitions WHERE key = 'ast'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Bilirrubina Directa', 'Muestra la cantidad de bilirrubina procesada por el hígado. Informa sobre la salud hepática y de las vías biliares.'
FROM metric_definitions WHERE key = 'direkt_bilirubin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'GGT (Gamma-Glutamil Transferasa)', 'Enzima presente en el hígado y las vías biliares. Informa sobre la salud hepática.'
FROM metric_definitions WHERE key = 'ggt'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Bilirrubina Indirecta', 'Muestra la cantidad de bilirrubina de la descomposición de glóbulos rojos aún no procesada por el hígado.'
FROM metric_definitions WHERE key = 'indirekt_bilirubin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'LDH (Lactato Deshidrogenasa)', 'Enzima presente en muchos tejidos del cuerpo. Informa sobre la salud celular y la integridad de los tejidos.'
FROM metric_definitions WHERE key = 'ldh'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Bilirrubina Total', 'Sustancia de color amarillo formada por la descomposición de glóbulos rojos. Informa sobre la salud hepática.'
FROM metric_definitions WHERE key = 'total_bilirubin'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- KARDİYAK (1)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Troponina I', 'Proteína presente en el músculo cardíaco. Informa sobre la salud del músculo del corazón.'
FROM metric_definitions WHERE key = 'troponin_i'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- KOAGÜLASYON (6)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'TTPa (Tiempo de Tromboplastina Parcial Activada)', 'Prueba que mide el tiempo de coagulación de la sangre. Informa sobre el funcionamiento del sistema de coagulación.'
FROM metric_definitions WHERE key = 'aptt'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Dímero D', 'Fragmento de proteína producido cuando se disuelve un coágulo. Informa sobre el sistema de coagulación.'
FROM metric_definitions WHERE key = 'd_dimer'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Fibrinógeno', 'Proteína producida por el hígado que participa en la coagulación sanguínea.'
FROM metric_definitions WHERE key = 'fibrinojen'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'INR (Índice Internacional Normalizado)', 'Muestra la velocidad de coagulación en una escala estandarizada. Informa sobre el sistema de coagulación.'
FROM metric_definitions WHERE key = 'inr'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Tiempo de Protrombina (TP)', 'Mide el tiempo que tarda la sangre en coagularse. Informa sobre los factores de coagulación.'
FROM metric_definitions WHERE key = 'pt'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Tiempo de Protrombina (% Actividad)', 'Muestra el porcentaje de actividad de los factores de coagulación. Informa sobre el nivel funcional del sistema de coagulación.'
FROM metric_definitions WHERE key = 'pt_activity'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- LİPİD (6)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Colesterol HDL', 'Tipo de grasa conocida como colesterol bueno. Ayuda a proteger la salud cardiovascular.'
FROM metric_definitions WHERE key = 'hdl'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Colesterol LDL', 'Tipo de grasa conocida como colesterol malo. Informa sobre la salud cardiovascular.'
FROM metric_definitions WHERE key = 'ldl'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Colesterol No-HDL', 'Muestra el total de todos los tipos de colesterol excepto el HDL. Informa sobre la salud cardiovascular.'
FROM metric_definitions WHERE key = 'non_hdl'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Colesterol Total', 'Sustancia grasa presente en la sangre. El cuerpo la utiliza para construir células y producir hormonas.'
FROM metric_definitions WHERE key = 'total_kolesterol'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Triglicéridos', 'Tipo de grasa en la sangre. El cuerpo necesita triglicéridos para almacenar y utilizar energía.'
FROM metric_definitions WHERE key = 'trigliserid'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Colesterol VLDL', 'Tipo de lipoproteína producida por el hígado. Es responsable de transportar triglicéridos por el cuerpo.'
FROM metric_definitions WHERE key = 'vldl'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- TİROİD (3)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'T3 Libre', 'Hormona activa producida por la glándula tiroides. Informa sobre la tasa metabólica y los niveles de energía.'
FROM metric_definitions WHERE key = 'serbest_t3'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'T4 Libre', 'Hormona producida por la glándula tiroides. Informa sobre la función tiroidea y el metabolismo.'
FROM metric_definitions WHERE key = 'serbest_t4'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'TSH (Hormona Estimulante de la Tiroides)', 'Hormona producida por la glándula pituitaria en el cerebro. Muestra el funcionamiento de la glándula tiroides.'
FROM metric_definitions WHERE key = 'tsh'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- TÜMÖR BELİRTEÇLERİ (4)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'CA-125', 'Marcador proteico producido por ciertas células del cuerpo. Se utiliza en el seguimiento de la salud del aparato reproductor.'
FROM metric_definitions WHERE key = 'ca125'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'CA 15-3', 'Marcador proteico producido por ciertas células del cuerpo. Se utiliza en el seguimiento de la salud mamaria.'
FROM metric_definitions WHERE key = 'ca153'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'CA 19-9', 'Marcador proteico producido por ciertas células del cuerpo. Se utiliza en el seguimiento de la salud del aparato digestivo.'
FROM metric_definitions WHERE key = 'ca199'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'ACE (Antígeno Carcinoembrionario)', 'Marcador proteico producido en el cuerpo. Es un valor de laboratorio utilizado en el seguimiento general de la salud.'
FROM metric_definitions WHERE key = 'cea'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

-- ==================
-- VİTAMİN (3)
-- ==================

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Vitamina B12', 'Vitamina esencial para el funcionamiento del sistema nervioso y la producción de células sanguíneas. Se obtiene de los alimentos.'
FROM metric_definitions WHERE key = 'b12'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Ácido Fólico', 'Vitamina B esencial para el crecimiento celular y la producción de células sanguíneas. Especialmente importante durante el embarazo.'
FROM metric_definitions WHERE key = 'folik_asit'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;

INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'es', 'Vitamina D', 'Vitamina esencial para la salud ósea y dental. Ayuda al cuerpo a utilizar el calcio.'
FROM metric_definitions WHERE key = 'vitamin_d'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;
