import { redirect, data } from "react-router";

import { Db } from '../database.server';
import { getSession, commitSession, destroySession } from '../sessions.server';
import Error from '../components/Error';
import type { Route } from './+types/login';

export async function action({
  request,
}: Route.ActionArgs) {
  const session = await getSession(
    request.headers.get("Cookie"),
  );
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;

  if (name.length > 50) {
    return data({ error: true, message: "Name is too long."}, {
      headers: {
        'Set-Cookie': await destroySession(session),
      }
    });
  }
  if (password.length > 50) {
    return data({ error: true, message: "Password is too long."}, {
      headers: {
        'Set-Cookie': await destroySession(session),
      }
    });
  }

  const authed = await Db.auth(name, password);

  if (!authed) {
    return data({ error: true, message: "User does not exists or you entered wrong password."}, {
      headers: {
        'Set-Cookie': await destroySession(session),
      }
    });
  }

  session.set('uid', authed);
  return redirect('/dashboard', {
    headers: {
      'Set-Cookie': await commitSession(session),
    }
  });
}

export default function Login({ actionData }: Route.ComponentProps) {
  return (
    <form method="post" className="flex flex-col">
      <Error error={actionData?.error} message={actionData?.message} />
      <label htmlFor="name">Name:</label>
      <input id="name" name="name" maxLength="50" required />
      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" maxLength="50" required />
      <button type="submit">Login</button>
    </form>
  );
}
