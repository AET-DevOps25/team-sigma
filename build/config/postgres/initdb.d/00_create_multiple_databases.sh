#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
      -- Create databases for services that need persistent storage
      CREATE DATABASE lecture_db;
      CREATE DATABASE document_db;
    
    -- Grant privileges to the default user
    GRANT ALL PRIVILEGES ON DATABASE lecture_db TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE document_db TO $POSTGRES_USER;
    
    -- Optional: Create service-specific users (uncomment if needed)
    -- CREATE USER lecture_user WITH PASSWORD 'lecture_pass';
    -- CREATE USER document_user WITH PASSWORD 'document_pass';
    
    -- GRANT ALL PRIVILEGES ON DATABASE lecture_db TO lecture_user;
    -- GRANT ALL PRIVILEGES ON DATABASE document_db TO document_user;
EOSQL

echo "Multiple databases created successfully!" 