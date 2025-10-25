import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.CLIENT_ID || "",
      clientSecret: process.env.CLIENT_SECRET || "",
      async profile(profile) {
        let userRole = "Google User";
        const user: any = await prisma.users.findUnique({
          where: { email: profile.email },
          select: {
            email: true,
            password: true,
            user_id: true,
            collaborators: true,
            first_name: true,
            last_name: true,
            onboarded: true,
            phone: true,
            verified: true,
            last_logged_in: true,
            login_type: true,
            profile_image: true,
            pro: true,
            expires_at: true,
            organizations: {
              select: {
                organizations: {
                  select: {
                    organization_id: true,
                    name: true,
                    disabled: true,
                    users: true,
                  },
                },
              },
            },
          },
        });
        if (!user) {
          console.log(
            "New user==============================================="
          );
          const newUser = await prisma.users.create({
            data: {
              email: profile.email,
              profile_image: profile.picture,
              first_name: profile.username || profile.name,
              login_type: "google",
              verified: true,
              onboarded: true,
            },
          });

          // Create a default organization for the user
          const organization = await prisma.organizations.create({
            data: {
              name: "Default",
              admin_id: newUser?.user_id,
            },
          });

          // Create a default workspace
          const workspace = await prisma.workspaces.create({
            data: {
              name: "My Workspace",
              description: "My default workspace",
              organization_id: organization.organization_id,
              collaborators: {
                create: {
                  user_id: newUser.user_id,
                  role: "admin",
                },
              },
            },
          });

          // Add user to the organization with the default workspace
          await prisma.userOrganization.create({
            data: {
              user_id: newUser.user_id,
              organization_id: organization.organization_id,
            },
          });

          // console.log(workspace);

          const [createdUser, updatedUser]: any = await prisma.$transaction([
            prisma.users.findUnique({
              where: { email: newUser.email },
              select: {
                email: true,
                password: true,
                user_id: true,
                collaborators: true,
                first_name: true,
                last_name: true,
                onboarded: true,
                profile_image: true,
                pro: true,
                expires_at: true,
                organizations: {
                  select: {
                    organizations: {
                      select: {
                        organization_id: true,
                        name: true,
                        disabled: true,
                        users: true,
                      },
                    },
                  },
                },
                phone: true,
                verified: true,
                last_logged_in: true,
              },
            }),
            prisma.users.update({
              where: { email: newUser.email },
              data: {
                last_logged_in: new Date(),
              },
            }),
          ]);

          const userOrganization = createdUser.organizations[0];
          console.log(userOrganization);

          return {
            user: {
              ...createdUser,
              org_name: userOrganization.organizations[0]?.name,
              organization_id:
                userOrganization.organizations[0]?.organization_id,
              org_disabled: userOrganization.organizations[0]?.disabled,
              org_members: userOrganization.organizations[0]?.users || [],
              last_logged_in: updatedUser.last_logged_in?.toLocaleString(),
            },
            ...profile,
            id: profile.sub,
            role: userOrganization.role,
          };
        }

        console.log("error is here");
        const updatedUser = await prisma.users.update({
          where: { email: user.email },
          data: {
            last_logged_in: new Date(),
          },
        });
        const userOrganization = user.organizations[0];
        return {
          user: {
            ...user,
            org_name: userOrganization.organizations[0]?.name,
            organization_id: userOrganization.organizations[0]?.organization_id,
            org_disabled: userOrganization.organizations[0]?.disabled,
            org_members: userOrganization.organizations[0]?.users || [],
            last_logged_in: updatedUser.last_logged_in?.toLocaleString(),
          },
          ...profile,
          id: profile.sub,
          role: userRole,
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "email:",
          type: "text",
          placeholder: "your-email",
        },
        password: {
          label: "password:",
          type: "password",
          placeholder: "your-password",
        },
      },
      async authorize(credentials: any) {
        console.log("CREDENTIALS");
        console.log(credentials);
        return {
          ...credentials,
          subscriptions: JSON.parse(credentials?.subscriptions),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      // console.log("New user===============================================");
      // console.log("JWT");
      // console.log(token);
      // console.log(user);
      if (trigger == "update") {
        if (session?.user?.pro || session?.user?.subscriptions) {
          token.pro = session?.user?.pro;
          token.subscriptions = session?.user?.subscriptions;
        }
        // console.log(token);
      }
      return { ...token, ...user };
    },
    async session({ session, token }: any) {
      // console.log("SESSION");
      // console.log(session);
      // console.log(token);
      return {
        ...session,
        user: { ...session.user, ...(token.user ? token.user : token) },
      };
    },
    async signIn({ account, profile }: any) {
      if (account.provider === "google") {
        const user = await prisma.users.findUnique({
          where: { email: profile.email },
        });
        if (!user) {
          await prisma.users.create({
            data: {
              email: profile.email,
              profile_image: profile.picture,
              login_type: "google",
              verified: true,
            },
          });
        }

        if (user && user.login_type !== "google") {
          return "/login?loginTypeError=true";
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },

  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
};
