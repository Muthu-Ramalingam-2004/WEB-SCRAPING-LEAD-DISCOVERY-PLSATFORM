import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.database import get_db
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin, ChangePassword, TokenResponse, UserResponse
from app.core.security import get_password_hash, verify_password

router = APIRouter()
logger = logging.getLogger(__name__)


def _lookup_user_by_email(db: Session, email: str) -> User | None:
    """
    Case-insensitive email lookup.
    Normalises the email to lowercase before querying so that
    'User@Gmail.com' matches an account stored as 'user@gmail.com' and vice versa.
    """
    return db.query(User).filter(func.lower(User.email) == email.strip().lower()).first()


@router.post("/register", response_model=UserResponse)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    if user_data.password != user_data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    # Normalise email to lowercase before storing so lookups are always consistent
    normalised_email = user_data.email.strip().lower()

    existing_user_email = _lookup_user_by_email(db, normalised_email)
    if existing_user_email:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    existing_user_username = db.query(User).filter(
        func.lower(User.username) == user_data.username.strip().lower()
    ).first()
    if existing_user_username:
        raise HTTPException(status_code=400, detail="Username already exists.")

    new_user = User(
        email=normalised_email,
        username=user_data.username.strip(),
        hashed_password=get_password_hash(user_data.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    logger.info("Registered new user id=%s email=%s", new_user.id, new_user.email)
    return new_user


@router.post("/login", response_model=TokenResponse)
def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    user = _lookup_user_by_email(db, user_data.email)
    if not user:
        # Log for server debugging only — never reveal to client whether the email exists
        logger.warning("Login attempt for unknown email: %s", user_data.email.strip().lower())
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not verify_password(user_data.password, user.hashed_password):
        logger.warning("Wrong password for user id=%s email=%s", user.id, user.email)
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    # Simple token for this implementation
    access_token = f"dummy-token-for-{user.id}"
    logger.info("User id=%s logged in successfully", user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/change-password")
def change_password(data: ChangePassword, db: Session = Depends(get_db)):
    if data.new_password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    user = _lookup_user_by_email(db, data.email)
    if not user:
        raise HTTPException(status_code=404, detail="Account not found.")

    user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    logger.info("Password changed for user id=%s", user.id)
    return {"message": "Password changed successfully."}
