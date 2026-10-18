# Recipes

Personal recipe collection. Recipes start from online sources, then get adjusted over time while cooking — often with AI help. Every recipe is one Markdown file following the exact format below.

## Folders

| Folder | Contents |
|--------|----------|
| `bread/` | Bread and other yeasted/sourdough bakes |
| `breakfast/` | Breakfast dishes |
| `dinner/` | Main meals |
| `dessert/` | Desserts and sweet bakes |

## File naming and metadata

- **Filename**: lowercase kebab-case of the title, e.g. `dinner/beef-ragu.md`. No dates or prefixes in the repo.
- **When generating a recipe outside this repo** (e.g. a Claude chat download destined for `~/Downloads`): name it `recipe-<kebab-title>.md`, e.g. `recipe-beef-ragu.md`. The `recipe-` prefix marks it for intake.
- **`category` frontmatter field is mandatory**: one of `bread`, `breakfast`, `dinner`, `dessert`. It decides which folder the file lives in — the file is findable and fileable even if the filename gets mangled.
- No other file metadata (macOS tags, xattrs) — it doesn't survive GitHub. Everything lives in frontmatter.
- **Photos** (optional): live in `images/<recipe-slug>/`, lowercase kebab filenames, JPEG. Embed inline under the relevant method step with a relative path (`../images/<recipe-slug>/photo.jpg`) and a descriptive alt text.
  - **Strip all metadata** before committing — GPS location, camera, dates. The repo and site are public, and iPhone photos carry the home location.
  - **Max 400px on the long edge, JPEG quality 80, under 100KB each.**
  - `scripts/clean-images.sh` does all of this in place (needs `brew install exiftool`); run it on every new photo. The site build fails if any photo still has EXIF data.
- **`thumbnail` frontmatter field** (optional): the photo shown on recipe cards and at the top of the recipe page, as `../images/<recipe-slug>/photo.jpg`. Leave it out to fall back to the first photo in the file, or a category placeholder if there is none.

## Web app

`app/` is a phone-friendly web app over these files, deployed to GitHub Pages by `.github/workflows/pages.yml` on every push to `main`. `scripts/build.mjs` parses each recipe into `_site/recipes.json` (it relies on the template's section names and the Index descriptors below), and a service worker caches everything so it works offline once opened. On iPhone: open in Safari → Share → Add to Home Screen.

Preview locally: `npm install && npm run serve`, then open http://localhost:8080.

## Intake from Downloads

To file a downloaded recipe into this repo:

1. Find candidates: `.md` files in `~/Downloads` with a `recipe-` prefix or a `category:` frontmatter field.
2. Reformat to the template below if not already compliant.
3. Rename to kebab-case of the title (drop the `recipe-` prefix), move into the folder named by `category`.
   If it has a source URL, add its thumbnail (rule 10 below).
4. Add to the Index, commit, push, delete the Downloads copy.

## Instructions for AI

When creating or updating a recipe in this repo, follow these rules exactly:

1. **Use the template below** (also in [TEMPLATE.md](TEMPLATE.md)). Same sections, same order, no extra sections.
2. **At-a-glance line** directly under the title: `**Makes** … · **Total** … · **Active** …`.
3. **All quantities in grams**, in the Ingredients table. Where the source gives a spoon, count or ml amount, put that first and the grams in brackets: `2 tbsp (25g)`, `4 (~70g)`, `175ml (180g)`. Metric only: no cups, ounces, pounds, inches or °F.
4. **Restate grams inline and in bold in every method step** — never "add the sugar", always add the sugar (**150g**). The reader must never have to scroll back to the ingredients list. Where the table shows a spoon, count or ml amount, put it before the grams: 2 tbsp (**25g**) sugar.
5. **Method step format**: numbered, bold short action title with `· time`, then a blank line, then the description indented as part of the same list item. Fold doneness cues (foamy, doubled, internal temp) into the relevant step.
6. **Keep the original source URL** in the frontmatter if the recipe came from online.
7. **Tips section**: record any AI suggestions or techniques that were actually used.
8. **Adjustment Log**: when a recipe is changed, append a dated entry saying what changed and why. Never silently overwrite quantities without logging the change.
9. Put the file in the correct folder (`bread/`, `breakfast/`, `dinner/`, `dessert/`) and add it to the Index below.
10. **Thumbnail from the source link**: if the recipe came from a URL and has no `thumbnail` yet, take the recipe's main photo of the finished dish, save it as `images/<recipe-slug>/thumbnail.jpg`, run `scripts/clean-images.sh` on it, and set `thumbnail: ../images/<recipe-slug>/thumbnail.jpg`.
    - Start from the page's `og:image`, but check it: if it's a step shot, a comparison, or has text over it, use the recipe card's photo instead, following the page's link to the recipe itself if there is one (e.g. an article linking to its Tasty recipe).
    - Crop out logos, badges and text overlays.
    - Skip it if no page has a usable photo.

## Recipe template

```markdown
---
title: Recipe Name
category: bread | breakfast | dinner | dessert
source: https://original-recipe-url.com (or "own recipe")
servings: 4
tags: [tag1, tag2]
last_made: YYYY-MM-DD
thumbnail: ../images/recipe-name/photo.jpg (optional)
---

# Recipe Name

**Makes** 4 servings · **Total** 1 hr 30 · **Active** 20 min

Optional one-line intro: what this is, key trade-off, link to a variant.

## Ingredients

| Ingredient | Grams |
|------------|-------|
| Ingredient one | 500 |
| Ingredient two | 400 |
| Ingredient three | 10 |

## Method

1. **Short action title** · 10 min

   Description of the step. Every quantity restated inline and bolded — never "add the flour", always add the flour (**500g**).

2. **Next action** · 5 min

   Add ingredient three (**10g**). Include the doneness cue for the step where useful (foamy, doubled, 88–90°C internal).

## Tips

- Tips from AI or own notes that were actually used, one per bullet.

## Adjustment Log

- YYYY-MM-DD: what changed and why (e.g. salt 12g → 10g, 12 too salty).
```

## Index

<!-- Add a link here when adding a recipe, under its category -->

**Bread**

- [Brioche Burger Buns](bread/brioche-burger-buns.md) — proper version, overnight prove option
- [Fast Burger Buns](bread/brioche-burger-buns-fast.md) — 90-minute version
- [Butter Rolls](bread/butter-rolls.md) — soft Japanese-style rolls, freezable
- [Melon Pan](bread/melon-pan.md) — cookie-crust Japanese sweet bread, Kenwood-kneaded
- [New York-Style Bagels](bread/new-york-style-bagels.md) — same-day, boiled then baked, Kenwood-kneaded
- [Shokupan](bread/shokupan.md) — yudane milk bread, small loaf, Kenwood-kneaded

**Breakfast**

- [Classic Scones with Jam and Clotted Cream](breakfast/classic-scones-with-jam-and-clotted-cream.md) — quick, Kenwood-rubbed butter
- [Crêpes](breakfast/crepes.md) — double-cream batter, optional toppings
- [Gazpacho](breakfast/gazpacho.md) — cold Andalusian tomato soup, cucumber garnish

**Dinner**

- [Baked Camembert with Garlic Honey and Walnuts](dinner/baked-camembert-with-garlic-honey-and-walnuts.md) — sharing starter
- [Epic Chunky Beef and Mushroom Pie](dinner/epic-chunky-beef-and-mushroom-pie.md) — slow-cooked beef, porcini gravy, puff pastry lid
- [Honey Soy Baked Chicken Thighs](dinner/honey-soy-baked-chicken-thighs.md) — marinated, baked then broiled
- [Quick Peri Peri Marinade](dinner/quick-peri-peri-marinade.md) — for 1kg chicken or veg
- [Sicilian Prawn and Tomato Spaghetti](dinner/sicilian-prawn-and-tomato-spaghetti.md) — anchovy toast on the side
- [Tori-jaga](dinner/tori-jaga.md) — soy-braised chicken and potato, no mirin/sake

**Dessert**

- [Brown Butter Chocolate Chip Cookies](dessert/brown-butter-chocolate-chip-cookies.md) — half batch, coffee not milk
- [Brownies](dessert/brownies.md) — Tasty ultimate, 10-min egg beat + mid-bake drop
- [Grape Juice Ice Lollies](dessert/grape-juice-ice-lollies.md) — honey-softened, kid-friendly
- [Japanese Strawberry Cake](dessert/japanese-strawberry-cake.md) — water-bath sponge, whipped cream, optional gelatin
- [Nutmeg & Ginger Apple Snaps](dessert/nutmeg-ginger-apple-snaps.md) — Fantastic Mr Fox cookies, step photos
- [White Fig Clafoutis](dessert/white-fig-clafoutis.md) — all-milk custard bake
