import { register } from "prom-client";

export async function GET() {
  const metrics = await register.metrics();
  return new Response(metrics, {
    headers: { "Content-Type": register.contentType },
  });
}