import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    user?: {
      id?: string;              // keycloakId (sub)
      keycloakId?: string;      // sub claim from Keycloak
      name?: string;
      email?: string;
      image?: string;
      firstName?: string;       // given_name
      lastName?: string;        // family_name
      emailVerified?: boolean;
      roles?: string[];        // Keycloak roles
    };
  }

  interface User {
    id?: string;
    keycloakId?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    roles?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    id?: string;
    keycloakId?: string;
    roles?: string[];
    firstName?: string;
    lastName?: string;
  }
}
