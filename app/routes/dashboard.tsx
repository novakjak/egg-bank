import { redirect, Link } from "react-router";
import { getSession } from '../sessions.server';
import { Account, User, Payment } from '../database.server';
import { PlusIcon } from '@heroicons/react/24/solid'

import Error from '../components/Error';
import type { Route } from './+types/dashboard';

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(
    request.headers.get("Cookie"),
  );
  if (!session.has('uid')) {
    return redirect('/');
  }
  const uid = session.get('uid');
  const user = await User.readById(uid!);
  const accounts = await Account.readByUser(uid!);
  let totalInterest = 0
  for (const a of accounts) {
    if (a.type !== 'savings') {
      continue;
    }
    const payments = await Payment.readByAccount(uid!, a.number);
    for (const p of payments) {
      if (p.from.user.name === 'Egg Bank') {
        totalInterest += p.amount;
      } 
    }
  }
  return { user, accounts: accounts ?? [], totalInterest }
}

export async function action({
  request,
}: Route.ActionArgs) {
  const session = await getSession(
    request.headers.get("Cookie"),
  );
  const formData = await request.formData();

  const uid = session.get('uid');
  let name = formData.get("name") as string;
  if (name.length > 50) {
    return { error: true, message: 'Name is too long' };
  }
  const type = formData.get("type") as string;
  if (!name) {
    switch (type) {
      case 'basic':
        name = 'Basic account'
        break;
      case 'savings':
        name = 'Savings account'
        break;
      default:
        return { error: true, message: 'Unknown account type' }
    }
  }
  try {
    await Account.create(uid!, name, type)
  } catch (e: any) {
    console.log(e)
    return { error: true, message: e.toString() }
  }
}

export default function Dashboard({ loaderData, actionData }: Route.ComponentProps) {
  const user = loaderData.user!;
  const accounts = loaderData.accounts;
  const totalFunds = accounts.reduce((sum, acc) => sum + acc.balance, 0)
  const totalInterest = loaderData.totalInterest;
  return (
    <>
      <Error error={actionData?.error} message={actionData?.message} />
      <h1>Welcome back {user.name}!</h1>
      <div className='flex flex-row gap-3 flex-wrap justify-around mb-[1rem]'>
        {accounts.map(a => (
          <Link to={"/dashboard/account/" + a.number} className="account" key={a.id}>
            <p>{a.name}</p>
            <p className="neutral-800">{a.type}</p>
            <p className="text-center egg">{a.balance}</p>
          </Link>
        ))}
        <button popoverTarget="popover" popoverTargetAction="show" className="account justify-center">
          <PlusIcon className="size-6 self-center" />
          <p className="text-center">Open account</p>
        </button>
        <div id="popover" popover="auto">
          <div id="popovercontent">
            <button className="closebutton" popoverTarget="popover" popoverTargetAction="hide">Close</button>
            <form method="post">
              <label htmlFor="name">Account name (leave empty for default):</label>
              <input name="name" id="name" type="text" maxLength={50} />
              <legend>Account type:</legend>
              <ul className="flex flex-row justify-start gap-10">
                <li className="flex flex-row gap-3">
                  <input type="radio" id="basic" name="type" value="basic" required />
                  <label htmlFor="basic">Basic</label>
                </li>
                <li className="flex flex-row gap-3">
                  <input type="radio" id="savings" name="type" value="savings" required />
                  <label htmlFor="savings">Savings</label>
                </li>
              </ul>
              <button type="submit">Register</button>
            </form>
          </div>
        </div>
      </div>
      <div id="overview">
        <p className="egg">Your total funds are {totalFunds.toFixed(3)}</p>
        {totalInterest > 0 ? <p>You've made a total of <span className="egg">{totalInterest.toFixed(3)}</span> on interest!</p> : null}
      </div>
    </>
  );
}
