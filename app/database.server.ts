import sql from 'mssql'

export class Db {
  private static inst: Db | null;
  pool: ConnectionPool;

  private constructor() {}

  private static async create(): Db {
    let db = new Db();
    db.pool = new sql.ConnectionPool({
      user: 'sa',
      password: 'Hunter12',
      server: 'localhost',
      database: 'egg_bank',
      encrypt: false,
    });

    const res = await db.pool.connect();
    return db;
  }

  public static async instance(): Db {
    if (!Db.inst) {
      Db.inst = await Db.create();
    }
    return Db.inst;
  }

  public static async auth(name: string, password: string): int | null {
    const request = new sql.Request((await Db.instance()).pool)
    const res = await request
      .input('name', sql.NVarChar, name)
      .input('password', sql.NVarChar, password)
      .output('authed', sql.Int)
      .execute('auth_user')

    return res.output['authed']
  }
}

export class User {
  id: int | null;
  name: string;
  password: string;
  accounts: Account[];

  constructor(name: string, password: string) {
    this.id = null;
    this.name = name;
    this.password = password;
    this.accounts = [];
  }

  public async save() {
    if (!this.id) {
      await this.insert();
    } else {
      await this.update();
    }
  }
  private async insert() {
    const request = new sql.Request((await Db.instance()).pool)
    const res = await request
      .input('name', sql.NVarChar, this.name)
      .input('password', sql.NVarChar, this.password)
      .query('insert into users (name, password) values (@name, @password); select SCOPE_IDENTITY() as id;')
    this.id = res.recordset[0].id
  }
  private async update() {
    const request = new sql.Request((await Db.instance()).pool)
    await request
      .input('id', sql.Int, this.id)
      .input('name', sql.NVarChar, this.name)
      .input('password', sql.NVarChar, this.password)
      .query('update users set name=@name, password=@password where id=@id')
  }
  public async delete() {
    if (!this.id) {
      return
    }
    const request = new sql.Request((await Db.instance()).pool)
    await request
      .input('id', sql.Int, this.id)
      .query('delete from users')

  }
}

export  class Account {
  id: int | null;
  name: string;
  type: string;
  balance: number;
  status: string;
}

export class Payment {
  id: int;
  timestamp: Date;
  from: Account;
  to: Account;
  amount: number;
}
