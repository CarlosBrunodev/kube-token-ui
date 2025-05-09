import { NextRequest, NextResponse } from "next/server";
import { Gauge, register } from "prom-client";

const tokens: { token: string; user: string; exp: number }[] = [];

const expirationGauge = new Gauge({
  name: "kubeconfig_token_expiration_timestamp",
  help: "Expiration timestamp of the kubeconfig token",
  labelNames: ["user"] as const,
});

const expirationInfo = new Gauge({
  name: "kubeconfig_token_expiration_info",
  help: "Human-readable expiration time of the kubeconfig token",
  labelNames: ["user", "expiration_time"] as const,
});

function decodeToken(token: string): { exp: number; user: string } | null {
  try {
    const payload = token.split(".")[1];
    const decoded = Buffer.from(payload, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded);
    return { exp: parsed.exp, user: parsed.sub || "unknown" };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const decoded = decodeToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Failed to decode token" }, { status: 400 });
  }

  tokens.push({ token, user: decoded.user, exp: decoded.exp });

  expirationGauge.labels(decoded.user).set(decoded.exp);
  expirationInfo.labels(decoded.user, new Date(decoded.exp * 1000).toISOString()).set(1);

  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json(tokens);
}