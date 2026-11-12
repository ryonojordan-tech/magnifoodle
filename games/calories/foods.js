// Magnifoodle food data — calories per TYPICAL SERVING.
//
// Verified 2026-11-10:
//  - Generic foods: USDA FoodData Central, SR Legacy dataset. `fdcId` is the record;
//    kcal = energy per 100 g x the USDA portion weight in `serving`, rounded.
//    Look up any record at https://fdc.nal.usda.gov/food-details/<fdcId>/nutrients
//  - Branded items: the brand's own US website or the product's nutrition label.
//    Brand recipes change, so re-check these periodically.
//
// category controls the shape colour in the game.

const FOODS = [
  // Fast food & branded
  { name: "Big Mac", serving: "1 burger", kcal: 580, category: "fastfood", source: "mcdonalds.com (US)" },
  { name: "McDonald's fries", serving: "medium", kcal: 320, category: "fastfood", source: "mcdonalds.com (US)" },
  { name: "Glazed donut", serving: "1 Krispy Kreme Original", kcal: 190, category: "sweet", source: "krispykreme.com" },
  { name: "Snickers bar", serving: "1 regular bar (1.86 oz)", kcal: 250, category: "sweet", source: "Mars US label" },
  { name: "Coca-Cola", serving: "1 can (12 fl oz)", kcal: 140, category: "drink", source: "us.coca-cola.com" },
  { name: "Caffè latte", serving: "Starbucks grande, 2% milk", kcal: 190, category: "drink", source: "starbucks.com" },

  // Grains & bakery
  { name: "Plain bagel", serving: "1 medium (3.5–4\")", kcal: 277, category: "grain", source: "USDA", fdcId: 174899 },
  { name: "Croissant", serving: "1 medium (57 g)", kcal: 231, category: "grain", source: "USDA", fdcId: 174987 },
  { name: "White rice", serving: "1 cup cooked", kcal: 205, category: "grain", source: "USDA", fdcId: 168878 },
  { name: "Spaghetti", serving: "1 cup cooked, plain", kcal: 196, category: "grain", source: "USDA", fdcId: 169737 },
  { name: "White bread", serving: "1 slice (29 g)", kcal: 77, category: "grain", source: "USDA", fdcId: 174924 },

  // Fruit & veg
  { name: "Banana", serving: "1 medium", kcal: 105, category: "produce", source: "USDA", fdcId: 173944 },
  { name: "Apple", serving: "1 medium", kcal: 95, category: "produce", source: "USDA", fdcId: 171688 },
  { name: "Orange", serving: "1 medium", kcal: 62, category: "produce", source: "USDA", fdcId: 169097 },
  { name: "Avocado", serving: "1 whole (201 g)", kcal: 322, category: "produce", source: "USDA", fdcId: 171705 },
  { name: "Grapes", serving: "1 cup", kcal: 104, category: "produce", source: "USDA", fdcId: 174683 },
  { name: "Strawberries", serving: "1 cup, halved", kcal: 49, category: "produce", source: "USDA", fdcId: 167762 },
  { name: "Baked potato", serving: "1 medium, plain", kcal: 161, category: "produce", source: "USDA", fdcId: 170093 },
  { name: "Broccoli", serving: "1 cup, raw chopped", kcal: 31, category: "produce", source: "USDA", fdcId: 170379 },

  // Protein & dairy
  { name: "Egg", serving: "1 large", kcal: 72, category: "protein", source: "USDA", fdcId: 171287 },
  { name: "Chicken breast", serving: "3 oz, roasted, skinless", kcal: 140, category: "protein", source: "USDA", fdcId: 171477 },
  { name: "Almonds", serving: "1 oz (about 23 nuts)", kcal: 164, category: "protein", source: "USDA", fdcId: 170567 },
  { name: "Peanut butter", serving: "2 tablespoons", kcal: 191, category: "protein", source: "USDA", fdcId: 172470 },
  { name: "Cheddar cheese", serving: "1 oz", kcal: 115, category: "dairy", source: "USDA", fdcId: 170899 },
  { name: "Whole milk", serving: "1 cup", kcal: 149, category: "dairy", source: "USDA", fdcId: 171265 },
  { name: "Greek yogurt", serving: "170 g, plain nonfat", kcal: 100, category: "dairy", source: "USDA", fdcId: 170894 },

  // Fats & drinks
  { name: "Butter", serving: "1 tablespoon", kcal: 102, category: "fat", source: "USDA", fdcId: 173410 },
  { name: "Olive oil", serving: "1 tablespoon", kcal: 119, category: "fat", source: "USDA", fdcId: 171413 },
  { name: "Beer", serving: "1 can (12 fl oz), regular", kcal: 153, category: "drink", source: "USDA", fdcId: 168746 },
  { name: "Red wine", serving: "5 fl oz glass", kcal: 125, category: "drink", source: "USDA", fdcId: 173190 },

  // ===== Added 2026-11-10: restaurant menus (one item per food type) =====
  // McDonald's: mcdonalds.com US product pages
  { name: "Chicken McNuggets", serving: "10 pieces", kcal: 410, category: "fastfood", source: "mcdonalds.com (US)" },
  { name: "McChicken", serving: "1 sandwich", kcal: 390, category: "fastfood", source: "mcdonalds.com (US)" },
  { name: "Filet-O-Fish", serving: "1 sandwich", kcal: 380, category: "fastfood", source: "mcdonalds.com (US)" },
  { name: "Egg McMuffin", serving: "1 sandwich", kcal: 310, category: "fastfood", source: "mcdonalds.com (US)" },
  { name: "Hash browns", serving: "1 McDonald's hash brown", kcal: 140, category: "fastfood", source: "mcdonalds.com (US)" },
  { name: "Hotcakes", serving: "McDonald's, 3 with butter & syrup", kcal: 580, category: "fastfood", source: "mcdonalds.com (US)" },
  { name: "Apple pie", serving: "McDonald's Baked Apple Pie", kcal: 230, category: "sweet", source: "mcdonalds.com (US)" },
  { name: "Oreo McFlurry", serving: "regular", kcal: 410, category: "sweet", source: "mcdonalds.com (US)" },
  { name: "Chocolate shake", serving: "McDonald's, medium", kcal: 650, category: "drink", source: "mcdonalds.com (US)" },
  { name: "Vanilla cone", serving: "McDonald's soft serve", kcal: 200, category: "sweet", source: "mcdonalds.com (US)" },
  { name: "Fruit & Maple Oatmeal", serving: "McDonald's", kcal: 320, category: "grain", source: "mcdonalds.com (US)" },
  { name: "BBQ sauce", serving: "McDonald's Tangy Barbeque, 1 cup", kcal: 45, category: "fastfood", source: "mcdonalds.com (US)" },
  // Taco Bell: tacobell.com product pages
  { name: "Crunchy Taco", serving: "Taco Bell", kcal: 170, category: "fastfood", source: "tacobell.com" },
  { name: "Bean Burrito", serving: "Taco Bell", kcal: 360, category: "fastfood", source: "tacobell.com" },
  { name: "Chicken Quesadilla", serving: "Taco Bell", kcal: 490, category: "fastfood", source: "tacobell.com" },
  { name: "Crunchwrap Supreme", serving: "Taco Bell", kcal: 530, category: "fastfood", source: "tacobell.com" },
  { name: "Nachos BellGrande", serving: "Taco Bell", kcal: 730, category: "fastfood", source: "tacobell.com" },
  { name: "Baja Blast", serving: "Taco Bell, large", kcal: 410, category: "drink", source: "tacobell.com" },
  { name: "Cinnamon Twists", serving: "Taco Bell", kcal: 170, category: "sweet", source: "tacobell.com" },
  // Costco food court: Costco posts calories on warehouse menu boards, not online.
  // Figures are the menu-board numbers as reported consistently by multiple outlets (2025–26).
  { name: "Costco pizza", serving: "1 cheese slice, food court", kcal: 710, category: "fastfood", source: "Costco menu board (reported)" },
  { name: "Costco cookie", serving: "Double chocolate chunk, food court", kcal: 750, category: "sweet", source: "Costco menu board (reported)" },
  { name: "Chicken Bake", serving: "Costco food court", kcal: 840, category: "fastfood", source: "Costco menu board (reported)" },
  { name: "Costco hot dog", serving: "1/4 lb, with bun", kcal: 580, category: "fastfood", source: "Costco menu board (reported)" },
  // Subway: US nutrition PDF (Jan 2026)
  { name: "Italian B.M.T.", serving: "Subway 6-inch", kcal: 610, category: "fastfood", source: "Subway US nutrition PDF (Jan 2026)" },

  // ===== Added 2026-11-10: USDA FoodData Central (SR Legacy unless noted FNDDS) =====
  // Protein
  { name: "Sirloin steak", serving: "3 oz, broiled", kcal: 186, category: "protein", source: "USDA", fdcId: 169458 },
  { name: "Salmon", serving: "3 oz, cooked", kcal: 175, category: "protein", source: "USDA", fdcId: 175168 },
  { name: "Shrimp", serving: "3 oz, cooked", kcal: 84, category: "protein", source: "USDA", fdcId: 175180 },
  { name: "Bacon", serving: "3 slices, pan-fried", kcal: 161, category: "protein", source: "USDA", fdcId: 168322 },
  { name: "Sausage links", serving: "2 pork links", kcal: 150, category: "protein", source: "USDA", fdcId: 174578 },
  { name: "Ham", serving: "2 slices (56 g)", kcal: 92, category: "protein", source: "USDA", fdcId: 173864 },
  { name: "Pork chop", serving: "1 chop, broiled", kcal: 328, category: "protein", source: "USDA", fdcId: 167827 },
  { name: "Tofu", serving: "1/2 cup, firm", kcal: 98, category: "protein", source: "USDA", fdcId: 172448 },
  { name: "Beef jerky", serving: "1 oz", kcal: 116, category: "protein", source: "USDA", fdcId: 167536 },
  { name: "Chicken wings", serving: "3 fried wings", kcal: 476, category: "protein", source: "USDA", fdcId: 173628 },
  { name: "Meatballs", serving: "3 Italian-style", kcal: 160, category: "protein", source: "USDA", fdcId: 171638 },
  // Vegetables
  { name: "Carrot", serving: "1 medium", kcal: 25, category: "produce", source: "USDA", fdcId: 170393 },
  { name: "Corn on the cob", serving: "1 medium ear", kcal: 99, category: "produce", source: "USDA", fdcId: 169999 },
  { name: "Sweet potato", serving: "1 medium, baked", kcal: 103, category: "produce", source: "USDA", fdcId: 168483 },
  { name: "Tomato", serving: "1 medium", kcal: 22, category: "produce", source: "USDA", fdcId: 170457 },
  { name: "Red bell pepper", serving: "1 medium", kcal: 31, category: "produce", source: "USDA", fdcId: 170108 },
  { name: "Cucumber", serving: "1 whole (8\")", kcal: 45, category: "produce", source: "USDA", fdcId: 168409 },
  { name: "Onion", serving: "1 medium", kcal: 44, category: "produce", source: "USDA", fdcId: 170000 },
  { name: "Peas", serving: "1/2 cup, cooked", kcal: 62, category: "produce", source: "USDA", fdcId: 170017 },
  { name: "Green beans", serving: "1 cup, cooked", kcal: 44, category: "produce", source: "USDA", fdcId: 169141 },
  { name: "Edamame", serving: "1 cup", kcal: 188, category: "produce", source: "USDA", fdcId: 168411 },
  // Fruit
  { name: "Watermelon", serving: "1 wedge (1/16 melon)", kcal: 86, category: "produce", source: "USDA", fdcId: 167765 },
  { name: "Pineapple", serving: "1 slice (4.7\" wide)", kcal: 83, category: "produce", source: "USDA", fdcId: 169124 },
  { name: "Mango", serving: "1 whole", kcal: 202, category: "produce", source: "USDA", fdcId: 169910 },
  { name: "Blueberries", serving: "1 cup", kcal: 84, category: "produce", source: "USDA", fdcId: 171711 },
  { name: "Cherries", serving: "1 cup", kcal: 87, category: "produce", source: "USDA", fdcId: 171719 },
  { name: "Peach", serving: "1 medium", kcal: 59, category: "produce", source: "USDA", fdcId: 169928 },
  { name: "Pear", serving: "1 medium", kcal: 101, category: "produce", source: "USDA", fdcId: 169118 },
  { name: "Kiwi", serving: "1 fruit", kcal: 42, category: "produce", source: "USDA", fdcId: 168153 },
  { name: "Lemon", serving: "1 fruit", kcal: 17, category: "produce", source: "USDA", fdcId: 167746 },
  { name: "Raisins", serving: "1 small box (1.5 oz)", kcal: 129, category: "produce", source: "USDA", fdcId: 168165 },
  { name: "Medjool date", serving: "1 pitted", kcal: 66, category: "produce", source: "USDA", fdcId: 168191 },
  { name: "Plum", serving: "1 fruit", kcal: 30, category: "produce", source: "USDA", fdcId: 169949 },
  { name: "Olives", serving: "10 large, black", kcal: 51, category: "produce", source: "USDA", fdcId: 169094 },
  { name: "Coconut", serving: "1 piece (2\" x 2\")", kcal: 159, category: "produce", source: "USDA", fdcId: 170169 },
  // Grains & bakery
  { name: "Waffle", serving: "1 frozen, toasted", kcal: 103, category: "grain", source: "USDA", fdcId: 175048 },
  { name: "Biscuit", serving: "1 (2.25\" wide)", kcal: 67, category: "grain", source: "USDA", fdcId: 174905 },
  { name: "Cheerios", serving: "1 cup, dry", kcal: 104, category: "grain", source: "USDA", fdcId: 173884 },
  { name: "Quinoa", serving: "1 cup, cooked", kcal: 222, category: "grain", source: "USDA", fdcId: 168917 },
  { name: "Cornbread", serving: "1 piece", kcal: 198, category: "grain", source: "USDA", fdcId: 174909 },
  { name: "Blueberry muffin", serving: "1 medium", kcal: 424, category: "grain", source: "USDA", fdcId: 172765 },
  { name: "Pita bread", serving: "1 large (6.5\")", kcal: 165, category: "grain", source: "USDA", fdcId: 174915 },
  { name: "Saltine crackers", serving: "5 crackers", kcal: 63, category: "grain", source: "USDA", fdcId: 172746 },
  { name: "Soft pretzel", serving: "1 medium", kcal: 389, category: "grain", source: "USDA", fdcId: 169064 },
  // Snacks
  { name: "Popcorn", serving: "3 cups, air-popped", kcal: 93, category: "grain", source: "USDA", fdcId: 167959 },
  { name: "Potato chips", serving: "1 oz (about 22 chips)", kcal: 149, category: "grain", source: "USDA", fdcId: 169677 },
  { name: "Granola bar", serving: "1 bar (25 g)", kcal: 118, category: "grain", source: "USDA", fdcId: 167542 },
  { name: "Rice cake", serving: "1 cake", kcal: 35, category: "grain", source: "USDA", fdcId: 170250 },
  { name: "Trail mix", serving: "1 oz", kcal: 131, category: "protein", source: "USDA", fdcId: 167561 },
  { name: "Hummus", serving: "2 tablespoons", kcal: 71, category: "protein", source: "USDA", fdcId: 174289 },
  // Sweets
  { name: "Chocolate cake", serving: "1 slice (64 g)", kcal: 249, category: "sweet", source: "USDA", fdcId: 174934 },
  { name: "Brownie", serving: "1 large square", kcal: 227, category: "sweet", source: "USDA", fdcId: 172713 },
  { name: "Cheesecake", serving: "1 slice (1/6 of 17 oz cake)", kcal: 257, category: "sweet", source: "USDA", fdcId: 172711 },
  { name: "Cinnamon roll", serving: "1 large", kcal: 309, category: "sweet", source: "USDA", fdcId: 175034 },
  { name: "Gummy bears", serving: "20 bears", kcal: 174, category: "sweet", source: "USDA", fdcId: 167989 },
  { name: "Chocolate pudding", serving: "1 cup (4 oz)", kcal: 153, category: "sweet", source: "USDA", fdcId: 168778 },
  { name: "Honey", serving: "1 tablespoon", kcal: 64, category: "sweet", source: "USDA", fdcId: 169640 },
  { name: "Marshmallows", serving: "1 cup, mini", kcal: 159, category: "sweet", source: "USDA", fdcId: 167995 },
  { name: "Ice pop", serving: "1 pop (1.75 fl oz)", kcal: 41, category: "sweet", source: "USDA", fdcId: 168813 },
  // Drinks
  { name: "Orange juice", serving: "1 cup", kcal: 112, category: "drink", source: "USDA", fdcId: 169098 },
  { name: "Hot cocoa", serving: "1 cup, homemade", kcal: 193, category: "drink", source: "USDA", fdcId: 171277 },
  { name: "Lemonade", serving: "1 cup", kcal: 99, category: "drink", source: "USDA", fdcId: 173217 },
  { name: "Sports drink", serving: "20 fl oz bottle", kcal: 161, category: "drink", source: "USDA FNDDS", fdcId: 2710769 },
  { name: "Sweet tea", serving: "1 cup, with lemon", kcal: 122, category: "drink", source: "USDA", fdcId: 171888 },
  { name: "Energy drink", serving: "1 can (8.4 fl oz)", kcal: 111, category: "drink", source: "USDA", fdcId: 173210 },
  // Dishes
  { name: "Mac and cheese", serving: "1 cup", kcal: 513, category: "grain", source: "USDA FNDDS", fdcId: 2708811 },
  { name: "Lasagna", serving: "1 piece (1/6 of 8\" pan)", kcal: 286, category: "grain", source: "USDA FNDDS", fdcId: 2708750 },
  { name: "Instant ramen", serving: "1 cup container, prepared", kcal: 290, category: "grain", source: "USDA FNDDS", fdcId: 2709152 },
  { name: "California roll", serving: "6 pieces", kcal: 169, category: "grain", source: "USDA FNDDS", fdcId: 2708961 },
  { name: "Pot stickers", serving: "4 fried (veggie)", kcal: 192, category: "grain", source: "USDA FNDDS", fdcId: 2708706 },
  { name: "Egg roll", serving: "1 roll, pork/beef", kcal: 174, category: "fastfood", source: "USDA FNDDS", fdcId: 2708702 },
  { name: "Chili", serving: "1 cup, with beans", kcal: 259, category: "protein", source: "USDA", fdcId: 172097 },
  { name: "Chicken noodle soup", serving: "1 cup", kcal: 130, category: "protein", source: "USDA FNDDS", fdcId: 2709149 },
  { name: "Grilled cheese", serving: "1 sandwich, cheddar on white", kcal: 427, category: "grain", source: "USDA FNDDS", fdcId: 2705804 },
  { name: "Falafel", serving: "3 patties", kcal: 262, category: "protein", source: "USDA FNDDS", fdcId: 2707408 },
  { name: "Tamale", serving: "1 beef tamale", kcal: 244, category: "grain", source: "USDA FNDDS", fdcId: 2708571 },
  { name: "Chicken pot pie", serving: "1 individual pie", kcal: 638, category: "grain", source: "USDA FNDDS", fdcId: 2706703 },
  { name: "Meatloaf", serving: "1 medium slice", kcal: 215, category: "protein", source: "USDA FNDDS", fdcId: 2706499 },
  { name: "Coleslaw", serving: "1 side container", kcal: 176, category: "produce", source: "USDA FNDDS", fdcId: 2709815 },
];

const CATEGORY_COLORS = {
  fastfood: "#e8604c",
  sweet:    "#d96ba8",
  drink:    "#4a90d9",
  grain:    "#e0a43a",
  produce:  "#5bb36a",
  protein:  "#a0703f",
  dairy:    "#8f8bd9",
  fat:      "#c9b23a",
};
