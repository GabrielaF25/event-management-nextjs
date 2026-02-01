import type { NextApiHandler } from "next";
import { createMocks } from "node-mocks-http";

export async function runApi(
  handler: NextApiHandler,
  {
    method = "GET",
    query = {},
    body = {},
    headers = {},
  }: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    query?: Record<string, any>;
    body?: any;
    headers?: Record<string, string>;
  } = {}
) {
  const { req, res } = createMocks({
    method,
    query,
    body,
    headers,
  });

  await handler(req as any, res as any);

  const statusCode = res._getStatusCode();
  const data = res._getData();

  let json: any;
  try {
    json = JSON.parse(data);
  } catch {
    json = data;
  }

  return { statusCode, json };
}
