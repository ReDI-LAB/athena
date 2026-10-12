
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      throw new Error("BACKEND_URL is not configured");
    }

    const url = new URL("/estimations/", backendUrl);

    url.searchParams.set("category", body.category);
    url.searchParams.set("product_type", body.product_type);
    url.searchParams.set("repair_type", body.repair_type);

    if (body.postal_code) {
      url.searchParams.set("postal_code", body.postal_code);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    });

    // Check for backend errors before parsing JSON
    if (!response.ok) {
      return Response.json(
        { error: "Backend returned an error" },
        { status: response.status }
      );
    }

    const result = await response.json();

    return Response.json(result, {
      status: response.status,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Backend request failed" },
      { status: 500 }
    );
  }
}
