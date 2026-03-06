import os
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.getenv("DATABASE_URL")

app = FastAPI(title="Thai Consonant Quiz API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StartQuizRequest(BaseModel):
    nickname: str


def get_connection():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not set")
    return psycopg2.connect(DATABASE_URL)


def init_db():
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS users (
                        id SERIAL PRIMARY KEY,
                        nickname TEXT UNIQUE NOT NULL,
                        quiz_starts INTEGER NOT NULL DEFAULT 0,
                        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    );
                    """
                )
    finally:
        conn.close()


@app.on_event("startup")
def startup_event():
    init_db()


@app.get("/")
def root():
    return {"message": "Thai Consonant Quiz API is running"}


@app.post("/users/start")
def start_quiz(payload: StartQuizRequest):
    nickname = payload.nickname.strip()

    if not nickname:
      raise HTTPException(status_code=400, detail="Nickname is required")

    now = datetime.now(timezone.utc)

    conn = get_connection()
    try:
        with conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT * FROM users WHERE LOWER(nickname) = LOWER(%s)",
                    (nickname,),
                )
                existing = cur.fetchone()

                if existing:
                    cur.execute(
                        """
                        UPDATE users
                        SET quiz_starts = quiz_starts + 1,
                            updated_at = %s
                        WHERE id = %s
                        RETURNING nickname, quiz_starts, created_at, updated_at
                        """,
                        (now, existing["id"]),
                    )
                    user = cur.fetchone()
                else:
                    cur.execute(
                        """
                        INSERT INTO users (nickname, quiz_starts, created_at, updated_at)
                        VALUES (%s, 1, %s, %s)
                        RETURNING nickname, quiz_starts, created_at, updated_at
                        """,
                        (nickname, now, now),
                    )
                    user = cur.fetchone()

        return {
            "nickname": user["nickname"],
            "quiz_starts": user["quiz_starts"],
            "created_at": user["created_at"],
            "updated_at": user["updated_at"],
        }
    finally:
        conn.close()