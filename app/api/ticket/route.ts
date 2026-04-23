import { DISCORD_INVITE_URL } from "@/lib/site";
import { getSessionFromRequest } from "@/lib/auth";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(request: Request) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return Response.json(
        {
          error: "Login required",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const turnstileToken =
      typeof body.turnstileToken === "string" ? body.turnstileToken : "";
    const verified = await verifyTurnstileToken(turnstileToken, request);

    if (!verified) {
      return Response.json(
        {
          error: "Bot detected",
        },
        { status: 403 }
      );
    }

    return Response.json({
      success: true,
      url: DISCORD_INVITE_URL,
    });
  } catch (error) {
    console.error("Ticket route failed:", error);

    return Response.json(
      {
        error: "Unable to open support right now.",
      },
      { status: 500 }
    );
  }
}
