export interface ITodoAppUserConfig {
  provider: string;
  available: boolean;
  configured: boolean;
  enabled: boolean;
  hasAccessToken: boolean;
  externalUserId: string | null;
  defaultProjectId: string | null;
  baseUrl: string | null;
  requiresDefaultProjectId: boolean;
}

export interface ITodoAppConfigUpdate {
  enabled: boolean;
  accessToken: string | null;
  externalUserId: string | null;
  defaultProjectId: string | null;
}

export interface ITickTickAuthorizeUrlResponse {
  authorizeUrl: string;
}

