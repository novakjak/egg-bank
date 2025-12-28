import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";

import { User } from '../database.server.ts';

export async function action({
  request,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  try {
    const user = new User(name, password)
    await user.save()
  } catch (e) {
    return { alreadyExists: true }
  }

  return redirect('/');
}

export default function Register({ actionData }) {
  return (
    <form method="post" className="flex flex-col">
      { !!actionData?.alreadyExists ? <p>We are sorry, but a user with such name already exists</p> : null }
      <label htmlFor="name">Name:</label>
      <input id="name" name="name" required />
      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" required />
      <button type="submit">Register</button>
    </form>
  );
}
