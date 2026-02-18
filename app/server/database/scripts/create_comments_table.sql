-- Create the comments table in RDS (run this in your PostgreSQL client connected to Glassinformer RDS).
-- Comments are stored here, not in the articles table.

CREATE TABLE IF NOT EXISTS public.comments (
    id_comment VARCHAR(255) PRIMARY KEY,
    id_article VARCHAR(255) NOT NULL,
    id_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    comment_id_user VARCHAR(255) NOT NULL,
    comment_content TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_id_article ON public.comments (id_article);
CREATE INDEX IF NOT EXISTS idx_comments_id_timestamp ON public.comments (id_timestamp);

-- Optional: foreign key to articles (uncomment if you want referential integrity)
-- ALTER TABLE public.comments
--   ADD CONSTRAINT fk_comments_article
--   FOREIGN KEY (id_article) REFERENCES public.articles (id_article) ON DELETE CASCADE;
