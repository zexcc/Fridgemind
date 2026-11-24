
export async function onRequestPost({ request, env }) {
  try {
    if (!env.FDC_API_KEY) {
      return Response.json(
        { success: false, error: "Nutrition API key is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const query = String(body.query || "").trim();

    if (!query || query.length > 100) {
      return Response.json(
        { success: false, error: "Enter a food name to search." },
        { status: 400 }
      );
    }

    const url = new URL(
      "https://api.nal.usda.gov/fdc/v1/foods/search"
    );

    url.searchParams.set("api_key", env.FDC_API_KEY);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        pageSize: 5,
        dataType: ["Foundation", "SR Legacy"]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { success: false, error: "USDA nutrition search failed." },
        { status: 502 }
      );
    }

    const foods = (data.foods || []).map(food => {
      const getNutrient = (numbers, names) => {
  const nutrients = food.foodNutrients || [];

  let item = nutrients.find(n =>
    numbers.includes(String(n.nutrientNumber)) ||
    numbers.includes(String(n.nutrientId))
  );

  if (!item) {
    item = nutrients.find(n => {
      const name = String(n.nutrientName || '').toLowerCase();
      return names.some(term => name.includes(term));
    });
  }

  return item && item.value != null ? item.value : null;
};

      return {
        fdcId: food.fdcId,
        name: food.description,
        category: food.foodCategory || "",
        calories: getNutrient(["208", "1008", "2047", "2048"], ["energy"]),
        protein: getNutrient(["203", "1003"], ["protein"]),
        carbs: getNutrient(["205", "1005"], ["carbohydrate"]),
        fat: getNutrient(["204", "1004"], ["total lipid", "total fat"]),
        basis: "per 100 g",
        source: "USDA FoodData Central"
      };
    });

    return Response.json({ success: true, foods });

  } catch (error) {
    return Response.json(
      { success: false, error: "Unable to search nutrition data." },
      { status: 500 }
    );
  }
}
