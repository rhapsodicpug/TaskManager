from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey, func, case, Date
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./tasks.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Database Models ---
class ProjectDB(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    color = Column(String, default="#6b7280")
    # CORRECTED: back_populates instead of back_pop_ulates
    tasks = relationship("TaskDB", back_populates="project", cascade="all, delete-orphan")

class TaskDB(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    is_complete = Column(Boolean, default=False)
    priority = Column(Integer, default=1)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    due_date = Column(Date, nullable=True)
    # CORRECTED: back_populates instead of back_pop_ulates
    project = relationship("ProjectDB", back_populates="tasks")

# --- Pydantic Schemas ---
class ProjectBase(BaseModel):
    name: str
    color: Optional[str] = "#6b7280"

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    task_count: int
    completed_count: int
    class Config:
        orm_mode = True

class TaskBase(BaseModel):
    title: str
    priority: Optional[int] = 1
    due_date: Optional[date] = None

class TaskCreate(TaskBase):
    project_id: int

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    priority: Optional[int] = None
    is_complete: Optional[bool] = None
    project_id: Optional[int] = None
    due_date: Optional[date] = None

class Task(TaskBase):
    id: int
    is_complete: bool
    project_id: int
    class Config:
        orm_mode = True

app = FastAPI(title="Task Manager API")
Base.metadata.create_all(bind=engine)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- API Endpoints ---
@app.post("/projects/", response_model=Project)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    db_project = ProjectDB(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return { "id": db_project.id, "name": db_project.name, "color": db_project.color, "task_count": 0, "completed_count": 0 }

@app.get("/projects/", response_model=List[Project])
def read_projects(db: Session = Depends(get_db)):
    task_counts = (db.query(TaskDB.project_id, func.count(TaskDB.id).label("task_count"), func.sum(case((TaskDB.is_complete, 1), else_=0)).label("completed_count")).group_by(TaskDB.project_id).subquery())
    projects_query = (db.query(ProjectDB, func.coalesce(task_counts.c.task_count, 0).label("task_count"), func.coalesce(task_counts.c.completed_count, 0).label("completed_count")).outerjoin(task_counts, ProjectDB.id == task_counts.c.project_id).all())
    return [{"id": p.id, "name": p.name, "color": p.color, "task_count": tc, "completed_count": cc} for p, tc, cc in projects_query]

@app.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    db_project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(db_project)
    db.commit()
    return {"message": "Project deleted successfully"}

@app.get("/notifications/", response_model=List[Task])
def get_notifications(db: Session = Depends(get_db)):
    today = datetime.now().date()
    overdue_tasks = db.query(TaskDB).filter(TaskDB.due_date < today, TaskDB.is_complete == False).all()
    return overdue_tasks

@app.post("/tasks/", response_model=Task)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    db_task = TaskDB(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/tasks/", response_model=List[Task])
def read_tasks(project_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(TaskDB)
    if project_id:
        query = query.filter(TaskDB.project_id == project_id)
    return query.all()

@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    db_task = db.query(TaskDB).filter(TaskDB.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    update_data = task_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(TaskDB).filter(TaskDB.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return {"message": "Task successfully deleted"}