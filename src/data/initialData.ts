import { ApiRequest, Collection, Environment, HistoryItem } from "../types";

// Helper to generate unique IDs
const uuid = () => Math.random().toString(36).substring(2, 9);

// Mock server base URL can be replaced dynamically with window.location.origin in client
export const DEFAULT_BASE_URL = "http://localhost:3000";

export const initialEnvironments: Environment[] = [
  {
    id: "env-local",
    name: "Local Environment",
    variables: [
      { id: "v1", key: "base_url", value: "", enabled: true }, // Empty value will fallback to current window.location.origin
      { id: "v2", key: "username", value: "admin_user", enabled: true },
      { id: "v3", key: "password", value: "SecureP@ssw0rd!", enabled: true },
    ],
  },
  {
    id: "env-production",
    name: "Production Environment",
    variables: [
      { id: "v4", key: "base_url", value: "https://api.production.example.com", enabled: true },
      { id: "v5", key: "username", value: "prod_admin", enabled: true },
    ],
  }
];

// Initial requests mimicking the user's setup
export const initialRequests: ApiRequest[] = [
  {
    id: "req-login",
    name: "Requisitaê",
    method: "POST",
    url: "{{base_url}}/api/v1/auth/login",
    params: [],
    headers: [],
    bodyType: "raw-json",
    bodyRaw: JSON.stringify(
      {
        username: "{{username}}",
        password: "{{password}}",
        device_info: {
          client_id: "web_app_v2",
          os_type: "macOS"
        }
      },
      null,
      2
    ),
    collectionId: "coll-auth",
  },
  {
    id: "req-settings",
    name: "User Settings",
    method: "PUT",
    url: "{{base_url}}/api/v1/users/settings",
    params: [],
    headers: [],
    bodyType: "raw-json",
    bodyRaw: JSON.stringify(
      {
        theme: "dark",
        notifications: {
          email: true,
          push: false
        }
      },
      null,
      2
    ),
    collectionId: "coll-auth",
  },
  {
    id: "req-sessions",
    name: "Sessions Current",
    method: "DELETE",
    url: "{{base_url}}/api/v1/sessions/current",
    params: [],
    headers: [],
    bodyType: "none",
    bodyRaw: "",
    collectionId: "coll-auth",
  }
];

export const initialCollections: Collection[] = [
  {
    id: "coll-auth",
    name: "Auth Services",
    requests: initialRequests,
  }
];

export const initialHistory: HistoryItem[] = [
  {
    id: "hist-login",
    name: "Requisitaê",
    method: "POST",
    url: "/api/v1/auth/login",
    timestamp: "10:12 AM",
    status: 200,
    time: 124,
    requestConfig: initialRequests[0],
  },
  {
    id: "hist-settings",
    name: "User Settings",
    method: "PUT",
    url: "/api/v1/users/settings",
    timestamp: "10:10 AM",
    status: 200,
    time: 156,
    requestConfig: initialRequests[1],
  },
  {
    id: "hist-sessions",
    name: "Sessions Current",
    method: "DELETE",
    url: "/api/v1/sessions/current",
    timestamp: "10:05 AM",
    status: 200,
    time: 98,
    requestConfig: initialRequests[2],
  }
];
