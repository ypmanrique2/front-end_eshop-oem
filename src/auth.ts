import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

/**
 * NextAuth v5 Configuration - ARQUITECTURA FAANG'26
 * 
 * Flow FAANG'26:
 * 1. User clicks "Iniciar Sesión con Keycloak"
 * 2. Frontend redirects to Keycloak OAuth2
 * 3. Keycloak authenticates (login or register if new user)
 * 4. Keycloak returns JWT with access token
 * 5. Session includes accessToken for backend API calls
 * 6. Frontend calls /api/auth/me which triggers KeycloakUserSyncService
 * 7. User is synced from Keycloak JWT to PostgreSQL
 * 
 * ELIMINADO: Credentials provider (ya no hay login manual en backend)
 */

export const authConfig = {
  providers: [
    Keycloak({
      clientId: process.env.AUTH_KEYCLOAK_ID || "eShop_oem-fe",
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET || "",
      issuer: process.env.AUTH_KEYCLOAK_ISSUER || "http://localhost:8081/realms/yadin-market",
      // Request these specific scopes to get all user info
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }),
  ],
  
  // Custom pages
  pages: {
    signIn: "/login",
  },
  
  // Callbacks for JWT handling
  callbacks: {
    /**
     * JWT callback - runs on every token refresh
     * Extract all Keycloak claims and store in token
     */
    async jwt({ token, account, profile }: any) {
      // Initial login - account is available (OAuth2 flow)
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        // Guardar id_token para logout
        token.idToken = account.id_token;
      }
      
      // Extract Keycloak claims from profile
      if (profile) {
        token.keycloakId = profile.sub;
        token.firstName = profile.given_name;
        token.lastName = profile.family_name;
        token.roles = profile.roles || [];
      }
      
      return token;
    },
    
    /**
     * Session callback - runs when session is accessed
     * Pass Keycloak info and access token to client
     */
    async session({ session, token }: any) {
      // Pass access token to session for backend API calls
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      
      // Pass refresh token if available
      if (token.refreshToken) {
        session.refreshToken = token.refreshToken;
      }
      
      // Pass id_token for logout
      if (token.idToken) {
        session.idToken = token.idToken;
      }
      
      // Pass Keycloak user info to session
      if (session.user) {
        session.user.id = token.keycloakId;
        session.user.keycloakId = token.keycloakId;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.roles = token.roles || [];
        
        // Build full name
        const firstName = token.firstName;
        const lastName = token.lastName;
        if (firstName || lastName) {
          session.user.name = [firstName, lastName]
            .filter(Boolean)
            .join(" ");
        }
      }
      
      return session;
    },
    
    /**
     * Sign in callback - can add custom logic before sign in
     * Return false to deny sign in
     */
    async signIn({ profile }: any) {
      // Allow sign in if profile exists
      if (profile?.sub) {
        return true;
      }
      return true;
    },
  },
  
  // Use JWT as session strategy (stateless)
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 60, // 30 minutes - match Keycloak token expiry
  },
  
  // Debug in development
  debug: process.env.NODE_ENV === "development",
};

// Create the auth handler
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);