-- Add deleted_at for soft deletes
ALTER TABLE "projects"
ADD COLUMN "deleted_at" TIMESTAMP(3);

-- Index to speed up ownership + active filtering
CREATE INDEX "projects_owner_id_deleted_at_idx" ON "projects"("owner_id", "deleted_at");
