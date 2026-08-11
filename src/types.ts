export type MethodType = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS";

export interface KeyValueItem {
  id: string;
  key: string;
  value: string;
  description?: string;
  enabled: boolean;
}

export interface ApiRequest {
  id: string;
  name: string;
  method: MethodType;
  url: string;
  params: KeyValueItem[];
  headers: KeyValueItem[];
  bodyType: "none" | "form-data" | "urlencoded" | "raw-json" | "raw-text";
  bodyRaw: string;
  collectionId?: string;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  time: number;
  size: number;
}

export interface EnvVariable {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface Environment {
  id: string;
  name: string;
  variables: EnvVariable[];
}

export interface Collection {
  id: string;
  name: string;
  requests: ApiRequest[];
}

export interface HistoryItem {
  id: string;
  name: string;
  method: MethodType;
  url: string;
  timestamp: string;
  status?: number;
  time?: number;
  // Hold full request config so clicking it reloads it
  requestConfig: ApiRequest;
}
