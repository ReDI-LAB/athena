export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(
      "https://athena-ja0e.onrender.com/estimations/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

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