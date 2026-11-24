
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
        prompt: `Analyze this food image for FridgeMind.

Identify:
1. Food items visible.
2. Estimated quantity, only if reasonably visible.
3. Visible mold, discoloration, bruising or damage.
4. Whether freshness is uncertain.
5. Limitations of the image.

Return a concise JSON object with:
foods (array of objects with name and estimated_quantity),
visible_issues (array),
freshness_observation,
confidence (low, medium or high),
limitations.

Do not claim food is safe to eat.
Never infer invisible bacteria, toxins or pathogens.
Do not invent expiry dates or nutritional values.`,
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
