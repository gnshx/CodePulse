import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/shared/db/client";
import { verifyPassword } from "@/modules/auth/password";
import { credentialsSchema } from "@/modules/auth/validation";

const oneDay = 60 * 60 * 24;
const googleClientId = process.env.AUTH_GOOGLE_ID?.trim();
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET?.trim();
const githubClientId = process.env.AUTH_GITHUB_ID?.trim();
const githubClientSecret = process.env.AUTH_GITHUB_SECRET?.trim();

// Google-issued web client IDs always end in this domain. This avoids showing
// a sign-in button for placeholder or malformed environment values.
export const isGoogleAuthEnabled = Boolean(
  googleClientSecret &&
    googleClientId?.endsWith(".apps.googleusercontent.com") &&
    !googleClientId.startsWith("your-"),
);

export const isGitHubAuthEnabled = Boolean(
  githubClientId && githubClientSecret && !githubClientId.startsWith("your-"),
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: oneDay,
    updateAge: 60 * 60,
  },
  jwt: {
    maxAge: oneDay,
  },
  providers: [
    ...(isGoogleAuthEnabled
      ? [Google({ clientId: googleClientId, clientSecret: googleClientSecret })]
      : []),
    ...(isGitHubAuthEnabled
      ? [GitHub({ clientId: githubClientId, clientSecret: githubClientSecret })]
      : []),
    Credentials({
      id: "credentials",
      name: "Username and password",
      credentials: {
        identifier: { label: "Email or username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const identifier = parsed.data.identifier.toLowerCase();
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier }, { username: identifier }],
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            passwordHash: true,
          },
        });

        if (!user?.passwordHash || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;

      await prisma.profile.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: {},
      });
    },
  },
});
