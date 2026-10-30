CREATE TABLE IF NOT EXISTS public.blog_posts (
 id integer PRIMARY KEY,
 title text NOT NULL,
 slug text NOT NULL UNIQUE,
 content_html text,
 content_markdown text,
 hero_image_url text,
 hero_image_alt text,
 infographic_url text,
 meta_description text,
 meta_keywords text,
 tags text,
 faq_schema jsonb,
 language text DEFAULT 'en',
 reading_time integer,
 published_at timestamptz,
 updated_at timestamptz,
 created_at timestamptz,
 received_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read blog articles" ON public.blog_posts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service role manages blog articles" ON public.blog_posts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON public.blog_posts (slug);
CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON public.blog_posts (published_at DESC);