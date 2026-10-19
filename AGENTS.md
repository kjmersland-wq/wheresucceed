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

- Use font-outlined SVG masters for the brand logo; derive PNGs, icons and social assets from them to keep typography consistent without runtime fonts.
- Reference hosted logo/social media through asset pointers; keep browser favicons and the web manifest in public for standard head links.
- Put social image metadata on the homepage leaf only with an absolute deployed URL; never put image metadata on the shared root.
