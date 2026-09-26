from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3-flash-preview"
    chroma_persist_dir: str = "./data/chroma_db"
    chroma_distance_metric: str = "cosine"
    sqlite_db_path: str = "./ip_shakti.db"
    embedding_model: str = "paraphrase-multilingual-MiniLM-L12-v2"
    retrieval_threshold: float = 0.20
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    def get_cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

settings = Settings()
