import { ApiResponse } from "../types";

function tryParseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

/**
 * Fallback request dispatcher for static hosting environments (such as Netlify, Vercel, GitHub Pages)
 * where the Node Express server (/api/proxy) is not present.
 */
export async function dispatchClientSideRequest(
  url: string,
  method: string,
  headers: Record<string, string>,
  body: any
): Promise<ApiResponse> {
  const startTime = performance.now();

  let targetUrl = url.trim();
  let pathname = "";

  try {
    if (targetUrl.startsWith("/")) {
      pathname = targetUrl;
    } else if (targetUrl.startsWith("http://") || targetUrl.startsWith("https://")) {
      const parsed = new URL(targetUrl);
      pathname = parsed.pathname;
    } else {
      pathname = targetUrl;
    }
  } catch (e) {
    pathname = targetUrl;
  }

  // 1. Check if the request is targeting built-in Mock API Endpoints
  if (pathname.includes("/api/v1/auth/login") || pathname.endsWith("/auth/login")) {
    const durationMs = Math.round(performance.now() - startTime);
    const parsedBody = typeof body === "string" ? tryParseJson(body) : body;
    const username = parsedBody?.username || "admin_user";

    const responseBody = {
      status: "success",
      data: {
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ODQ5MjAsInVzZXJuYW1lIjoiYWRtaW5fdXNlciIsInJvbGVzIjpbImFkbWluIiwiZWRpdG9yIl0sImV4cCI6MTc2MDAwMDAwMH0.signature_abc123xyz",
        expires_in: 3600,
        user: {
          id: 84920,
          username: username,
          roles: ["admin", "editor"],
          is_active: true,
        },
      },
    };

    return {
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: responseBody,
      time: Math.max(durationMs, 20),
      size: JSON.stringify(responseBody).length,
    };
  }

  if (pathname.includes("/api/v1/users/profile") || pathname.endsWith("/users/profile")) {
    const durationMs = Math.round(performance.now() - startTime);
    const hasAuth = !!headers["authorization"] || !!headers["Authorization"] || !!headers["authorization".toLowerCase()];

    const responseBody = {
      status: "success",
      data: {
        id: 84920,
        username: "admin_user",
        email: "admin@example.com",
        profile: {
          first_name: "Admin",
          last_name: "User",
          avatar_url:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
        },
        organization: "Vox Tecnologia",
        authorization_verified: hasAuth,
        created_at: "2026-01-15T08:00:00Z",
      },
    };

    return {
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: responseBody,
      time: Math.max(durationMs, 18),
      size: JSON.stringify(responseBody).length,
    };
  }

  if (pathname.includes("/api/v1/users/settings") || pathname.endsWith("/users/settings")) {
    const durationMs = Math.round(performance.now() - startTime);
    const parsedBody = typeof body === "string" ? tryParseJson(body) : body;

    const responseBody = {
      status: "success",
      message: "Settings updated successfully",
      data: {
        theme: parsedBody?.theme || "dark",
        notifications: parsedBody?.notifications || { email: true, push: false },
        updated_at: new Date().toISOString(),
      },
    };

    return {
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: responseBody,
      time: Math.max(durationMs, 25),
      size: JSON.stringify(responseBody).length,
    };
  }

  if (pathname.includes("/api/v1/sessions/current") || pathname.endsWith("/sessions/current")) {
    const durationMs = Math.round(performance.now() - startTime);

    const responseBody = {
      status: "success",
      message: "Current session terminated successfully",
      session_id: "sess_99382104821",
    };

    return {
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: responseBody,
      time: Math.max(durationMs, 15),
      size: JSON.stringify(responseBody).length,
    };
  }

  // 2. Direct browser fetch for external APIs
  try {
    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: { ...headers },
    };

    if (["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase()) && body !== undefined) {
      if (typeof body === "object" && body !== null) {
        fetchOptions.body = JSON.stringify(body);
        if (!fetchOptions.headers["Content-Type"] && !fetchOptions.headers["content-type"]) {
          (fetchOptions.headers as any)["Content-Type"] = "application/json";
        }
      } else {
        fetchOptions.body = String(body);
      }
    }

    const response = await fetch(targetUrl, fetchOptions);
    const durationMs = Math.round(performance.now() - startTime);

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((val, key) => {
      responseHeaders[key] = val;
    });

    let responseBody: any;
    const contentType = response.headers.get("content-type") || "";
    const responseText = await response.text();

    if (contentType.includes("application/json")) {
      try {
        responseBody = JSON.parse(responseText);
      } catch (e) {
        responseBody = responseText;
      }
    } else {
      responseBody = responseText;
    }

    return {
      status: response.status,
      statusText: response.statusText || (response.ok ? "OK" : "Error"),
      headers: responseHeaders,
      body: responseBody,
      time: durationMs,
      size: responseText.length,
    };
  } catch (err: any) {
    const durationMs = Math.round(performance.now() - startTime);
    return {
      status: 0,
      statusText: "Network Error",
      headers: {},
      body: {
        error: "Failed to dispatch request directly from browser",
        message: err.message || "Network or CORS request failed",
        tip: "When deployed to static hosts like Netlify, requests are sent directly from the browser. Ensure the target API permits CORS or test valid public URLs.",
      },
      time: durationMs,
      size: 0,
    };
  }
}
