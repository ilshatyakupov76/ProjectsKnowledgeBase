from uuid import uuid4

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session, selectinload

from app.models import Feature, Project


def list_projects(db: Session) -> list[Project]:
    return list(
        db.scalars(
            select(Project)
            .options(selectinload(Project.features))
            .order_by(Project.created_at.desc(), Project.name.asc())
        )
    )


def project_count(db: Session) -> int:
    return int(db.scalar(select(func.count()).select_from(Project)) or 0)


def split_stack(stack: str | None) -> list[str]:
    return [item.strip() for item in str(stack or "").split(",") if item.strip()]


def project_to_public(project: Project) -> dict[str, object]:
    return {
        "id": project.id,
        "name": project.name,
        "client": project.client,
        "industry": project.industry,
        "platform": project.platform,
        "product": project.product,
        "features": [feature_to_public(feature) for feature in project.features],
    }


def feature_to_public(feature: Feature) -> dict[str, object]:
    return {
        "name": feature.name,
        "analysisHours": feature.analysis_hours,
        "developmentHours": feature.development_hours,
        "testingHours": feature.testing_hours,
        "stack": feature.stack,
    }


def feature_row_to_public(project: Project, feature: Feature) -> dict[str, object]:
    total_hours = feature.analysis_hours + feature.development_hours + feature.testing_hours
    return {
        "projectId": project.id,
        "projectName": project.name,
        "client": project.client,
        "industry": project.industry,
        "platform": project.platform,
        "product": project.product,
        "name": feature.name,
        "analysisHours": feature.analysis_hours,
        "developmentHours": feature.development_hours,
        "testingHours": feature.testing_hours,
        "totalHours": total_hours,
        "stack": feature.stack,
    }


def build_features(payload: dict[str, object]) -> list[Feature]:
    return [
        Feature(
            name=str(feature["name"]).strip(),
            analysis_hours=int(feature.get("analysisHours") or 0),
            development_hours=int(feature.get("developmentHours") or 0),
            testing_hours=int(feature.get("testingHours") or 0),
            stack=str(feature["stack"]).strip(),
        )
        for feature in payload["features"]
    ]


def apply_project_payload(project: Project, payload: dict[str, object]) -> Project:
    project.name = str(payload["name"]).strip()
    project.client = str(payload.get("client") or "Не указан").strip()
    project.industry = str(payload["industry"]).strip()
    project.platform = str(payload["platform"]).strip()
    project.product = str(payload["product"]).strip()
    project.features = build_features(payload)
    return project


def create_project(db: Session, payload: dict[str, object], commit: bool = True) -> Project:
    project = Project(
        id=str(payload.get("id") or uuid4()),
    )
    apply_project_payload(project, payload)
    db.add(project)
    if commit:
        db.commit()
        db.refresh(project)
    return project


def update_project(db: Session, project: Project, payload: dict[str, object]) -> Project:
    apply_project_payload(project, payload)
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project: Project) -> None:
    db.delete(project)
    db.commit()


def replace_projects(db: Session, payloads: list[dict[str, object]]) -> list[Project]:
    db.execute(delete(Feature))
    db.execute(delete(Project))
    for payload in payloads:
        create_project(db, payload, commit=False)
    db.commit()
    return list_projects(db)
