from pydantic import BaseModel, Field


class FeaturePayload(BaseModel):
    name: str = Field(min_length=1)
    analysisHours: int = Field(default=0, ge=0)
    developmentHours: int = Field(default=0, ge=0)
    testingHours: int = Field(default=0, ge=0)
    stack: str = Field(min_length=1)


class ProjectPayload(BaseModel):
    id: str | None = None
    name: str = Field(min_length=1)
    client: str = Field(default="Не указан", min_length=1)
    industry: str = Field(min_length=1)
    platform: str = Field(min_length=1)
    product: str = Field(min_length=1)
    features: list[FeaturePayload] = Field(min_length=1)
