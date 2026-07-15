-- Rename UIBC to its Turkish name "Doymamış Demir Bağlama Kapasitesi"
-- UIBC is an English abbreviation that doesn't mean anything to Turkish users.
-- The Turkish full name is more meaningful.

BEGIN;

-- 1. Update Turkish display_name
UPDATE metric_translations
SET display_name = 'Doymamış Demir Bağlama Kapasitesi'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'uibc')
  AND locale = 'tr';

-- 2. Remove the alias "Doymamış Demir Bağlama Kapasitesi" → UIBC
--    (it's now the canonical Turkish name, no longer needed as alias)
DELETE FROM metric_aliases
WHERE alias = 'Doymamış Demir Bağlama Kapasitesi'
  AND metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'uibc');

-- 3. Add "UIBC" as an alias so PDFs with that abbreviation still match
INSERT INTO metric_aliases (metric_definition_id, canonical_name, alias)
SELECT id, 'Doymamış Demir Bağlama Kapasitesi', 'UIBC'
FROM metric_definitions WHERE key = 'uibc'
ON CONFLICT (alias) DO NOTHING;

-- 4. Update remaining aliases to point to the new canonical name
UPDATE metric_aliases
SET canonical_name = 'Doymamış Demir Bağlama Kapasitesi'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'uibc')
  AND canonical_name IN ('UIBC', 'UIBC (Doymamış Demir Bağlama Kapasitesi)');

COMMIT;
