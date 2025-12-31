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
}

export class User {
  id: number | null;
  name: string;
  password: string;

  constructor(name: string, password: string, id?: number) {
    this.id = id ?? null;
    this.name = name;
    this.password = password;
  }

  public static async readById(id: number): Promise<User | null> {
    const request = new pkg.Request((await Db.instance()).pool)
    const res = await request
      .input('id', pkg.Int, id)
      .query('select id, name, password from users where id = @id');
    if (res.recordset.length === 0) {
      return null;
    }
    const row = res.recordset[0];
    const user = new User(row['name'], row['password'], row['id']);
    return user;
  }

  public static async readAll(): Promise<User[]> {
    const request = new pkg.Request((await Db.instance()).pool)
    const response = await request
      .query('select id, name, password from users');
    let users = []
    for (const row of response.recordset) {
      users.push(new User(
        row['name'],
        row['password'],
        row['id'],
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
      .query('insert into users (name, password) values (@name, @password); select SCOPE_IDENTITY() as id;')
    this.id = res.recordset[0].id
  }
  private async update() {
    const request = new pkg.Request((await Db.instance()).pool)
    await request
      .input('id', pkg.Int, this.id)
      .input('name', pkg.VarChar, this.name)
      .input('password', pkg.VarChar, this.password)
      .query('update users set name=@name, password=@password where id=@id')
  }
  public async delete() {
    if (!this.id) {
      return
    }
    const request = new pkg.Request((await Db.instance()).pool)
    await request
      .input('id', pkg.Int, this.id)
      .query('delete from users')
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

  public static async readByUser(id: number): Promise<Account[]> {
    const request = new pkg.Request((await Db.instance()).pool);
    const response = await request
      .input('userid', pkg.Int, id)
      .query(`select id, user_id, number as num, name, type, balance, status
                from account
                where user_id = @userid`);
    let res = [];
    for (const row of response.recordset) {
      res.push(new Account(
        row['id'],
        (await User.readById(row['user_id']))!,
        row['num'],
        row['name'],
        row['type'],
        row['balance'],
        row['status'],
      ));
    }
    return res;
  }

  public static async readByUserAndNumber(user: number, acc_num: number): Promise<Account | null> {
    const request = new pkg.Request((await Db.instance()).pool);
    const response = await request
      .input('userid', pkg.Int, user)
      .input('acc_num', pkg.Int, acc_num)
      .query(`select id, user_id, number as num, name, type, balance, status
                from account
                where user_id = @userid and number = @acc_num`);
    if (response.recordset.length === 0) {
      return null;
    }
    const row = response.recordset[0];
    return new Account(
      row['id'],
      (await User.readById(row['user_id']))!,
      row['num'],
      row['name'],
      row['type'],
      row['balance'],
      row['status'],
    );
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
    if (response.recordset.length === 0) {
      return null;
    }
    const row = response.recordset[0];
    return new Account(
      row['id'],
      (await User.readById(row['user_id']))!,
      row['num'],
      row['name'],
      row['type'],
      row['balance'],
      row['status'],
    );
  }

  public static async readById(id: number): Promise<Account | null> {
    const request = new pkg.Request((await Db.instance()).pool);
    const response = await request
      .input('id', pkg.Int, id)
      .query(`select id, user_id, number as num, name, type, balance, status
                from account as a
                where a.id = @id`);
    if (response.recordset.length === 0) {
      return null;
    }
    const row = response.recordset[0];
    return new Account(
      row['id'],
      (await User.readById(row['user_id']))!,
      row['num'],
      row['name'],
      row['type'],
      row['balance'],
      row['status'],
    );
  }

  public static async create(user: number, name: string, type: string): Promise<Account> {
    const request = new pkg.Request((await Db.instance()).pool);
    const res = await request
      .input('user', pkg.Int, user)
      .input('name', pkg.VarChar, name)
      .input('type', pkg.VarChar, type)
      .output('account_id', pkg.Int)
      .execute('open_account');
    return await Account.readById(res.output['account_id']);
  }
}

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
    for (const row of response.recordset) {
      res.push(new Payment(
        row['id'],
        row['timestamp'],
        row['description'],
        await Account.readById(row['from_acc']),
        await Account.readById(row['to_acc']),
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
    for (const row of response.recordset) {
      let user = null;
      if (!!row['user_id']) {
        user = await User.readById(row['user_id']) ?? row['user_id']
      }
      let account = null;
      if (!!row['account']) {
        account = await Account.readById(row['account']) ?? row['account']
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
