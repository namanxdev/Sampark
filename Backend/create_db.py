import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL and extract connection details
database_url = os.getenv('DATABASE_URL')
# Extract password and other details from DATABASE_URL
# Format: postgresql://username:password@localhost:5432/sampark_db
url_parts = database_url.replace('postgresql://', '').split('@')
user_pass = url_parts[0].split(':')
username = user_pass[0]
password = user_pass[1]
host_port_db = url_parts[1].split('/')
host_port = host_port_db[0].split(':')
host = host_port[0]
port = host_port[1]
database = host_port_db[1]

try:
    # Connect to PostgreSQL server (not to a specific database)
    conn = psycopg2.connect(
        host=host,
        port=port,
        user=username,
        password=password,
        database='postgres'  # Connect to default postgres database
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    
    cursor = conn.cursor()
    
    # Check if database exists
    cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{database}'")
    exists = cursor.fetchone()
    
    if not exists:
        # Create the database
        cursor.execute(f'CREATE DATABASE {database}')
        print(f"Database '{database}' created successfully!")
    else:
        print(f"Database '{database}' already exists.")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Error creating database: {e}")