import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import Credentials from "next-auth/providers/credentials";

/**
 * NextAuth v5 Configuration with Keycloak
 * 
 * Flow:
 * 1. User logs in via Keycloak OAuth2 OR credentials
 * 2. NextAuth receives JWT from Keycloak (OAuth2) or exchanges credentials (credentials)
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
    
    /**
     * Credentials Provider for direct login
     * 
     * Este provider permite login con username/password que se validan
     * contra el backend de Spring Boot, que a su vez valida contra Keycloak
     * y sincroniza el usuario a PostgreSQL.
     */
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "ypmanrique15@gmail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // Llamar al backend para validar credenciales
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
          const response = await fetch(`${backendUrl}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            console.error("Backend login failed:", response.status);
            return null;
          }

          const data = await response.json();
          
          // El backend devuelve: { success: true, data: { access_token, ... } }
          if (data.success && data.data?.access_token) {
            // Decodificar el JWT para obtener info del usuario
            const token = data.data.access_token;
            const payload = JSON.parse(atob(token.split(".")[1]));
            
            return {
              id: payload.sub,
              email: payload.email || credentials.username,
              name: payload.name || payload.preferred_username,
              firstName: payload.given_name,
              lastName: payload.family_name,
              roles: payload.realm_access?.roles || [],
              accessToken: token,
            };
          }

          return null;
        } catch (error) {
          console.error("Credentials auth error:", error);
          return null;
        }
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
     * Also handles credentials login (stores accessToken directly)
     */
    async jwt({ token, account, profile, user }: any) {
      // Initial login - account is available (OAuth2 flow)
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      
      // Credentials login - user object contains the accessToken from authorize()
      if (user?.accessToken) {
        token.accessToken = user.accessToken;
      }
      
      // Extract Keycloak claims from profile (OAuth2 flow)
      if (profile) {
        token.keycloakId = profile.sub;
        token.firstName = profile.given_name;
        token.lastName = profile.family_name;
        token.roles = profile.roles || [];
      }
      
      // For credentials login, extract from JWT payload if available
      if (user?.keycloakId && !token.keycloakId) {
        token.keycloakId = user.keycloakId;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.roles = user.roles || [];
      }
      
      return token;
    },
    
    /**
     * Session callback - runs when session is accessed
     * Pass Keycloak info and access token to client
     * Handles both OAuth2 and credentials login
     */
    async session({ session, token, user }: any) {
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
        session.user.id = token.keycloakId || user?.id;
        session.user.keycloakId = token.keycloakId || user?.id;
        session.user.firstName = token.firstName || user?.firstName;
        session.user.lastName = token.lastName || user?.lastName;
        session.user.roles = token.roles || user?.roles || [];
        
        // Build full name
        const firstName = token.firstName || user?.firstName;
        const lastName = token.lastName || user?.lastName;
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
