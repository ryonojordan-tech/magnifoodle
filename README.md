# Magnifoodle

A collection of daily food guessing games, inspired by Magnitudle.

## Play

Open `index.html` (the landing page) in a browser, or serve the folder locally:

```
python -m http.server 8000
```

Then visit http://localhost:8000.

## Layout

```
magnifoodle/
├── index.html        landing page: the list of games lives in the GAMES array
├── home.css          landing page styling
└── games/
    └── calories/     Calorie Size-Up
```

### Adding a game

1. Create `games/<name>/index.html`. Add a back link to `../../index.html`.
2. Add an entry to the `GAMES` array in the root `index.html`: title, href, description, icon and color.
3. Remove one of the `comingSoon` placeholder entries.
4. Use a localStorage key prefix unique to your game, so saved progress doesn't collide.

## Calorie Climb (`games/climb/`)

This is a daily higher-or-lower streak game, and it reuses Calorie Size-Up's foods and shapes (`../calories/foods.js`, `shapes.js`, `shapes-extra.js`).

- Each day, every food is shuffled into a shared order seeded by the date, and two equal-calorie foods never come up back to back. Each player gets one attempt per day.
- The current food shows its calories. The next food is a grey "?" silhouette until you guess. It's then revealed in colour, growing to its true size: area is proportional to calories, on one scale for every food.
- The run ends on your first miss. A perfect run goes through all 133 foods.
- Progress is saved under `climb-YYYY-MM-DD`, and the best streak under `climb-best`. Testing: `?date=YYYY-MM-DD`.
- The end screen has a recap of the run, the best streak, and Share / Copy result.

## Calorie Size-Up (`games/calories/`)

Each day you get 5 rounds. You see two foods, and **neither shows its calories**. You resize the target food until its **area**, relative to the reference food, matches its calories. When you lock in, both calorie counts are shown, along with a blue silhouette of the true size. The calories are per typical serving.

- Slider, −/+ buttons, mouse wheel over the picture, or arrow keys resize the food.
- Enter locks in and moves to the next round.
- Progress is saved per day in the browser's localStorage, under keys `magnifoodle-YYYY-MM-DD`.
- Testing: `games/calories/index.html?date=2026-12-01` loads another day's puzzle.

### Scoring

Error is measured as a ratio, so 2× too big and 2× too small cost the same.

| Guess vs actual   | Points |
|-------------------|--------|
| within 5%         | 100    |
| 1.41× off         | 75     |
| 2× off            | 50     |
| 4× off or worse   | 0      |

### Files

- `foods.js` holds the food list and calories. Add foods here.
- `shapes.js` holds a vector silhouette for each food, keyed by its exact name and drawn as SVG paths in a 100×100 box. When the game loads, it measures each shape's real filled area, so thin shapes like the banana are scaled as fairly as round ones. A food with no shape falls back to a circle.
- `shapes-extra.js` holds the silhouettes for the 100 foods added on 2026-11-10. It's merged into `SHAPES`, and every food has its own distinct shape.
- `game.js` holds the game logic, the daily seeding and the scoring.
- `index.html` and `styles.css` hold the page and its styling.

### Data caveat

These values were verified on 2026-11-10.

- **Generic foods:** USDA FoodData Central (SR Legacy). Each entry has its `fdcId`, and the calories are the energy per 100 g × the USDA portion weight for the stated serving.
- **Branded items:** the brand's US website (McDonald's, Krispy Kreme, Coca-Cola, Starbucks) or the product label (Snickers, Oreo). Recipes change, so re-check these from time to time.
