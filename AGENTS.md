<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Marketing photo URLs and responsive variants are centralized in src/assets/gallery/index.ts; downloaded replacements use Lovable asset pointers so media stays outside the repository.
- Visibly uses the verified /api/public/receive-article server route and isolated blog_posts storage; public reads use a publishable client with RLS so existing business storage remains untouched.
- Blog HTML is sanitized server-side before storage and rendering, preserving safe link target/rel attributes while removing executable content.
