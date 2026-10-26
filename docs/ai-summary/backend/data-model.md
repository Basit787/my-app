# AI summary API — data model

PostgreSQL database `ai_summary` (created on first start by `utils/init_db.py`; tables by SQLAlchemy `create_all`).

## `documents`

- `id` (uuid), `user_id` (indexed), `filename`, `storage_key` (MinIO key, unique), `size`, `status` (`UPLOADED` → `PROCESSING` → `COMPLETED` | `FAILED`), `summary`, `created_at`, `updated_at`

## Elsewhere

- MinIO bucket `ai-summaries`: the uploaded text at `<userId>/<uuid>.txt`.
- Redis channel `ai-summary:events:<userId>`: status events for the user's open streams.
