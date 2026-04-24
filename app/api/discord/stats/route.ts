import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const inviteCode =
      process.env.DISCORD_INVITE_CODE ||
      process.env.NEXT_PUBLIC_DISCORD_INVITE_CODE ||
      "pending";

    const response = await fetch(
      `https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          members: null,
          online: null,
          error: "failed_to_fetch_discord_stats",
        },
        { status: 200 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      members: data.approximate_member_count ?? null,
      online: data.approximate_presence_count ?? null,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        members: null,
        online: null,
        error: "discord_stats_crashed",
      },
      { status: 200 }
    );
  }
}
