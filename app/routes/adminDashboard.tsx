import { useFetcher } from 'react-router';

import { Log } from '../database.server';
import { timeFormat } from '../util';

import type { Route } from './+types/adminDashboard';

export async function loader({ request }: Route.ActionArgs) {
  const log_msgs = await Log.readAll();
  return { log_msgs }
}

export default function AdminDashboard({ loaderData }: Route.ComponentProps ) {
  const log_msgs = loaderData.log_msgs!.toSorted((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return (
    <>
      <div>
        <div className="logHeader">
          <p>Timestamp</p>
          <p>Message</p>
          <p>Account</p>
          <p>User</p>
        </div>
        {log_msgs.map(msg => {
          const user = typeof msg.user === 'number' ? msg.user : msg.user?.name;
          const account = typeof msg.account === 'number' ? msg.account : msg.account?.name;
          return (
            <>
              <div className="log" key={msg.id ?? 0}>
                <p>{timeFormat.format(msg.timestamp)}</p>
                <p>{msg.message}</p>
                <p>{account}</p>
                <p>{user}</p>
              </div>
            </>
          );
        }
        )}
      </div>
    </>
  );
}
