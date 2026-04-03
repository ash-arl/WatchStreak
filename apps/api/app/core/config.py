from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App
    APP_NAME: str = "WatchStreak API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "sqlite:///./dev.db"

    # AI Memory (ChromaDB)
    MEMORY_DB_PATH: str = ".data/chromadb"

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_JSON: bool = False  # Set True in production for structured JSON logs

    # YouTube Data API
    YOUTUBE_API_KEY: str = ""

    # CORS — comma-separated origins allowed to call the API
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"


settings = Settings()
