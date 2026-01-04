import pkg from 'mssql'

export class Db {
  private static inst: Db | null;
  pool: pkg.ConnectionPool;

  private constructor() {
    this.pool = new pkg.ConnectionPool({
      user: process.env.DATABASE_USER ?? 'sa',
      password: process.env.DATABASE_PASSWORD ?? 'Hunter12',
      server: process.env.DATABASE_SERVER ?? 'localhost',
      database: process.env.DATABASE ?? 'egg_bank',
      port: +(process.env.DATABASE_PORT ?? 1433),
      options: {
        trustServerCertificate: (process.env.TRUSTSERVERCERTIFICATE?.toLowerCase() ?? 'true') === 'true' ,
      }
    });
  }

  private static async create(): Promise<Db> {
    let db = new Db();
    const res = await db.pool.connect();
    return db;
  }

  public static async instance(): Promise<Db> {
    if (!Db.inst) {
      Db.inst = await Db.create();
    }
    return Db.inst;
  }

  public static async auth(name: string, password: string): Promise<[number, boolean] | null> {
    const request = new pkg.Request((await Db.instance()).pool)
    const res = await request
      .input('name', pkg.VarChar, name)
      .input('password', pkg.VarChar, password)
      .output('authed', pkg.Int)
      .output('admin', pkg.Bit)
      .execute('auth_user')

    if (!res.output['authed']) {
      return null;
    }
    return [res.output['authed'], res.output['admin']];
  }

  public static async transfer(from: Account, to: Account, amount: number) {
    const request = new pkg.Request((await Db.instance()).pool);
    await request
      .input('from', pkg.Int, from.id)
      .input('to', pkg.Int, to.id)
      .input('amount', pkg.Decimal(38,3), amount)
      .execute('transfer');
  }

  public static async createTransaction(): Promise<pkg.Transaction> {
    const transaction = new pkg.Transaction((await Db.instance()).pool);
    await transaction.begin();
    return transaction;
  }
}

export class User {
  id: number | null;
  name: string;
  password: string;
  admin: boolean;

  constructor(name: string, password: string, id?: number, admin?: boolean) {
    this.id = id ?? null;
    this.name = name;
    this.password = password;
    this.admin = admin ?? false;
  }

  public static isUser(obj: any): obj is User {
    return (
      obj &&
      (typeof obj.id === 'number' || obj.id === null) &&
      typeof obj.name === 'string' &&
      typeof obj.password === 'string' &&
      typeof obj.admin === 'boolean'
    );
  }

  public static fromExported(obj: unknown): User | null {
    if (!User.isUser(obj)) {
      return null;
    }
    return new User(
      obj.name,
      obj.password,
      obj.id ?? undefined,
      obj.admin,
    );
  }

  public static async readById(id: number): Promise<User | null> {
    const request = new pkg.Request((await Db.instance()).pool)
    const res = await request
      .input('id', pkg.Int, id)
      .query('select id, name, password, admin from users where id = @id');
    if (res.recordset.length === 0) {
      return null;
    }
    const row = res.recordset[0];
    const user = new User(row['name'], row['password'], row['id'], row['admin']);
    return user;
  }

  public static async readAll(): Promise<User[]> {
    const request = new pkg.Request((await Db.instance()).pool)
    const response = await request
      .query('select id, name, password, admin from users');
    let users = []
    for (const row of response.recordset) {
      users.push(new User(
        row['name'],
        row['password'],
        row['id'],
        row['admin'],
      ));
    }
    return users;
  }

  public async save() {
    if (!this.id) {
      await this.insert();
    } else {
      await this.update();
    }
  }
  private async insert() {
    const request = new pkg.Request((await Db.instance()).pool)
    const res = await request
      .input('name', pkg.VarChar, this.name)
      .input('password', pkg.VarChar, this.password)
      .input('admin', pkg.Bit, this.admin)
      .query('insert into users (name, password, admin) values (@name, @password, @admin); select SCOPE_IDENTITY() as id;')
    this.id = res.recordset[0].id
  }
  private async update() {
    const request = new pkg.Request((await Db.instance()).pool)
    await request
      .input('id', pkg.Int, this.id)
      .input('name', pkg.VarChar, this.name)
      .input('password', pkg.VarChar, this.password)
      .input('admin', pkg.Bit, this.admin)
      .query('update users set name=@name, password=@password, admin=@admin where id=@id')
  }
  public async delete() {
    if (!this.id) {
      return
    }
    const request = new pkg.Request((await Db.instance()).pool)
    await request
      .input('id', pkg.Int, this.id)
      .query('delete from users where id = @id')
  }

  public async insertRaw(transaction?: pkg.Transaction) {
    const request = transaction ? transaction.request() : new pkg.Request((await Db.instance()).pool)
    await request
      .input('id', pkg.Int, this.id)
      .input('name', pkg.VarChar, this.name)
      .input('password', pkg.VarChar, this.password)
      .input('admin', pkg.Bit, this.admin)
      .query('set identity_insert users on; insert into users (id, name, password, admin) values (@id, @name, @password, @admin)')
  }

  public static async truncate(transaction?: pkg.Transaction) {
    const request = transaction ? transaction.request() : new pkg.Request((await Db.instance()).pool)
    await request.query('delete from users');
  }
}

export class AccountRaw {
  id: number;
  user_id: number;
  number: number;
  name: string;
  type: string;
  balance: number;
  status: string;

  public constructor(id: number, user_id: number, number: number, name: string, type: string, balance: number, status: string) {
    this.id = id;
    this.user_id = user_id;
    this.number = number;
    this.name = name;
    this.type = type;
    this.balance = balance;
    this.status = status;
  }

  public static isAccountRaw(obj: any): obj is AccountRaw {
    return (
      !!obj &&
      typeof obj.id === 'number' &&
      typeof obj.user_id === 'number' &&
      typeof obj.number === 'number' &&
      typeof obj.name === 'string' &&
      typeof obj.type === 'string' &&
      typeof obj.balance === 'number' &&
      typeof obj.status === 'string'
    );
  }

  public static fromExported(obj: unknown): AccountRaw | null {
    if (!AccountRaw.isAccountRaw(obj)) {
      return null;
    }
    return new AccountRaw(
      obj.id,
      obj.user_id,
      obj.number,
      obj.name,
      obj.type,
      obj.balance,
      obj.status,
    );
  }

  public async insertRaw(transaction?: pkg.Transaction) {
    const request = transaction ? transaction.request() : new pkg.Request((await Db.instance()).pool)
    await request
      .input('id', pkg.Int, this.id)
      .input('user_id', pkg.Int, this.user_id)
      .input('number', pkg.Int, this.number)
      .input('name', pkg.VarChar, this.name)
      .input('type', pkg.VarChar, this.type)
      .input('balance', pkg.Decimal(38,3), this.balance)
      .input('status', pkg.VarChar, this.status)
      .query('set identity_insert account on; insert into account (id, user_id, number, name, type, balance, status) values (@id, @user_id, @number, @name, @type, @balance, @status)')
  }

  public static async readRaw(): Promise<AccountRaw[]> {
    const request = new pkg.Request((await Db.instance()).pool);
    const response = await request
      .query('select id, user_id, number, name, type, balance, status from account')
    const res = []
    for (const row of response.recordset) {
      if (!AccountRaw.isAccountRaw(row)) {
        continue;
      }
      res.push(new AccountRaw(
        row.id,
        row.user_id,
        row.number,
        row.name,
        row.type,
        row.balance,
        row.status,
      ));
    }
    return res;
  }

  public static async truncate(transaction?: pkg.Transaction) {
    const request = transaction ? transaction.request() : new pkg.Request((await Db.instance()).pool)
    await request.query('delete from account');
  }
}

export class Account {
  id: number;
  user: User;
  number: number;
  name: string;
  type: string;
  balance: number;
  status: string;

  private constructor(id: number, user: User, number: number, name: string, type: string, balance: number, status: string) {
    this.id = id;
    this.user = user;
    this.number = number;
    this.name = name;
    this.type = type;
    this.balance = balance;
    this.status = status;
  }

  private static async parseOne(recordset: object[]): Promise<Account | null> {
    if (recordset.length === 0) {
      return null;
    }
    const row = recordset[0];
    if (!AccountRaw.isAccountRaw(row)) {
      return null;
    }
    return new Account(
      row.id,
      (await User.readById(row.user_id))!,
      row.number,
      row.name,
      row.type,
      row.balance,
      row.status,
    );
  }

  private static async parseMany(recordset: object[]): Promise<Account[]> {
    let res = [];
    for (const row of recordset) {
      if (!AccountRaw.isAccountRaw(row)) {
        continue;
      }
      res.push(new Account(
        row.id,
        (await User.readById(row.user_id))!,
        row.number,
        row.name,
        row.type,
        row.balance,
        row.status,
      ));
    }
    return res;
  }

  public static async readByUser(id: number): Promise<Account[]> {
    const request = new pkg.Request((await Db.instance()).pool);
    const response = await request
      .input('userid', pkg.Int, id)
      .query(`select id, user_id, number, name, type, balance, status
                from account
                where user_id = @userid`);
    return await Account.parseMany(response.recordset);
  }

  public static async readByUserAndNumber(user: number, acc_num: number): Promise<Account | null> {
    const request = new pkg.Request((await Db.instance()).pool);
    const response = await request
      .input('userid', pkg.Int, user)
      .input('acc_num', pkg.Int, acc_num)
      .query(`select id, user_id, number, name, type, balance, status
                from account
                where user_id = @userid and number = @acc_num`);
    return await Account.parseOne(response.recordset);
  }

  public static async readByUserNameAndNumber(username: string, acc_num: number): Promise<Account | null> {
    const request = new pkg.Request((await Db.instance()).pool);
    const response = await request
      .input('user_name', pkg.VarChar, username)
      .input('acc_num', pkg.Int, acc_num)
      .query(`select a.id, a.user_id, a.number, a.name, a.type, a.balance, a.status
                from account as a
                inner join users u on a.user_id = u.id
                where u.name = @user_name and a.number = @acc_num`);
    return await Account.parseOne(response.recordset);
  }

  public static async readById(id: number): Promise<Account | null> {
    const request = new pkg.Request((await Db.instance()).pool);
    const response = await request
      .input('id', pkg.Int, id)
      .query(`select id, user_id, number, name, type, balance, status
                from account as a
                where a.id = @id`);
    return await Account.parseOne(response.recordset);
  }

  public static async create(user: number, name: string, type: string): Promise<Account> {
    const request = new pkg.Request((await Db.instance()).pool);
    const res = await request
      .input('user', pkg.Int, user)
      .input('name', pkg.VarChar, name)
      .input('type', pkg.VarChar, type)
      .output('account_id', pkg.Int)
      .execute('open_account');
    return (await Account.readById(res.output['account_id']))!;
  }
}

export class PaymentRaw {
  id: number;
  timestamp: Date | string;
  description: string | null;
  from: number;
  to: number;
  amount: number;

  constructor(id: number, timestamp: Date, description: string | null, from: number, to: number, amount: number) {
    this.id = id;
    this.timestamp = timestamp;
    this.description = description;
    this.from = from;
    this.to = to;
    this.amount = amount;
  }

  public static isPaymentRaw(obj: any): obj is PaymentRaw {
    return (
      obj &&
      typeof obj.id === 'number' &&
      (obj.timestamp instanceof Date || !isNaN(Date.parse(obj.timestamp))) &&
      (typeof obj.description === 'string' || obj.description === null) &&
      typeof obj.from === 'number' &&
      typeof obj.to === 'number' &&
      typeof obj.amount === 'number'
    );
  }

  public static fromExported(obj: unknown): PaymentRaw | null {
    if (!PaymentRaw.isPaymentRaw(obj)) {
      return null;
    }
    const timestamp = obj.timestamp instanceof Date ? obj.timestamp : new Date(Date.parse(obj.timestamp))
    return new PaymentRaw(
      obj.id,
      timestamp,
      obj.description,
      obj.from,
      obj.to,
      obj.amount,
    );
  }
  
  public static async readRaw(): Promise<PaymentRaw[]> {
    const request = new pkg.Request((await Db.instance()).pool);
    const response = await request
      .query('select id, timestamp, description, from_acc, to_acc, amount from payment');
    let res = [];
    for (const row of response.recordset) {
      res.push(new PaymentRaw(
        row['id'],
        row['timestamp'],
        row['description'],
        row['from_acc'],
        row['to_acc'],
        row['amount'],
      ));
    }
    return res;
  }

  public static async truncate(transaction?: pkg.Transaction) {
    const request = transaction ? transaction.request() : new pkg.Request((await Db.instance()).pool)
    await request.query('delete from payment');
  }

  public async insertRaw(transaction?: pkg.Transaction) {
    const request = transaction ? transaction.request() : new pkg.Request((await Db.instance()).pool)
    await request
      .input('id', pkg.Int, this.id)
      .input('timestamp', pkg.DateTime, this.timestamp)
      .input('description', pkg.VarChar, this.description)
      .input('from_acc', pkg.Int, this.from)
      .input('to_acc', pkg.Int, this.to)
      .input('amount', pkg.Decimal(38,3), this.amount)
      .query('set identity_insert payment on; insert into payment (id, timestamp, description, from_acc, to_acc, amount) values (@id, @timestamp, @description, @from_acc, @to_acc, @amount)');
  }
};

export class Payment {
  id: number;
  timestamp: Date;
  description: string | null;
  from: Account;
  to: Account;
  amount: number;

  private constructor(id: number, timestamp: Date, description: string | null, from: Account, to: Account, amount: number) {
    this.id = id;
    this.timestamp = timestamp;
    this.description = description;
    this.from = from;
    this.to = to;
    this.amount = amount;
  }

  public static async readByAccount(user: number, number: number): Promise<Payment[]> {
    const request = new pkg.Request((await Db.instance()).pool);
    const response = await request
      .input('user_id', pkg.Int, user)
      .input('account_number', pkg.Int, number)
      .query(`select p.id, p.timestamp, p.description, p.from_acc, p.to_acc, p.amount
                from payment p
                inner join account to_acc on p.to_acc = to_acc.id
                inner join account from_acc on p.from_acc = from_acc.id
                where (to_acc.user_id = @user_id and to_acc.number = @account_number)
                  or (from_acc.user_id = @user_id and from_acc.number = @account_number)`);
    let res = [];
    let accounts: Record<number, Account> = {}
    for (const row of response.recordset) {
      let from_acc;
      const from_id: number = row['from_acc'] as number
      if (accounts[from_id]) {
        from_acc = accounts[from_id];
      } else {
        from_acc = await Account.readById(row['from_acc']);
        accounts[from_id] = from_acc!;
      }
      let to_acc;
      const to_id: number = row['to_acc'] as number
      if (accounts[to_id]) {
        to_acc = accounts[to_id];
      } else {
        to_acc = await Account.readById(row['to_acc']);
        accounts[to_id] = to_acc!;
      }
      res.push(new Payment(
        row['id'],
        row['timestamp'],
        row['description'],
        from_acc!,
        to_acc!,
        row['amount'],
      ));
    }
    return res;
  }
}

export class Log {
  id: number;
  timestamp: Date;
  type: string;
  message: string;
  user: User | number | null;
  account: Account | number | null;

  private constructor(id: number, timestamp: Date, type: string, message: string, user: User | number | null, account: Account | number | null) {
    this.id = id;
    this.timestamp = timestamp;
    this.type = type;
    this.message = message;
    this.user = user;
    this.account = account;
  }

  public static async readAll(): Promise<Log[]> {
    const request = new pkg.Request((await Db.instance()).pool);
    const response = await request
      .query(`select l.id, l.timestamp, t.type, l.message, l.user_id, l.account
                from log l
                inner join log_msg_type t on l.type = t.id`);
    let res = [];
    let accounts: Record<number, Account | number | null> = {}
    let users: Record<number, User | number | null> = {}
    for (const row of response.recordset) {
      let user = null;
      if (row['user_id']) {
        if (users[row['user_id']]) {
          user = users[row['user_id']]
        } else {
          user = await User.readById(row['user_id']) ?? row['user_id']
          users[row['user_id']] = user
        }
      }
      let account = null;
      if (row['account']) {
        if (accounts[row['account']]) {
          account = accounts[row['account']]
        } else {
          account = await Account.readById(row['account']) ?? row['account']
          accounts[row['account']] = account
        }
      }

      res.push(new Log(
        row['id'],
        row['timestamp'],
        row['type'],
        row['message'],
        user,
        account,
      ));
    }
    return res;
  }
}

export class UserWithTotalBalance {
  id: number;
  name: string;
  total_balance: number;

  private constructor(id: number, name: string, total_balance: number) {
    this.id = id;
    this.name = name;
    this.total_balance = total_balance;
  }

  public static async readAll(): Promise<UserWithTotalBalance[]> {
    const request = new pkg.Request((await Db.instance()).pool);
    const response = await request.query('select * from users_with_total_balance');
    let res = [];
    for (const row of response.recordset) {
      res.push(new UserWithTotalBalance(
        row['id'],
        row['name'],
        row['total_balance'],
      ));
    }
    return res;
  }
}
export class UserWithoutAccounts {
  id: number;
  name: string;

  private constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  public static async readAll(): Promise<UserWithoutAccounts[]> {
    const request = new pkg.Request((await Db.instance()).pool);
    const response = await request.query('select * from users_without_accounts');
    let res = [];
    for (const row of response.recordset) {
      res.push(new UserWithoutAccounts(
        row['id'],
        row['name'],
      ));
    }
    return res;
  }
}
