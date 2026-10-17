# KainCheck Filipino food data and caution rules

Research checked 17 October 2026. This file records source findings, not clinical advice or a legal opinion about licensing.

## Ready-to-use bounded starter

`filipino-foods-verified.json` contains 24 stable entries: 17 exact, publicly checked PhilFCT reference variants and seven familiar recipe names with unverified nutrient fields deliberately set to `null`. Three of the 17 references have a missing nutrient. No whole database or FNRI image collection was downloaded.

All numeric nutrients are **per 100 g edible portion**, with `sodium` in mg, `sugar` and `protein` in g, and `kcal` in kcal. `servingGrams: 100` is the default calculation basis; it does not imply a standard serving, cup, roll, bowl or recommendation. Show a weight/portion confirmation and multiply each known value by `confirmedGrams / 100`. Preserve null, and label a daily aggregate as partial whenever any logged food lacks that nutrient.

The source reports label the underlying release **1 December 2019**. Their dynamic 2026 report generation dates do not establish a 2026 nutrient-data release. Match the exact record's preparation, edible portion and variant. Canned pork adobo with egg is not homemade adobo; plain boiled munggo is not ginisang munggo; plain sotanghon is not sotanghon guisado. Where no exact record was verified, the dataset makes no nutrient claim. Users can provide a package nutrition label or a complete recipe, or the interface may show a separately labeled AI estimate with uncertainty and no claim that it came from PhilFCT.

## Authoritative data source and permission gap

DOST-FNRI's [PhilFCT introduction](https://i.fnri.dost.gov.ph/fct/library) describes free access to data on 1,600 commonly consumed foods, including food descriptors and photos. Its [service page](https://i.fnri.dost.gov.ph/login/fct) describes search by English, Filipino, scientific or alternate names and downloadable individual food reports. A normal library Continue link redirects to the login flow, while bounded individual report URLs are publicly accessible/indexed. Some fetches time out. No documented public developer API or general bulk redistribution license was found on these pages.

The local JSON transcribes a small set of factual observations with food IDs and links. The app must not call this the complete FNRI database, imply FNRI endorsement, relabel report dates as a new release or copy FNRI photos by default. Confirm terms with the PhilFCT team before a bulk import or image reuse: the service page lists `fqss.nfrdd@fnri.dost.gov.ph`. Use separately licensed photos with their own credits; a photo of a dish can be illustrative and does not prove a specific recipe's nutrient composition.

## Sodium rules that are supportable

1. **Adult daily guidance:** WHO recommends adults consume **less than 2,000 mg sodium per day**, equivalent to less than 5 g salt. This is population guidance; children's needs differ. Sources: [WHO sodium intervention](https://www.who.int/tools/elena/interventions/sodium-cvd-adults), [WHO healthy diet](https://www.who.int/news-room/fact-sheets/detail/healthy-diet).
2. **Per-serving flag:** US FDA describes 20% Daily Value or more sodium per serving as high, and 5% or less as low. Its sodium DV is 2,300 mg, so these translate to **460 mg high** and **115 mg low** for a confirmed serving. Label this as an **FDA serving-level reference**, not a Philippines legal nutrient-content claim and not WHO's daily target. Source: [FDA Sodium in Your Diet](https://www.fda.gov/food/nutrition-education-resources-materials/sodium-your-diet).
3. Do not mark every dish eaten three times a day as unsafe. Calculate the actual selected portion and sodium, look at the day's logged total and completeness, and encourage variety. Example arithmetic: the exact FNRI hotdog reference is 698 mg/100 g; three 100 g portions would supply **2,094 mg sodium before other food**, above WHO's adult daily guide. A three-times warning should be conditional and show its arithmetic, not assert the food can never be eaten three times.
4. A supported message is: “This serving is about 698 mg sodium (high by the FDA serving reference). Three servings of this size would be about 2,094 mg before the rest of your food. Consider a smaller portion or a less salty next meal.”
5. With unknown sodium: “Sodium unavailable for this exact recipe. Confirm the label, soy sauce/patis, seasoning mix and broth before relying on a daily estimate.” Do not interpret missing sodium as low or zero.
6. A camera can suggest a visible food, but cannot measure hidden salt, seasoning, sugar, recipe quantities or edible mass. Confirm identity, preparation, weight and sauces; return “uncertain/not food” when needed. Avoid false precision and never present a visual estimate as a laboratory measurement.

## Sugar and balance

The starter contains **total sugars**. Do not compare its total-sugar grams directly with WHO's free-sugar allowance or FDA's added-sugar DV; these are different measures. In particular, whole banana's naturally occurring sugars should not trigger an “added sugar” warning. The [WHO healthy diet source](https://www.who.int/news-room/fact-sheets/detail/healthy-diet) distinguishes free sugars from whole-fruit sugars.

Use [DOST-FNRI Pinggang Pinoy](https://fnri.dost.gov.ph/index.php/programs-and-projects/news-and-announcement/183-fnri-dost-launches-pinggang-pinoy-for-different-population-groups) for meal balance: half the plate fruits/vegetables, one third Go foods such as rice and root crops, one sixth Grow foods such as fish, poultry, eggs or legumes. It has guidance for different population/physiological groups. Phrase this as a visual meal-balance guide, not a diagnosis or a universal calorie prescription. The [FNRI adult guide partnership article](https://www.fnri.dost.gov.ph/index.php/programs-and-projects/news-and-announcement/185-fnri-dost-and-unilever-philippines-partner-in-promoting-pinggang-pinoy-for-adults) also recommends more vegetables than fruit within the Glow half.

## Practical next expansion

- Ask FNRI for permitted bulk/API access and photo terms before importing all records.
- Keep each imported record's source ID, exact English/Filipino names, preparation and nutrient release separately from last checked date.
- Add current branded labels for products where sodium varies; record package serving size, barcode, label date and image provenance.
- Add a registered nutritionist-dietitian reviewed recipe collection for adobo, tinola, sinigang, sisig and regional dishes with ingredient weights, cooked yield, edible portion and optional sauce/broth. Ingredient-calculated estimates should be labeled as such and should not silently inherit the title “FNRI verified.”
- Make AI identification and nutrition lookup separate operations: suggested food match -> user confirms variant/portion -> deterministic nutrient lookup/calculation -> contextual caution. If a recipe record is unknown, display that gap instead of forcing a canned-food match.
