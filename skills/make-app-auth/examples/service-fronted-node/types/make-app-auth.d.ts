declare module '@qfeius/make-app-auth' {
  export interface MakeAppAuthOptions {
    gatewayBaseUrl?: string;
    unifiedLogin?: boolean;
    apiAuthRedirect?: boolean;
  }

  export type CurrentContextAuthResult =
    | {
        status: 'authenticated';
        context: {
          userId?: string;
          tenantId?: string;
          appId?: string;
          authMode?: 'cookie' | 'token';
          [key: string]: unknown;
        };
      }
    | {
        status: 'redirecting';
        authorizationUrl: string;
        challenge: unknown;
      }
    | {
        status: 'unauthenticated';
        authorizationUrl: string | null;
        challenge: unknown;
        reason?: string;
        message?: string;
      }
    | {
        status: 'forbidden' | 'failed';
        httpStatus: number;
        payload: unknown;
      };

  export interface MakeAppApiClient {
    get(path: string, init?: RequestInit): Promise<unknown>;
    post(path: string, body?: unknown, init?: RequestInit): Promise<unknown>;
  }

  export interface MakeAppAuthClient {
    api: MakeAppApiClient;
    init(options?: { redirect?: boolean; returnUrl?: string }): Promise<CurrentContextAuthResult>;
    login(options?: { redirect?: boolean; returnUrl?: string }): Promise<CurrentContextAuthResult>;
  }

  export function createMakeAppAuth(options?: MakeAppAuthOptions): MakeAppAuthClient;
}
