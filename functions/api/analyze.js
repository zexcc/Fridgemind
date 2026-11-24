
export async function onRequestPost({ request, env }) {
  try {
    if (!env.AI) {
      return Response.json(
        { error: "Workers AI binding AI is missing." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const image = body.image;

    if (typeof image !== "string") {
      return Response.json(
        { error: "Please upload a valid food image." },
        { status: 400 }
      );
    }

    const match = image.match(
      /^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/i
    );

    if (!match) {
      return Response.json(
        { error: "Use a JPG, PNG, or WebP image." },
        { status: 400 }
      );
    }

    const binary = atob(match[2]);

    if (binary.length > 10 * 1024 * 1024) {
      return Response.json(
        { error: "Image must be under 10 MB." },
        { status: 413 }
      );
    }

    const result = await env.AI.run(
      "@cf/meta/llama-3.2-11b-vision-instruct",
      {
        
prompt: `Analyze the food in this image for FridgeMind.

Return ONLY valid JSON. Do not use markdown or explanations.

Use this exact structure:
{
  "foods": [
    {
      "name": "Food name",
      "category": "Fruit, vegetable, meat, dairy, grain, or other",
      "visual_condition": "Fresh-looking, aging, or visibly spoiled",
      "visible_defects": [],
      "estimated_calories_per_100g": null,
      "estimated_protein_g_per_100g": null,
      "estimated_carbs_g_per_100g": null,
      "estimated_fat_g_per_100g": null,
      "storage_advice": "Storage recommendation",
      "estimated_shelf_life": "General estimate",
      "confidence": "High, medium, or low"
    }
  ],
  "overall_notes": [],
  "safety_warning": "A photo cannot establish food safety or detect invisible pathogens or toxins."
}

Rules:
- Identify only foods you can reasonably recognize.
- Use null for nutrition values you cannot reliably estimate.
- Do not invent exact expiry dates.
- Do not claim food is safe to eat.
- Describe only visible defects.
- If no food is recognizable, return an empty foods array.`,

        image: image,
        max_tokens: 500
      }
    );

    return Response.json({
      success: true,
      analysis: result
    });

  } catch (error) {
    console.error("FridgeMind AI error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Unknown Cloudflare AI error."
      },
      { status: 500 }
    );
  }
}
