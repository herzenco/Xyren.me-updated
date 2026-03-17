-- Add ClickUp sync tracking columns to contact_submissions
ALTER TABLE contact_submissions
ADD COLUMN clickup_status VARCHAR(20) DEFAULT 'pending' CHECK (clickup_status IN ('pending', 'synced', 'sync_failed')),
ADD COLUMN clickup_task_id VARCHAR(255),
ADD COLUMN clickup_error TEXT,
ADD COLUMN synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN retry_count INTEGER DEFAULT 0;

-- Create index for filtering by sync status
CREATE INDEX idx_contact_submissions_clickup_status ON contact_submissions(clickup_status);
