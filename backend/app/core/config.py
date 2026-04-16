from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:postgres@postgres:5432/aibc"
    redis_url: str = "redis://redis:6379/0"

    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    otp_expire_seconds: int = 300

    llm_api_key: str = "sk-your-key-here"
    llm_api_base_url: str = "https://api.openai.com/v1"
    llm_model: str = "gpt-4o-mini"

    frontend_url: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
