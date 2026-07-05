import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { query } from "./db";

// Interface for DB user structure
interface DbUser {
  id: number;
  email: string;
  password?: string;
  role: string;
  name: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("Authorize hook called with credentials:", credentials);
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing email or password");
          return null;
        }

        try {
          console.log("Querying database for email:", credentials.email);
          const dbUsers = await query<DbUser[]>(
            "SELECT id, email, password, role, name FROM users WHERE email = ? LIMIT 1",
            [credentials.email]
          );
          console.log("Database response:", dbUsers);

          if (dbUsers && dbUsers.length > 0) {
            const user = dbUsers[0];
            // Cleartext password validation for local / educational portfolio setup
            console.log("Comparing passwords: input =", credentials.password, "db =", user.password);
            if (user.password === credentials.password) {
              console.log("Password matches! Returning user:", {
                id: user.id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
              });
              return {
                id: user.id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
              };
            } else {
              console.log("Password mismatch!");
            }
          } else {
            console.log("No user found with email:", credentials.email);
          }
        } catch (error) {
          console.error("Database auth query error:", error);
        }

        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore - appending custom role
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore - reading custom role
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
