import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Midlewares for request bodies
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // --- API PROXY ENDPOINT (To resolve client-side CORS limitations) ---
  app.post("/api/proxy", async (req, res) => {
    const { url, method = "GET", headers = {}, body } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Resolve relative URLs or localhost URLs to local server port
    let targetUrl = url.trim();
    if (targetUrl.startsWith("/")) {
      targetUrl = `http://127.0.0.1:${PORT}${targetUrl}`;
    }

    const startTime = performance.now();

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: {
          ...headers,
          // Set a user agent to mimic regular browser requests/Postman
          "User-Agent": "APITestingTool/1.0.0",
        },
      };

      if (["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase()) && body !== undefined) {
        if (typeof body === "object") {
          fetchOptions.body = JSON.stringify(body);
          if (!fetchOptions.headers["content-type"]) {
            (fetchOptions.headers as Record<string, string>)["content-type"] = "application/json";
          }
        } else {
          fetchOptions.body = String(body);
        }
      }

      const response = await fetch(targetUrl, fetchOptions);
      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);

      // Extract response text or try parsing JSON
      const responseText = await response.text();
      let responseBody: any = responseText;
      try {
        responseBody = JSON.parse(responseText);
      } catch (e) {
        // Not JSON, leave as text
      }

      // Convert response headers to a flat object
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Calculate approximate size in bytes
      const contentLength = response.headers.get("content-length");
      const sizeBytes = contentLength ? parseInt(contentLength, 10) : Buffer.byteLength(responseText, "utf8");

      res.json({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseBody,
        time: durationMs,
        size: sizeBytes,
      });
    } catch (error: any) {
      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);
      res.status(200).json({
        status: 0,
        statusText: "Error",
        headers: {},
        body: {
          error: "Could not send request",
          message: error.message || "An unexpected network or system error occurred.",
          hint: "Ensure the URL is correct, includes http:// or https://, and that the endpoint is reachable from this server environment.",
        },
        time: durationMs,
        size: 0,
      });
    }
  });

  // --- MOCK SERVER ENDPOINTS ---
  // These mimic the precise endpoints displayed in the user screenshot's history.
  // This provides a fully functional local mock API that users can inspect and test immediately.

  // 1. POST /api/v1/auth/login
  app.post("/api/v1/auth/login", (req, res) => {
    const { username, password } = req.body;

    // Simulate basic validation
    if (!username || !password) {
      return res.status(400).json({
        status: "error",
        message: "Bad Request: Missing username or password",
      });
    }

    res.json({
      status: "success",
      data: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ODQ5MjAsInVzZXJuYW1lIjoiYWRtaW5fdXNlciIsInJvbGVzIjpbImFkbWluIiwiZWRpdG9yIl0sImV4cCI6MTc2MDAwMDAwMH0.signature_abc123xyz",
        expires_in: 3600,
        user: {
          id: 84920,
          username: username,
          roles: ["admin", "editor"],
          is_active: true,
        },
      },
    });
  });

  // 2. GET /api/v1/users/profile
  app.get("/api/v1/users/profile", (req, res) => {
    const authHeader = req.headers.authorization;
    
    res.json({
      status: "success",
      data: {
        id: 84920,
        username: "admin_user",
        email: "admin@example.com",
        profile: {
          first_name: "Admin",
          last_name: "User",
          avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
        },
        organization: "Vox Tecnologia",
        authorization_verified: !!authHeader,
        created_at: "2026-01-15T08:00:00Z",
      },
    });
  });

  // 3. PUT /api/v1/users/settings
  app.put("/api/v1/users/settings", (req, res) => {
    const body = req.body;
    res.json({
      status: "success",
      message: "Settings updated successfully",
      data: {
        theme: body.theme || "dark",
        notifications: {
          email: body.notifications?.email !== false,
          push: body.notifications?.push === true,
        },
        updated_at: new Date().toISOString(),
      },
    });
  });

  // 4. DELETE /api/v1/sessions/current
  app.delete("/api/v1/sessions/current", (req, res) => {
    res.json({
      status: "success",
      message: "Session terminated successfully",
      data: {
        session_id: "sess_98234ab109f",
        terminated_at: new Date().toISOString(),
      },
    });
  });

  // --- VITE DEV / PRODUCTION HANDLERS ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
