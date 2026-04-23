type TurnstileVerificationResult = {
  "error-codes"?: string[];
  success?: boolean;
};

export function getRequestIp(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null
  );
}

export async function verifyTurnstileToken(
  turnstileToken: string | null | undefined,
  request: Request
) {
  if (!turnstileToken || !process.env.TURNSTILE_SECRET_KEY) {
    return false;
  }

  const verify = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
        remoteip: getRequestIp(request),
      }),
      cache: "no-store",
    }
  );

  if (!verify.ok) {
    return false;
  }

  const data = (await verify.json()) as TurnstileVerificationResult;
  return Boolean(data.success);
}
