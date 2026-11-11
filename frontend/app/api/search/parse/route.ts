
export async function GET(request: Request) {
  try {
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      throw new Error("BACKEND_URL is not configured");
    }

    const requestUrl = new URL(request.url);
    const query = requestUrl.searchParams.get("q");

    if (!query?.trim()) {
      return Response.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const url = new URL("/search/parse", backendUrl);
    url.searchParams.set("q", query.trim());

    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return Response.json(
        { error: "Search parser returned an error" },
        { status: response.status }
      );
    }

    const result = await response.json();

    return Response.json(result);
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Search parsing failed" },
      { status: 500 }
    );
  }
}
