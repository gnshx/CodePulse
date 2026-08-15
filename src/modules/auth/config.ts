import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/shared/db/client";
import { verifyPassword } from "@/modules/auth/password";
import { credentialsSchema } from "@/modules/auth/validation";

const oneDay = 60 * 60 * 24;

function readAuthEnv(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  const normalized = trimmed.toLowerCase();
  if (
    normalized.startsWith("your-") ||
    normalized.includes("change-me") ||
    normalized === "sk-..." ||
    normalized === "placeholder"
  ) {
    return undefined;
  }

  return trimmed;
}

const googleClientId = readAuthEnv(process.env.AUTH_GOOGLE_ID);
const googleClientSecret = readAuthEnv(process.env.AUTH_GOOGLE_SECRET);
const githubClientId = readAuthEnv(process.env.AUTH_GITHUB_ID);
const githubClientSecret = readAuthEnv(process.env.AUTH_GITHUB_SECRET);

export const isGoogleAuthEnabled = Boolean(googleClientId && googleClientSecret);
export const isGitHubAuthEnabled = Boolean(githubClientId && githubClientSecret);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
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
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            allowDangerousEmailAccountLinking: false,
          }),
        ]
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
