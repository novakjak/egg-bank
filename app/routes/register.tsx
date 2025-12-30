import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";

import { User } from '../database.server';
import { getSession, commitSession } from '../sessions.server';
import Error from '../components/Error';
import type { Route } from './+types/register';

export async function action({
  request,
}: Route.ActionArgs) {
  const session = await getSession(
    request.headers.get("Cookie"),
  );
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  if (!/^\w+$/.test(name)) {
    return { error: true, message: 'Name can only contain numbers, letters and underscores (_).' }
  }
  if (name.length > 50) {
    return { error: true, message: 'Name is too long.' }
  }
  if (password.length > 50) {
    return { error: true, message: 'Password is too long.' }
  }
  try {
    const user = new User(name, password);
    await user.save();
    session.set('uid', user.id);
  } catch (e) {
    return { error: true, message: 'A user with such name already exists.' }
  }

  return redirect('/dashboard', {
    headers: {
      'Set-Cookie': await commitSession(session),
    }
  });
}

export default function Register({ actionData }: Route.ComponentProps) {
  return (
    <form method="post" className="flex flex-col">
      <Error error={actionData?.error} message={actionData?.message} />
      <label htmlFor="name">Name:</label>
      <input id="name" name="name" maxlength="50" required />
      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" maxlength="50" required />
      <button type="submit">Register</button>
    </form>
  );
}
