from app.database import SessionLocal
from app.demo_data import DEMO_PROJECTS
from app.service import project_count, replace_projects


def seed_if_empty() -> None:
    with SessionLocal() as db:
        if project_count(db) == 0:
            replace_projects(db, DEMO_PROJECTS)


if __name__ == "__main__":
    seed_if_empty()
