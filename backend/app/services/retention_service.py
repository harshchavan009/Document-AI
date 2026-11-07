import os
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from backend.app.database import SessionLocal
from backend.app.models import Workspace, Document
from backend.app.config import settings
from backend.app.services.vector_store import VectorStoreService

logger = logging.getLogger(__name__)


class RetentionService:
    """
    Automated data lifecycle and retention management.
    Purges stale visitor workspaces, raw documents, and vector embeddings.
    """

    @staticmethod
    def purge_expired_workspaces(
        db: Optional[Session] = None,
        retention_days: Optional[int] = None
    ) -> int:
        """
        Finds and permanently deletes workspaces whose last activity exceeds the retention threshold.
        Cleans up physical disk files, ChromaDB collections, and database records.
        """
        days = retention_days if retention_days is not None else settings.DATA_RETENTION_DAYS
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)

        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            stale_workspaces = (
                db.query(Workspace)
                .filter(Workspace.updated_at < cutoff)
                .all()
            )
            count = len(stale_workspaces)
            if count == 0:
                logger.info(f"Data retention check: 0 workspaces exceed {days} days retention.")
                return 0

            logger.info(f"Data retention: purging {count} workspaces older than {days} days.")
            vs = VectorStoreService()

            for ws in stale_workspaces:
                # 1. Clean up physical files on disk for all documents in workspace
                docs = db.query(Document).filter(Document.workspace_id == ws.id).all()
                for d in docs:
                    if d.storage_path and os.path.exists(d.storage_path):
                        try:
                            os.remove(d.storage_path)
                        except Exception as e:
                            logger.warning(f"Retention file deletion error for {d.storage_path}: {e}")

                # 2. Clean up ChromaDB vectors
                try:
                    vs.delete_workspace(ws.id)
                except Exception as e:
                    logger.warning(f"Retention vector deletion error for workspace {ws.id}: {e}")

                # 3. Delete database record (cascades to docs, chunks, chat sessions)
                db.delete(ws)

            db.commit()
            logger.info(f"Successfully purged {count} expired workspaces and associated resources.")
            return count

        except Exception as e:
            logger.error(f"Error during retention reaper execution: {e}")
            if db:
                db.rollback()
            return 0
        finally:
            if close_session:
                db.close()
