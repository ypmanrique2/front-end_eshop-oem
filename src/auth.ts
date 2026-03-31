import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

/**
 * NextAuth v5 Configuration with Keycloak
 * 
 * Flow:
 * 1. User logs in via Keycloak OAuth2
 * 2. NextAuth receives JWT from Keycloak
 * 3. We extract all claims including roles
 * 4. Session includes accessToken for backend API calls
 * 5. Frontend calls /api/auth/me which triggers KeycloakUserSyncService
 * 6. User is synced from Keycloak JWT to PostgreSQL
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
      // Initial login - account is available
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      
      // Extract Keycloak claims from ID token or profile
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
      
      // Pass Keycloak user info to session
      if (session.user) {
        session.user.id = token.keycloakId;
        session.user.keycloakId = token.keycloakId;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.roles = token.roles || [];
        
        // Build full name
        if (token.firstName || token.lastName) {
          session.user.name = [token.firstName, token.lastName]
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
    async signIn({ user, profile }: any) {
      // Allow sign in if profile exists
      if (profile?.sub) {
        return true;
      }
      return true; // Allow by default for Keycloak
    },
  },
  
  // Use JWT as session strategy (stateless)
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes - match Keycloak token expiry
  },
  
  // Debug in development
  debug: process.env.NODE_ENV === "development",
};

// Create the auth handler
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
