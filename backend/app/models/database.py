from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

engine = create_engine(f"sqlite:///{settings.sqlite_db_path}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_utc_now():
    return datetime.now(timezone.utc)

class DocumentModel(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    authority = Column(String)
    jurisdiction = Column(String, index=True)
    document_type = Column(String)
    file_path = Column(String)
    source_url = Column(String, nullable=True)
    version = Column(String, nullable=True)
    effective_date = Column(String, nullable=True)
    ingestion_timestamp = Column(DateTime, default=get_utc_now)

class ChatHistoryModel(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String, index=True)
    role = Column(String)
    content = Column(String)
    sources_json = Column(String, nullable=True)
    timestamp = Column(DateTime, default=get_utc_now)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
