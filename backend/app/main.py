from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.demo_data import DEMO_PROJECTS
from app.models import Project
from app.schemas import ProjectPayload
from app.search import score_feature
from app.service import (
    create_project,
    feature_row_to_public,
    list_projects,
    project_to_public,
    replace_projects,
    split_stack,
)

settings = get_settings()
app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/projects")
def get_projects(db: Annotated[Session, Depends(get_db)]) -> list[dict[str, object]]:
    return [project_to_public(project) for project in list_projects(db)]


@app.post("/api/projects", status_code=status.HTTP_201_CREATED)
def post_project(payload: ProjectPayload, db: Annotated[Session, Depends(get_db)]) -> dict[str, object]:
    project = create_project(db, payload.model_dump())
    return project_to_public(project)


@app.get("/api/filters")
def get_filters(db: Annotated[Session, Depends(get_db)]) -> dict[str, list[str]]:
    projects = list_projects(db)
    rows = [feature_row_to_public(project, feature) for project in projects for feature in project.features]
    return {
        "clients": sorted({project.client for project in projects}),
        "industries": sorted({project.industry for project in projects}),
        "platforms": sorted({project.platform for project in projects}),
        "products": sorted({project.product for project in projects}),
        "stacks": sorted({stack for row in rows for stack in split_stack(str(row["stack"]))}),
    }


@app.get("/api/features/search")
def search_features(
    db: Annotated[Session, Depends(get_db)],
    q: str = "",
    client: str = "",
    industry: str = "",
    platform: str = "",
    product: str = "",
    stack: str = "",
) -> list[dict[str, object]]:
    projects = list_projects(db)
    rows: list[dict[str, object]] = []
    for project in projects:
        if client and project.client != client:
            continue
        if industry and project.industry != industry:
            continue
        if platform and project.platform != platform:
            continue
        if product and project.product != product:
            continue
        for feature in project.features:
            if stack and stack not in split_stack(feature.stack):
                continue
            row = feature_row_to_public(project, feature)
            row["score"] = score_feature(q, row)
            rows.append(row)

    return sorted(rows, key=lambda row: (-int(row["score"]), -int(row["totalHours"]), str(row["projectName"])))


@app.get("/api/export")
def export_projects(db: Annotated[Session, Depends(get_db)]) -> list[dict[str, object]]:
    return [project_to_public(project) for project in list_projects(db)]


@app.post("/api/import")
def import_projects(payloads: list[ProjectPayload], db: Annotated[Session, Depends(get_db)]) -> list[dict[str, object]]:
    projects = replace_projects(db, [payload.model_dump() for payload in payloads])
    return [project_to_public(project) for project in projects]


@app.post("/api/reset-demo-data")
def reset_demo_data(db: Annotated[Session, Depends(get_db)]) -> list[dict[str, object]]:
    projects = replace_projects(db, DEMO_PROJECTS)
    return [project_to_public(project) for project in projects]


@app.get("/api/projects/{project_id}")
def get_project(project_id: str, db: Annotated[Session, Depends(get_db)]) -> dict[str, object]:
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Проект не найден.")
    return project_to_public(project)
