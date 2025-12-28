import { redirect } from "react-router";
import { getSession, destroySession } from '../sessions.server.ts';

export async function loader({ request }) {
  const session = await getSession(
    request.headers.get("Cookie"),
  );
  return redirect('/', {
    headers: {
      'Set-Cookie': await destroySession(session),
    }
  })
}
export default function Logout() {
  return <h1>Logging out...</h1>
}
