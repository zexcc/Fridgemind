
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
      const getNutrient = number => {
        const item = (food.foodNutrients || []).find(
          n => String(n.nutrientNumber) === String(number)
        );
        return item ? item.value : null;
      };

      return {
        fdcId: food.fdcId,
        name: food.description,
        category: food.foodCategory || "",
        calories: getNutrient("208"),
        protein: getNutrient("203"),
        carbs: getNutrient("205"),
        fat: getNutrient("204"),
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
