from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin, ChangePassword, TokenResponse, UserResponse
from app.core.security import get_password_hash, verify_password

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    if user_data.password != user_data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")
    
    # Check if user already exists
    existing_user_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_user_email:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
        
    existing_user_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_user_username:
        raise HTTPException(status_code=400, detail="Username already exists.")

    new_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=get_password_hash(user_data.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=TokenResponse)
def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    # Simple dummy token for this implementation
    access_token = f"dummy-token-for-{user.id}"
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/change-password")
def change_password(data: ChangePassword, db: Session = Depends(get_db)):
    if data.new_password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")
        
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Account not found.")
        
    user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Password changed successfully."}
