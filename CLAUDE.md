# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
bundle install

# Start local dev server (http://localhost:4000)
bundle exec jekyll serve

# Build the site into _site/
bundle exec jekyll build
```

The `_site/` directory is generated output — never edit files there directly.

## Git

**Never `git commit` or `git add`/stage any changes without first asking the user for explicit permission**, even if a prior message in the session approved a commit — each commit needs its own ask. This overrides the default commit workflow.

## Architecture

This is a Jekyll static site (personal portfolio + blog) for Ashutosh Shukla, deployed to GitHub Pages at `ashutoshshuklaUT.github.io`.

**Layout hierarchy:**
- `_layouts/default.html` — master shell: header, nav, footer, and the dark-mode toggle (JS reads/writes `localStorage` and flips `data-theme` on `<html>`). All other layouts extend this.
- `_layouts/post.html` — wraps individual blog posts inside `default`.
- `_layouts/page.html` — wraps static pages inside `default`.

**Styling (`assets/css/main.scss`):**  
Imports Minima as a base, then overrides everything with CSS custom properties. All colors are defined as `--variable` tokens in two blocks: `:root, [data-theme="light"]` and `[data-theme="dark"]`. To change the color scheme, edit those token blocks — don't hardcode colors elsewhere.

**Content files:**
- `index.markdown` — homepage bio, uses the `default` layout directly (not `page`).
- `blog/index.html` — blog listing page, uses `jekyll-paginate` (`paginator.posts`).
- `_posts/` — blog posts; filename must follow Jekyll convention `YYYY-MM-DD-title.md`, front matter needs `layout: post` (set by default in `_config.yml`).

**Plugins (configured in `_config.yml` and `Gemfile`):**  
`jekyll-feed`, `jekyll-seo-tag`, `jekyll-sitemap`, `jekyll-paginate`. The `{% seo %}` tag in `default.html` handles meta tags automatically from `_config.yml` fields.

**Blog pagination:** Set to 5 posts per page in `_config.yml` (`paginate: 5`). Posts live at `/blog/:year/:month/:day/:title/` by permalink default.
