"""
Seed script to populate database with sample data

Run this after database migrations:
    python seed_data.py
"""

from app.database import SessionLocal
from app.models.models import User, Panchayat, FormSchema
from app.utils.security import get_password_hash
import json

# Sample form schemas
BASIC_INFO_SCHEMA = {
    "module_id": "basic_info",
    "module_name": "Basic Information",
    "version": "1.0",
    "fields": [
        {
            "field_id": "village_id",
            "label": "Village ID",
            "type": "text",
            "required": True,
            "placeholder": "GP-2024-001"
        },
        {
            "field_id": "village_name",
            "label": "Name of Village",
            "type": "text",
            "required": True
        },
        {
            "field_id": "gram_panchayat",
            "label": "Gram Panchayat",
            "type": "text",
            "required": True
        },
        {
            "field_id": "num_wards",
            "label": "Number of Wards",
            "type": "number",
            "min": 1
        },
        {
            "field_id": "num_hamlets",
            "label": "Number of Hamlets",
            "type": "number",
            "min": 0
        },
        {
            "field_id": "total_population",
            "label": "Total Population",
            "type": "number",
            "min": 0
        },
        {
            "field_id": "total_households",
            "label": "Total Households",
            "type": "number",
            "min": 0
        },
        {
            "field_id": "sc_population",
            "label": "SC Population",
            "type": "number",
            "min": 0
        },
        {
            "field_id": "st_population",
            "label": "ST Population",
            "type": "number",
            "min": 0
        }
    ]
}

INFRASTRUCTURE_SCHEMA = {
    "module_id": "infrastructure",
    "module_name": "Infrastructure & Amenities",
    "version": "1.0",
    "fields": [
        {
            "field_id": "primary_school_govt",
            "label": "Primary Schools (Govt.)",
            "type": "table_row",
            "columns": [
                {"id": "present", "label": "Present in Village", "type": "radio"},
                {"id": "number", "label": "Number", "type": "number"},
                {"id": "distance", "label": "Distance (km)", "type": "number"}
            ]
        },
        {
            "field_id": "primary_health_centre",
            "label": "Primary Health Centre",
            "type": "table_row",
            "columns": [
                {"id": "present", "label": "Present in Village", "type": "radio"},
                {"id": "number", "label": "Number", "type": "number"},
                {"id": "distance", "label": "Distance (km)", "type": "number"}
            ]
        },
        {
            "field_id": "anganwadi_centre",
            "label": "Anganwadi Centre",
            "type": "table_row",
            "columns": [
                {"id": "present", "label": "Present in Village", "type": "radio"},
                {"id": "number", "label": "Number", "type": "number"},
                {"id": "distance", "label": "Distance (km)", "type": "number"}
            ]
        }
    ]
}

SANITATION_SCHEMA = {
    "module_id": "sanitation",
    "module_name": "Sanitation & Hygiene",
    "version": "1.0",
    "fields": [
        {
            "field_id": "households_with_toilet",
            "label": "Households with Toilet",
            "type": "number",
            "min": 0
        },
        {
            "field_id": "open_defecation_free",
            "label": "Open Defecation Free Status",
            "type": "radio",
            "options": ["Yes", "No", "Partially"]
        },
        {
            "field_id": "solid_waste_management",
            "label": "Solid Waste Management System",
            "type": "radio",
            "options": ["Yes", "No"]
        },
        {
            "field_id": "drainage_system",
            "label": "Drainage System",
            "type": "radio",
            "options": ["Covered", "Open", "None"]
        }
    ]
}


def seed_database():
    """Seed database with sample data"""
    db = SessionLocal()
    
    try:
        print("🌱 Seeding database...")
        
        # Create sample panchayats
        panchayats = [
            Panchayat(
                panchayat_id="PANCH_001",
                name="Rampur Gram Panchayat",
                block="Rampur Block",
                district="Varanasi",
                state="Uttar Pradesh",
                pin_code="221001",
                contact_number="9876543210"
            ),
            Panchayat(
                panchayat_id="PANCH_002",
                name="Shivpur Gram Panchayat",
                block="Chandauli Block",
                district="Chandauli",
                state="Uttar Pradesh",
                pin_code="232101",
                contact_number="9876543211"
            ),
            Panchayat(
                panchayat_id="PANCH_003",
                name="Deogaon Gram Panchayat",
                block="Ghazipur Block",
                district="Ghazipur",
                state="Uttar Pradesh",
                pin_code="233001",
                contact_number="9876543212"
            )
        ]
        
        for panchayat in panchayats:
            existing = db.query(Panchayat).filter(
                Panchayat.panchayat_id == panchayat.panchayat_id
            ).first()
            if not existing:
                db.add(panchayat)
                print(f"✅ Created Panchayat: {panchayat.name}")
        
        db.commit()
        
        # Create sample users
        users = [
            User(
                user_id="USER_ADMIN001",
                username="admin",
                email="admin@sampark.gov.in",
                hashed_password=get_password_hash("admin123"),
                full_name="Admin User",
                role="admin",
                panchayat_id="PANCH_001"
            ),
            User(
                user_id="USER_001",
                username="ramesh.kumar",
                email="ramesh@panch001.gov.in",
                hashed_password=get_password_hash("password123"),
                full_name="Ramesh Kumar",
                role="staff",
                panchayat_id="PANCH_001"
            ),
            User(
                user_id="USER_002",
                username="sita.devi",
                email="sita@panch002.gov.in",
                hashed_password=get_password_hash("password123"),
                full_name="Sita Devi",
                role="staff",
                panchayat_id="PANCH_002"
            ),
            User(
                user_id="USER_003",
                username="mohan.singh",
                email="mohan@panch003.gov.in",
                hashed_password=get_password_hash("password123"),
                full_name="Mohan Singh",
                role="staff",
                panchayat_id="PANCH_003"
            ),
            User(
                user_id="USER_BLOCK001",
                username="block.officer",
                email="officer@block.gov.in",
                hashed_password=get_password_hash("officer123"),
                full_name="Block Development Officer",
                role="block_officer",
                panchayat_id=None
            )
        ]
        
        for user in users:
            existing = db.query(User).filter(User.username == user.username).first()
            if not existing:
                db.add(user)
                print(f"✅ Created User: {user.username} (password: admin123/password123/officer123)")
        
        db.commit()
        
        # Create form schemas
        schemas = [
            FormSchema(
                schema_id="SCHEMA_BASIC_001",
                module_name="basic_info",
                version="1.0",
                schema_json=BASIC_INFO_SCHEMA,
                is_active=True
            ),
            FormSchema(
                schema_id="SCHEMA_INFRA_001",
                module_name="infrastructure",
                version="1.0",
                schema_json=INFRASTRUCTURE_SCHEMA,
                is_active=True
            ),
            FormSchema(
                schema_id="SCHEMA_SANIT_001",
                module_name="sanitation",
                version="1.0",
                schema_json=SANITATION_SCHEMA,
                is_active=True
            )
        ]
        
        for schema in schemas:
            existing = db.query(FormSchema).filter(
                FormSchema.schema_id == schema.schema_id
            ).first()
            if not existing:
                db.add(schema)
                print(f"✅ Created Schema: {schema.module_name}")
        
        db.commit()
        
        print("\n✨ Database seeding completed successfully!")
        print("\n📋 Sample Credentials:")
        print("   Admin    - Username: admin          Password: admin123")
        print("   Staff 1  - Username: ramesh.kumar   Password: password123")
        print("   Staff 2  - Username: sita.devi      Password: password123")
        print("   Staff 3  - Username: mohan.singh    Password: password123")
        print("   Officer  - Username: block.officer  Password: officer123")
        print("\n🚀 You can now test the API at http://localhost:8000/docs")
        
    except Exception as e:
        print(f"❌ Error seeding database: {str(e)}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
