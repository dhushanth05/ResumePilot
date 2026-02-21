import logging
from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from ..core.deps import DBSessionDep, UserDep
from ..schemas.job import (
    JobDescriptionCreate, 
    JobDescriptionRead, 
    JobDescriptionCreateResponse
)
from ..services import jobs as job_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post(
    "",
    response_model=JobDescriptionCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new job description",
    description="Save a new job description with structured data including title, company, location, experience level, employment type, and tech stack.",
)
async def create_job_description(
    payload: JobDescriptionCreate,
    db: DBSessionDep,
    current_user: UserDep,
) -> JobDescriptionCreateResponse:
    """
    Create a new job description for the authenticated user.
    
    Args:
        payload: Job description data with all required fields
        db: Database session dependency
        current_user: Authenticated user dependency
        
    Returns:
        JobDescriptionCreateResponse: Success message with created job data
        
    Raises:
        HTTPException: For validation errors, database errors, or service failures
    """
    try:
        logger.info(f"User {current_user.id} attempting to create job description: {payload.title}")
        
        # Create job description through service layer
        job = await job_service.create_job_description(
            db,
            user=current_user,
            data=payload,
        )
        
        # Validate the created job
        if not job:
            logger.error(f"Failed to create job description for user {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create job description due to an internal error"
            )
        
        logger.info(f"Successfully created job description {job.id} for user {current_user.id}")
        
        # Return success response
        return JobDescriptionCreateResponse(
            message="Job description created successfully",
            job=JobDescriptionRead.model_validate(job),
            status_code=status.HTTP_201_CREATED
        )
        
    except ValueError as ve:
        # Handle Pydantic validation errors
        logger.warning(f"Validation error for user {current_user.id}: {str(ve)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle unexpected errors
        logger.error(f"Unexpected error creating job description for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while creating the job description"
        )


@router.get("", response_model=list[JobDescriptionRead])
async def list_job_descriptions(
    db: DBSessionDep,
    current_user: UserDep,
) -> list[JobDescriptionRead]:
    items = await job_service.list_job_descriptions_for_user(db, user=current_user)
    return [JobDescriptionRead.model_validate(j) for j in items]


@router.get("/{job_id}", response_model=JobDescriptionRead)
async def get_job_description(
    job_id: UUID,
    db: DBSessionDep,
    current_user: UserDep,
) -> JobDescriptionRead:
    job = await job_service.get_job_description_for_user(
        db,
        user=current_user,
        job_id=job_id,
    )
    return JobDescriptionRead.model_validate(job)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job_description(
    job_id: UUID,
    db: DBSessionDep,
    current_user: UserDep,
) -> None:
    await job_service.delete_job_description(
        db,
        user=current_user,
        job_id=job_id,
    )

