import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

// NextAuth v5 Configuration with Keycloak
// This follows the BFF pattern recommended by Gemini 3

export const authConfig = {
  providers: [
    Keycloak({
      clientId: process.env.AUTH_KEYCLOAK_ID || "eShop_oem-fe",
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET || "",
      issuer: process.env.AUTH_KEYCLOAK_ISSUER || "http://localhost:8081/realms/yadin-market",
    }),
  ],
  
  // Custom pages
  pages: {
    signIn: "/login",
  },
  
  // Callbacks for JWT handling
  callbacks: {
    async jwt({ token, account }: any) {
      // Persist the access token to use in API calls
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }: any) {
      // Pass access token to the session for client-side API calls
      if (session.user) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  
  // Use JWT as session strategy (stateless)
  session: {
    strategy: "jwt",
  },
  
  // Debug in development
  debug: process.env.NODE_ENV === "development",
};

// Create the auth handler
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
