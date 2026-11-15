// Fetch the available Munich districts from the backend.
export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      throw new Error("BACKEND_URL is not configured");
    }

    const url = new URL("/options/districts", backendUrl);

    const response = await fetch(url.toString(), {
      cache: "no-store",
    });

    if (!response.ok) {
      return Response.json(
        { error: "Could not load districts" },
        { status: response.status },
      );
    }

    const districts = await response.json();

    return Response.json(districts);
  } catch (error) {
    console.error("Failed to fetch districts:", error);

    return Response.json(
      { error: "Backend request failed" },
      { status: 500 },
    );
  }
}
