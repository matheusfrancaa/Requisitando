const fetch = globalThis.fetch;

exports.handler = async function (event, context) {
  // Always include CORS headers so the browser client can communicate seamlessly
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Content-Type": "application/json",
  };

  // Handle CORS preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  const path = event.path || "";

  // Helper for mock responses
  function mockResponse(statusCode, data) {
    return {
      statusCode,
      headers: corsHeaders,
      body: JSON.stringify(data),
    };
  }

  // Handle direct calls to Mock Endpoints on Netlify
  if (path.includes("/api/v1/auth/login") || path.endsWith("/auth/login")) {
    let bodyObj = {};
    try {
      bodyObj = JSON.parse(event.body || "{}");
    } catch (e) {}

    if (!bodyObj.username || !bodyObj.password) {
      return mockResponse(400, {
        status: "error",
        message: "Bad Request: Missing username or password",
      });
    }

    return mockResponse(200, {
      status: "success",
      data: {
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ODQ5MjAsInVzZXJuYW1lIjoiYWRtaW5fdXNlciIsInJvbGVzIjpbImFkbWluIiwiZWRpdG9yIl0sImV4cCI6MTc2MDAwMDAwMH0.signature_abc123xyz",
        expires_in: 3600,
        user: {
          id: 84920,
          username: bodyObj.username || "admin_user",
          roles: ["admin", "editor"],
          is_active: true,
        },
      },
    });
  }

  if (path.includes("/api/v1/users/profile") || path.endsWith("/users/profile")) {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    return mockResponse(200, {
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
        authorization_verified: !!authHeader,
        created_at: "2026-01-15T08:00:00Z",
      },
    });
  }

  if (path.includes("/api/v1/users/settings") || path.endsWith("/users/settings")) {
    let bodyObj = {};
    try {
      bodyObj = JSON.parse(event.body || "{}");
    } catch (e) {}

    return mockResponse(200, {
      status: "success",
      message: "Settings updated successfully",
      data: {
        theme: bodyObj.theme || "dark",
        notifications: {
          email: bodyObj.notifications?.email !== false,
          push: bodyObj.notifications?.push === true,
        },
        updated_at: new Date().toISOString(),
      },
    });
  }

  if (path.includes("/api/v1/sessions/current") || path.endsWith("/sessions/current")) {
    return mockResponse(200, {
      status: "success",
      message: "Session terminated successfully",
      data: {
        session_id: "sess_98234ab109f",
        terminated_at: new Date().toISOString(),
      },
    });
  }

  // --- PROXY HANDLER FOR EXTERNAL APIS AND MOCK URLS ---
  try {
    let payload = {};
    try {
      payload = JSON.parse(event.body || "{}");
    } catch (e) {
      payload = {};
    }

    const { url, method = "GET", headers: reqHeaders = {}, body: reqBody } = payload;

    if (!url) {
      return mockResponse(400, { error: "URL is required" });
    }

    let targetUrl = String(url).trim();

    // Check if targetUrl is one of the mock endpoints
    if (
      targetUrl.includes("/api/v1/auth/login") ||
      targetUrl.includes("/api/v1/users/profile") ||
      targetUrl.includes("/api/v1/users/settings") ||
      targetUrl.includes("/api/v1/sessions/current")
    ) {
      if (targetUrl.includes("/auth/login")) {
        let b = reqBody || {};
        if (typeof b === "string") {
          try {
            b = JSON.parse(b);
          } catch (e) {}
        }
        return mockResponse(200, {
          status: "success",
          data: {
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.signature_abc123xyz",
            user: { id: 84920, username: b.username || "admin_user" },
          },
        });
      }
      if (targetUrl.includes("/users/profile")) {
        return mockResponse(200, {
          status: "success",
          data: { id: 84920, username: "admin_user", email: "admin@example.com" },
        });
      }
      if (targetUrl.includes("/users/settings")) {
        return mockResponse(200, {
          status: "success",
          message: "Settings updated successfully",
        });
      }
      if (targetUrl.includes("/sessions/current")) {
        return mockResponse(200, {
          status: "success",
          message: "Session terminated successfully",
        });
      }
    }

    // Ensure valid protocol for external URLs
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl.replace(/^\/+/, "");
    }

    const startTime = Date.now();

    // Normalize request headers
    const normalizedHeaders = {
      "user-agent": "APITestingTool/1.0.0",
    };

    if (reqHeaders && typeof reqHeaders === "object") {
      Object.entries(reqHeaders).forEach(([k, v]) => {
        if (k && v !== undefined) {
          normalizedHeaders[k.toLowerCase()] = String(v);
        }
      });
    }

    const fetchOptions = {
      method: String(method).toUpperCase(),
      headers: normalizedHeaders,
    };

    if (
      ["POST", "PUT", "PATCH", "DELETE"].includes(fetchOptions.method) &&
      reqBody !== undefined
    ) {
      if (typeof reqBody === "object" && reqBody !== null) {
        fetchOptions.body = JSON.stringify(reqBody);
        if (!normalizedHeaders["content-type"]) {
          normalizedHeaders["content-type"] = "application/json";
        }
      } else {
        fetchOptions.body = String(reqBody);
        if (!normalizedHeaders["content-type"]) {
          normalizedHeaders["content-type"] = "text/plain";
        }
      }
    }

    const response = await fetch(targetUrl, fetchOptions);
    const durationMs = Date.now() - startTime;
    const responseText = await response.text();

    let parsedBody = responseText;
    try {
      parsedBody = JSON.parse(responseText);
    } catch (e) {}

    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        status: response.status,
        statusText: response.statusText || "OK",
        headers: responseHeaders,
        body: parsedBody,
        time: durationMs,
        size: responseText.length,
      }),
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        status: 0,
        statusText: "Error",
        headers: {},
        body: {
          error: "Netlify Serverless Proxy execution failed",
          message: error.message || "Could not complete request to target server",
          tip: "Verify that the target API URL is valid and publicly reachable.",
        },
        time: 0,
        size: 0,
      }),
    };
  }
};
