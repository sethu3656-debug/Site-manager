import * as cookie from "cookie";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import * as schema from "@db/schema";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { signSessionToken } from "./kimi/session";
import { env } from "./lib/env";

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),
  
  login: publicQuery
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const user = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.username, input.username))
        .limit(1)
        .then((rows) => rows[0]);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found. Please verify your username.",
        });
      }

      if (user.password && user.password !== input.password) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Incorrect password.",
        });
      }

      const unionId = user.unionId || user.username;

      const token = await signSessionToken({
        unionId: unionId,
        clientId: env.appId || "local-client",
      });

      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Session.maxAgeMs / 1000,
        })
      );

      return { success: true, user };
    }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});
