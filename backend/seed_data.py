import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import Organization, User, Event, Registration
import uuid
from datetime import datetime, timedelta
import bcrypt

def seed_database():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    try:
        # Check if data already exists
        existing_org = db.query(Organization).first()
        if existing_org:
            print("Database already has data. Skipping seed.")
            return
        
        # Create admin user
        admin_password = bcrypt.hashpw("admin123".encode(), bcrypt.gensalt()).decode()
        admin_user = User(
            user_id=str(uuid.uuid4()),
            email="admin@ukma.edu.ua",
            full_name="Admin User",
            password_hash=admin_password,
            role="admin",
            created_at=datetime.utcnow()
        )
        db.add(admin_user)
        
        # Create test student user
        student_password = bcrypt.hashpw("student123".encode(), bcrypt.gensalt()).decode()
        student_user = User(
            user_id=str(uuid.uuid4()),
            email="student@ukma.edu.ua",
            full_name="Student User",
            password_hash=student_password,
            role="student",
            created_at=datetime.utcnow()
        )
        db.add(student_user)
        
        # Create IT Club organization
        it_club = Organization(
            organization_id=str(uuid.uuid4()),
            name="IT Club",
            handle="it-club",
            description="IT Club - це спільнота студентів, які захоплюються технологіями та програмуванням. Ми організовуємо хакатони, лекції та воркшопи.",
            category="IT",
            faculty="Факультет інформатики",
            logo_url=None,
            contact_email="itclub@ukma.edu.ua",
            phone="+380 99 123 4567",
            instagram="@itclub_ukma",
            telegram="@itclub_ukma",
            website="https://itclub.ukma.edu.ua",
            status="active",
            created_at=datetime.utcnow()
        )
        db.add(it_club)
        
        # Create Science Club organization
        science_club = Organization(
            organization_id=str(uuid.uuid4()),
            name="Science Club",
            handle="science-club",
            description="Science Club об'єднує студентів, які цікавляться науковими дослідженнями та експериментами.",
            category="Наука",
            faculty="Факультет природничих наук",
            logo_url=None,
            contact_email="science@ukma.edu.ua",
            phone="+380 99 234 5678",
            instagram="@scienceclub_ukma",
            telegram="@scienceclub_ukma",
            website=None,
            status="active",
            created_at=datetime.utcnow()
        )
        db.add(science_club)
        
        # Create Sports Club organization
        sports_club = Organization(
            organization_id=str(uuid.uuid4()),
            name="Sports Club",
            handle="sports-club",
            description="Sports Club - для тих, хто любить спорт та активний спосіб життя. Футбол, баскетбол, волейбол та багато іншого!",
            category="Спорт",
            faculty="Факультет фізичної культури",
            logo_url=None,
            contact_email="sports@ukma.edu.ua",
            phone="+380 99 345 6789",
            instagram="@sportsclub_ukma",
            telegram="@sportsclub_ukma",
            website=None,
            status="active",
            created_at=datetime.utcnow()
        )
        db.add(sports_club)
        
        db.commit()
        
        # Create Hackathon Weekend 2026 event
        hackathon_event = Event(
            event_id=str(uuid.uuid4()),
            organization_id=it_club.organization_id,
            title="Hackathon Weekend 2026",
            description="Приєднуйся до найбільшого хакатону року! 48 годин інтенсивного програмування, командної роботи та креативних рішень. Створюй проекти, навчайся та перемагай!\n\nЩо тебе чекає:\n- Цікаві задачі від реальних компаній\n- Ментори з провідних IT-компаній\n- Смачна їжа та напої\n- Призи для переможців\n\nНе пропусти можливість проявити себе!",
            location="Актова зала, корпус А",
            start_datetime=datetime(2026, 6, 14, 10, 0),
            end_datetime=datetime(2026, 6, 15, 10, 0),
            max_participants=120,
            status="active",
            created_at=datetime.utcnow()
        )
        db.add(hackathon_event)
        
        # Create Web Development Workshop event
        workshop_event = Event(
            event_id=str(uuid.uuid4()),
            organization_id=it_club.organization_id,
            title="Web Development Workshop",
            description="Дізнайся основи веб-розробки за один день! Ми розглянемо HTML, CSS та JavaScript, і ти створиш свою першу веб-сторінку.",
            location="Аудиторія 305, корпус Б",
            start_datetime=datetime(2026, 6, 20, 14, 0),
            end_datetime=datetime(2026, 6, 20, 18, 0),
            max_participants=30,
            status="active",
            created_at=datetime.utcnow()
        )
        db.add(workshop_event)
        
        # Create Science Lecture event
        science_event = Event(
            event_id=str(uuid.uuid4()),
            organization_id=science_club.organization_id,
            title="Лекція: Штучний інтелект у сучасній науці",
            description="Запрошуємо на лекцію про останні досягнення у сфері штучного інтелекту та його застосування в наукових дослідженнях.",
            location="Актова зала, корпус В",
            start_datetime=datetime(2026, 6, 18, 15, 0),
            end_datetime=datetime(2026, 6, 18, 17, 0),
            max_participants=100,
            status="active",
            created_at=datetime.utcnow()
        )
        db.add(science_event)
        
        # Create Basketball Tournament event
        basketball_event = Event(
            event_id=str(uuid.uuid4()),
            organization_id=sports_club.organization_id,
            title="Баскетбольний турнір",
            description="Щорічний баскетбольний турнір серед студентів! Формуй команду та реєструйся для участі.",
            location="Спортивна зала, корпус Г",
            start_datetime=datetime(2026, 6, 25, 10, 0),
            end_datetime=datetime(2026, 6, 25, 18, 0),
            max_participants=50,
            status="active",
            created_at=datetime.utcnow()
        )
        db.add(basketball_event)
        
        db.commit()
        
        # Add some test registrations for the hackathon
        for i in range(82):
            test_user = User(
                user_id=str(uuid.uuid4()),
                email=f"student{i}@ukma.edu.ua",
                full_name=f"Student {i}",
                password_hash=bcrypt.hashpw("password123".encode(), bcrypt.gensalt()).decode(),
                role="student",
                created_at=datetime.utcnow()
            )
            db.add(test_user)
            db.commit()
            
            registration = Registration(
                registration_id=str(uuid.uuid4()),
                user_id=test_user.user_id,
                event_id=hackathon_event.event_id,
                status="confirmed",
                registered_at=datetime.utcnow()
            )
            db.add(registration)
        
        db.commit()
        
        print("✅ Database seeded successfully!")
        print("📧 Admin user: admin@ukma.edu.ua / admin123")
        print("📧 Student user: student@ukma.edu.ua / student123")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
