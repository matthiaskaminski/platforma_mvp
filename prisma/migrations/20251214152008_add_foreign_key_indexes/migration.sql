-- CreateIndex
CREATE INDEX "profiles_email_idx" ON "profiles"("email");

-- CreateIndex
CREATE INDEX "clients_project_id_idx" ON "clients"("project_id");

-- CreateIndex
CREATE INDEX "projects_designer_id_idx" ON "projects"("designer_id");

-- CreateIndex
CREATE INDEX "rooms_project_id_idx" ON "rooms"("project_id");

-- CreateIndex
CREATE INDEX "wishlists_designer_id_idx" ON "wishlists"("designer_id");

-- CreateIndex
CREATE INDEX "product_items_wishlist_id_idx" ON "product_items"("wishlist_id");

-- CreateIndex
CREATE INDEX "product_items_room_id_idx" ON "product_items"("room_id");

-- CreateIndex
CREATE INDEX "tasks_project_id_idx" ON "tasks"("project_id");

-- CreateIndex
CREATE INDEX "tasks_room_id_idx" ON "tasks"("room_id");

-- CreateIndex
CREATE INDEX "contacts_project_id_idx" ON "contacts"("project_id");

-- CreateIndex
CREATE INDEX "conversations_project_id_idx" ON "conversations"("project_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_idx" ON "messages"("conversation_id");

-- CreateIndex
CREATE INDEX "surveys_project_id_idx" ON "surveys"("project_id");

-- CreateIndex
CREATE INDEX "moodboards_project_id_idx" ON "moodboards"("project_id");

-- CreateIndex
CREATE INDEX "documents_project_id_idx" ON "documents"("project_id");

-- CreateIndex
CREATE INDEX "notes_room_id_idx" ON "notes"("room_id");

-- CreateIndex
CREATE INDEX "calendar_events_project_id_idx" ON "calendar_events"("project_id");

-- CreateIndex
CREATE INDEX "gallery_images_room_id_idx" ON "gallery_images"("room_id");
