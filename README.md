# FCAI - SOFRA

## How to Run

### With backend (recommended — allows adding recipes permanently)
```bash
node server.js
```
Then open: http://localhost:3000

### Without backend (open HTML files directly)
Open `homepage.html` directly in your browser.
Recipes added by admin will be stored in localStorage only (not in `recipes.json`).

## File Structure
- `server.js`     — Minimal Node.js server (no npm install needed)
- `recipes.json`  — Single source of truth for all recipes
- `recipeInfo.html` — Template page for any recipe (loaded by ID from JSON)
- `recList.html`  — All recipes page
- `favorites.html` — User favorites page
- `admin_add.html` — Add/edit recipe (admin only)
- `admin_recipes.html` — Admin dashboard

## API (when server is running)
- `GET  /api/recipes`       — Get all recipes
- `POST /api/recipes`       — Add or update a recipe (appended to recipes.json)
- `DELETE /api/recipes/:id` — Delete a recipe from recipes.json
