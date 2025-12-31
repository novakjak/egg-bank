import { createCookieSessionStorage } from "react-router";

import { User } from "./database.server";

type SessionData = {
  uid: number;
  admin: boolean;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>(
    {
      cookie: {
        name: "__session",
        maxAge: 120 * 60,
      }
    }
  );

export { getSession, commitSession, destroySession }
