import json
import logging
import re
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.job import JobDescription
from ..models.user import User
from ..schemas.job import JobDescriptionCreate

logger = logging.getLogger(__name__)


def extract_keywords(text: str) -> list[str]:
    """Extract basic keywords from job description text."""
    try:
        # Simple keyword extraction - look for common tech terms and skills
        tech_keywords = set()
        
        # Common programming languages and technologies
        tech_patterns = [
            r'\b(Python|JavaScript|Java|C\+\+|C#|Ruby|Go|Rust|PHP|Swift|Kotlin|Scala|TypeScript)\b',
            r'\b(React|Vue|Angular|Node\.js|Express|Django|Flask|Spring|Rails|Laravel|Symfony)\b',
            r'\b(AWS|Azure|GCP|Docker|Kubernetes|Terraform|Ansible|Jenkins|Git|CI\/CD)\b',
            r'\b(MongoDB|PostgreSQL|MySQL|Redis|Elasticsearch|Cassandra|DynamoDB)\b',
            r'\b(Machine Learning|AI|Data Science|Deep Learning|TensorFlow|PyTorch|Scikit-learn)\b',
            r'\b(Agile|Scrum|Kanban|DevOps|Microservices|REST|GraphQL|API)\b'
        ]
        
        for pattern in tech_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            tech_keywords.update([match.lower() for match in matches])
        
        return list(tech_keywords)
    except Exception as e:
        logger.warning(f"Error extracting keywords: {str(e)}")
        return []


def count_words(text: str) -> int:
    """Count words in text."""
    try:
        return len(text.split())
    except Exception as e:
        logger.warning(f"Error counting words: {str(e)}")
        return 0


async def create_job_description(
    db: AsyncSession,
    *,
    user: User,
    data: JobDescriptionCreate,
) -> JobDescription:
    """
    Create a new job description in the database.
    
    Args:
        db: Async database session
        user: User object creating the job description
        data: Job description data from validated Pydantic schema
        
    Returns:
        JobDescription: Created job description object
        
    Raises:
        HTTPException: For database errors or validation failures
    """
    try:
        logger.info(f"Creating job description for user {user.id}: {data.title}")
        
        # Calculate word count and extract keywords
        word_count = count_words(data.description_text)
        keywords = extract_keywords(data.description_text)
        
        # Create job description object
        job = JobDescription(
            user_id=user.id,
            title=data.title,
            company=data.company,
            location=data.location,
            employment_type=data.employment_type,
            experience_level=data.experience_level,
            work_mode=data.work_mode,
            salary_range=data.salary_range,
            tech_stack=json.dumps(data.tech_stack) if data.tech_stack else None,
            description_text=data.description_text,
            word_count=word_count,
            keywords=json.dumps(keywords) if keywords else None,
        )
        
        # Save to database
        db.add(job)
        await db.commit()
        await db.refresh(job)
        
        logger.info(f"Successfully created job description {job.id} for user {user.id}")
        return job
        
    except SQLAlchemyError as e:
        logger.error(f"Database error creating job description for user {user.id}: {str(e)}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred while saving job description"
        )
    except Exception as e:
        logger.error(f"Unexpected error creating job description for user {user.id}: {str(e)}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while creating job description"
        )


async def list_job_descriptions_for_user(
    db: AsyncSession,
    *,
    user: User,
) -> list[JobDescription]:
    stmt = (
        select(JobDescription)
        .where(JobDescription.user_id == user.id)
        .order_by(JobDescription.created_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_job_description_for_user(
    db: AsyncSession,
    *,
    user: User,
    job_id: UUID,
) -> JobDescription:
    stmt = select(JobDescription).where(
        JobDescription.id == job_id,
        JobDescription.user_id == user.id,
    )
    result = await db.execute(stmt)
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job description not found",
        )
    return job


async def delete_job_description(
    db: AsyncSession,
    *,
    user: User,
    job_id: UUID,
) -> None:
    job = await get_job_description_for_user(db, user=user, job_id=job_id)
    await db.delete(job)
    await db.commit()

