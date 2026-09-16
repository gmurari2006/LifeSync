-- LifeSync Database Foundation Initialization Script
-- Enables PostGIS extension for spatial queries and UUID support for identifiers

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- Confirm extensions
DO $$
BEGIN
    RAISE NOTICE 'LifeSync DB Foundation Initialized: PostGIS & UUID extensions active.';
END $$;
