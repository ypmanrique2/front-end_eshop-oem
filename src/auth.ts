import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

/**
 * NextAuth v5 Configuration - ARQUITECTURA FAANG'26
 * 
 * OPTIMIZADO: No guardar tokens completos en la sesión para evitar
 * el error "Session cookie exceeds allowed 4096 bytes"
 */

export const authConfig = {
  providers: [
    Keycloak({
      clientId: process.env.AUTH_KEYCLOAK_ID || "eShop_oem-fe",
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET || "",
      issuer: process.env.AUTH_KEYCLOAK_ISSUER || "http://localhost:8081/realms/yadin-market",
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }),
  ],
  
  pages: {
    signIn: "/login",
  },
  
  callbacks: {
    /**
     * JWT callback - guarda tokens de forma optimizada
     * 
     * IMPORTANTE: Guardar el accessToken de Keycloak para poder
     * hacer llamadas al backend desde el BFF. Pero solo el token,
     * no los tokens de refresh que son muy grandes.
     */
    async jwt({ token, account, profile }: any) {
      if (account) {
        // Guardar solo el accessToken (necesario para llamadas al backend)
        // NO guardar refresh_token que es muy grande
        token.keycloakId = profile?.sub;
        token.firstName = profile?.given_name;
        token.lastName = profile?.family_name;
        token.roles = profile?.roles || [];
        
        // Solo guardar el accessToken (suficiente para el BFF)
        if (account.access_token) {
          token.accessToken = account.access_token;
        }
      }
      
      return token;
    },
    
    /**
     * Session callback - pasar solo lo necesario al cliente
     */
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.keycloakId;
        session.user.keycloakId = token.keycloakId;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.roles = token.roles || [];
        
        // Pasar el accessToken al cliente para llamadas API
        session.accessToken = token.accessToken;
        
        const firstName = token.firstName;
        const lastName = token.lastName;
        if (firstName || lastName) {
          session.user.name = [firstName, lastName].filter(Boolean).join(" ");
        }
      }
      
      return session;
    },
    
    async signIn({ profile }: any) {
      if (profile?.sub) {
        return true;
      }
      return true;
    },
  },
  
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 60,
  },
  
  debug: process.env.NODE_ENV === "development",
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);