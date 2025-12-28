import { createCookieSessionStorage } from "react-router";

import { User } from "./database.server.ts";

type SessionData = {
  uid: int;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>(
    {
      cookie: {
        name: "__session",
        maxAge: 120,
      }
    }
  );

export { getSession, commitSession, destroySession }
