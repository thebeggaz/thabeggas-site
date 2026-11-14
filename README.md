# thabeggas-site

The Tha Beggas website, hosted on GitHub Pages. Plain HTML and CSS, no build step. Edit a page and push, and the site updates.

## Pages

| Path | Page |
| --- | --- |
| `index.html` | Home |
| `members/` | Members roster, with Crew / Producers / Team filter |
| `members/dragons-pitchfork/` | Member page template. Copy this folder for each new member page, then link the member's card in `members/index.html` |
| `house-of-traps/` | The House of Traps, the Begga Kung Fu arcade |
| `alms-bowl/` | The Alms Bowl, collectibles. Checkout happens on Bonfire, which can't be embedded |
| `404.html` | Not found page |

Shared styles live in `assets/css/site.css`. Logos are in `assets/img/`.

## Still to do

- **Mailing list.** The signup forms on Home and House of Traps have `action="#"`. Point them at a mailing list provider's form endpoint.
- **Bracketed placeholders.** Portraits, cover art, product photos, member roles, bios and Chapter 2/3 titles are marked like `[Portrait]`. Search the repo for `[` to find them.
- **The Alms Bowl products.** Each card links to the Bonfire store. Swap in product names, prices, photos and each product's own Bonfire link.
- **Games.** Chapter 1 links to its current page on the GRYSKLL site. Games can move into a `house-of-traps/` subfolder here once they're ready.

## Pointing thabeggas.com here

Do this only when the site is ready to replace the Squarespace one.

1. Settings > Pages > Custom domain: enter `thabeggas.com` and save. GitHub adds a `CNAME` file.
2. At the domain's DNS provider, add A records for `@` pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, and a CNAME for `www` pointing to `thebeggaz.github.io`.
3. Once DNS checks out, turn on Enforce HTTPS.
