import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";

import { Db } from '../database.server.ts';
import { getSession, commitSession } from '../sessions.server.ts';

export async function action({
  request,
}: ActionFunctionArgs) {
  const session = await getSession(
    request.headers.get("Cookie"),
  );
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;

  const authed = await Db.auth(name, password);

  if (!authed) {
    return redirect('/', {
      headers: {
        'Set-Cookie': await commitSession(session),
      }
    });
  }

  session.set('uid', authed)
  return redirect('/dashboard', {
    headers: {
      'Set-Cookie': await commitSession(session),
    }
  });
}

export default function Login() {
  return (
    <form method="post" className="flex flex-col">
      <label htmlFor="name">Name:</label>
      <input id="name" name="name" required />
      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" required />
      <button type="submit">Login</button>
    </form>
  );
}
