import { redirect } from "react-router";
import { getSession } from '../sessions.server';
import { Db, User, Payment, Account as DbAccount} from '../database.server';
import type { Route } from './+types/account';
import Error from '../components/Error';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/solid'

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await getSession(
    request.headers.get("Cookie"),
  );
  if (!session.has('uid')) {
    return redirect('/');
  }
  const uid = session.get('uid');
  const user = await User.readById(uid!);
  const account = await DbAccount.readByUserAndNumber(uid!, +params.aid);
  const payments = await Payment.readByAccount(uid!, +params.aid);
  return { uid, user, account, payments }
}

export async function action({ request, params }: Route.ActionArgs) {
  const session = await getSession(
    request.headers.get("Cookie"),
  );
  if (!session.has('uid')) {
    return redirect('/');
  }
  const uid = session.get('uid');
  const formData = await request.formData();

  const amount = formData.get('amount') as number;
  const destination = formData.get('account') as string;
  if (!/\w+#\d+/.test(destination)) {
    return { error: true, message: "Destination account does not match required format." };
  }
  const [user_name, account_number] = destination.split('#');
  const target_account = await DbAccount.readByUserNameAndNumber(user_name, +account_number);
  if (!target_account) {
    return { error: true, message: "Destination account does not exist." };
  }
  const sender_account = await DbAccount.readByUserAndNumber(uid!, +params.aid);
  if (target_account.id === sender_account.id) {
    return { error: true, message: "Cannot transfer to the same account." };
  }

  try {
    await Db.transfer(sender_account, target_account, amount);
  } catch (e) {
    console.log(e)
    return { error: true, message: e.message }
  }
}

export default function Account({ loaderData, actionData }: Route.ComponentProps) {
  const uid = loaderData.uid!;
  const user = loaderData.user!;
  const account = loaderData.account!;
  const payments = loaderData.payments!.toSorted((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const timeFormat = new Intl.DateTimeFormat("cs", {
    hourCycle: 'h24',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <>
      <Error error={actionData?.error} message={actionData?.message} />
      <div>
        <p>{account.name}</p>
        <p>{user.name}#{account.number}</p>
        <p>Balance: {account.balance}</p>
      </div>
      <button commandfor="popover" command="show-popover">New payment</button>
      <div id="popover" popover="auto">
        <div id="popovercontent">
          <button className="closebutton" commandfor="popover" command="hide-popover">Close</button>
          <form method="post">
            <label htmlFor="account">Send funds to:</label>
            <input id="account" name="account" type="text" placeholder="user#123" pattern="\w+#\d+" required />
            <label htmlFor="amount">Amount of funds to transfer:</label>
            <input id="amount" name="amount" type="number" min="0" max={account.balance} required />
            <button type="submit">Transfer</button>
          </form>
        </div>
      </div>
      <div>
        {payments.map(pay => {
          const incoming = pay.to.id === account.id
          return (
            <div className={"payment " + ( incoming ? "incoming" : "outgoing")} key={pay.id}>
              <ArrowsRightLeftIcon className="size-6" />
              {incoming ? <p>Incoming</p> : <p>Outgoing</p> }
              <p className="egg">{pay.amount}</p>
              <p>{pay.description}</p>
              {incoming ? <p>From {pay.from.user.name}#{pay.from.number}</p> : <p>To {pay.to.user.name}#{pay.to.number}</p> }
              {timeFormat.format(pay.timestamp)}
            </div>
        )})}
      </div>
    </>
  );
}
