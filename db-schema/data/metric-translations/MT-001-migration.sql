-- MT-001: Add description column to metric_translations + normalize categories
-- Applied to Neon test branch: metric-translations-test (ep-dry-firefly-ag9z6ef3)

-- Step 1: Add description column (nullable TEXT)
ALTER TABLE metric_translations ADD COLUMN IF NOT EXISTS description TEXT;

-- Step 2: Normalize categories from mixed English/Turkish to consistent Turkish slugs
UPDATE metric_definitions SET category = 'hemogram' WHERE category = 'CBC';
UPDATE metric_definitions SET category = 'biyokimya' WHERE category = 'Chemistry';
UPDATE metric_definitions SET category = 'karaciger' WHERE category = 'Liver';
UPDATE metric_definitions SET category = 'lipid' WHERE category = 'Lipid';
UPDATE metric_definitions SET category = 'koagulasyon' WHERE category = 'Coagulation';
UPDATE metric_definitions SET category = 'demir' WHERE category = 'Iron';
UPDATE metric_definitions SET category = 'vitamin' WHERE category = 'Vitamins';
UPDATE metric_definitions SET category = 'tiroid' WHERE category = 'Thyroid';
UPDATE metric_definitions SET category = 'enflamasyon' WHERE category = 'Inflammation';
UPDATE metric_definitions SET category = 'diger' WHERE category = 'Other';
UPDATE metric_definitions SET category = 'tumor_belirtecleri' WHERE category = 'tumor_marker';
UPDATE metric_definitions SET category = 'kardiyak' WHERE category = 'kardiyoloji';
