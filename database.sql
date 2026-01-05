drop database if exists egg_bank;
go
create database egg_bank collate Latin1_General_CS_AS_KS_WS;
go
use egg_bank;

create table users (
    id int identity(1,1) primary key,
    name varchar(50) not null unique,
    password varchar(50) not null,
    admin bit not null default(0),
);

create table account (
    id int identity(1,1) primary key,
    user_id int foreign key references users(id) not null,
    number int not null check(number > 0),
    name varchar(50) not null,
    type varchar(30) not null default('basic') check(type in ('basic', 'savings')),
    status varchar(15) not null check(status in ('active', 'disabled')),
    balance decimal(38, 3) not null default(0.0),
);

create table payment (
    id int identity(1,1) primary key,
    timestamp datetime not null default(getdate()),
    description varchar(50) null,
    from_acc int foreign key references account(id) not null,
    to_acc int foreign key references account(id) not null,
    amount decimal(38, 3) not null check(amount > 0),
);

create table log_msg_type (
    id int identity(1,1) primary key,
    type varchar(30) not null unique,
);

create table log (
    id int identity(1,1) primary key,
    timestamp datetime not null default(getdate()),
    type int foreign key references log_msg_type(id) not null,
    message varchar(80) not null,
    user_id int null default(null),
    account int null default(null),
);

go

create view interest as select id, balance * 0.005 as interest from account where type = 'savings' and status = 'active';
go
create view users_with_total_balance
    as select u.id, u.name, sum(a.balance) as total_balance
        from users u
        inner join account a on a.user_id = u.id
        group by u.id, u.name;
go
create view users_without_accounts
    as select u.id, u.name
        from users u
        left join account a on a.user_id = u.id
        group by u.id, u.name
        having count(a.id) = 0;

go

insert into users (name, password, admin) values ('admin', 'Hunter12', 'true'), ('EggBank', '*******', 'true');
insert into account (user_id, number, name, type, status, balance) values (2, 1, 'Egg Bank', 'basic', 'active', 0);
insert into log_msg_type (type) values ('user created'), ('user deleted'), ('account opened'), ('account closed'), ('transferred funds'), ('added funds');

go

create trigger log_added_users on users for insert as begin
    set xact_abort on;
    set nocount on;
    declare @created int = (select id from log_msg_type where type = 'user created');
    insert into log (type, message, user_id) select @created, 'added user ' + name, id from inserted;
end

go

create trigger log_opened_acount on account for insert as begin
    set xact_abort on;
    set nocount on;
    declare @created int = (select id from log_msg_type where type = 'account opened');
    insert into log (type, message, user_id, account)
        select @created, 'opened ' + type + ' account', user_id, id
        from inserted;
end

go

create or alter procedure auth_user
    @name varchar(50), @password varchar(50), @authed int out, @admin bit out
as begin
    set xact_abort on;
    set nocount on;
    select @authed = id, @admin = admin from users where name = @name and password = @password;
end;

go

create or alter procedure transfer
    @from int, @to int, @amount decimal(38,3), @message varchar(50) = null
as begin
    set xact_abort on;
    set nocount on;
    begin transaction;
    declare @usable_funds decimal(38,3) = (select balance from account where id = @from);
    if @usable_funds < @amount begin
        rollback;
        throw 52000, 'not enough funds in account', 1;
    end;

    insert into payment (from_acc, to_acc, amount, description) values (@from, @to, @amount, @message);
    update account set balance = balance - @amount where id = @from;
    update account set balance = balance + @amount where id = @to;

    declare @user_id int = (select user_id from account where id = @from);
    declare @log_msg_type int = (select id from log_msg_type where type = 'transferred funds');
    declare @log_msg varchar(80) = 'transferred ' + cast(@amount as varchar) + ' from ' + cast(@from as varchar) + ' to ' + cast(@to as varchar);
    if @message is not null begin
        set @log_msg = 'transferred ' + cast(@amount as varchar) + ': ' + @message;
    end
    insert into log (type, message, user_id, account)
        values (@log_msg_type, @log_msg, @user_id, @from);
    commit transaction;
end;

go

create or alter procedure add_funds
    @to int, @amount decimal(38, 3)
as begin
    set xact_abort on;
    set nocount on;
    begin transaction;
    update account set balance = balance + @amount where id = @to;

    -- log transaction
    declare @user_id int = (select user_id from account where id = @to);
    declare @log_msg_type int = (select id from log_msg_type where type = 'added funds');
    insert into log (type, message, user_id, account)
        values (@log_msg_type, 'added ' + cast(@amount as varchar) + ' to account', @user_id, @to);
    commit transaction;
end;

go

create or alter procedure open_account
    @user int, @name varchar(50), @type varchar(20), @account_id int out
as begin
    set xact_abort on;
    set nocount on;
    begin transaction;

    declare @number int = (select count(*) + 1 from account where user_id = @user);

    insert into account (user_id, name, number, type, status) values (@user, @name, @number, @type, 'active');
    set @account_id = (select SCOPE_IDENTITY());
    -- Give first account bonus to user
    if @number = 1 begin
        execute add_funds @to = 1, @amount = 50;
        execute transfer @from = 1, @to = @account_id, @amount = 50, @message = 'A gift for first time Egg Bank users';
    end
    commit transaction;
end;

go

create or alter procedure add_interest
as begin
    set xact_abort on;
    set nocount on;
    begin transaction;
    declare @total_interest decimal(38,3) = (select sum(interest) from interest);
    if @total_interest = 0.0 begin
        rollback;
        return; -- early return since there's no interest to add
    end
    execute add_funds @to = 1, @amount = @total_interest;

    drop table if exists #interest_temp;
    declare @account_id int;

    select * into #interest_temp from interest;

    select top 1 @account_id = id from #interest_temp;
    while @@rowcount <> 0
    begin
        declare @interest decimal(38,3) = (select interest from #interest_temp where id = @account_id);
        if @interest > 0 begin
            execute transfer @from = 1, @to = @account_id, @amount = @interest, @message = 'Added interest';
        end
        delete from #interest_temp where id = @account_id;
        select top 1 @account_id = id from #interest_temp;
    end

    drop table #interest_temp;
    commit transaction;
end

go

-- NOTE: Since SQLAgent isn't available on school PCs this code is not able
--       to be used. Instead calling of the add_interest procedure will be done
--       from the server.
-- Create a job to add funds to every savings account,
-- use msdb;
-- go
-- execute sp_configure 'show advanced options', 1;
-- go
-- reconfigure;
-- go
-- execute sp_configure 'Agent XPs', 1;
-- go
-- reconfigure;
-- go
-- execute sp_delete_job @job_name = 'Add funds to savings accounts', @delete_unused_schedule = 1;
-- go
-- execute sp_add_job @job_name = 'Add funds to savings accounts';
-- go
-- execute sp_add_jobstep
--     @job_name = 'Add funds to savings accounts',
--     @step_name = 'Increase account balance',
--     @command = 'execute add_interest',
--     @database_name = 'egg_bank',
--     @retry_attempts = 3;
-- go
-- execute sp_add_schedule
--     @schedule_name = 'Every5Minutes',
--     @freq_type = 4, -- dayly
--     @freq_interval = 1, -- 1 day
--     @freq_subday_type = 4, -- minutes
--     @freq_subday_interval = 5; -- 5 minutes

-- go
-- execute sp_attach_schedule
--     @job_name = 'Add funds to savings accounts',
--     @schedule_name = 'Every5Minutes';
-- go
-- execute sp_add_jobserver @job_name = 'Add funds to savings accounts';
-- go
-- execute sp_start_job 'Add funds to savings accounts';
-- go
-- use egg_bank;
-- go

go

if exists(
    select * from master.sys.server_principals
        where name = 'db_user' and type = 'S'
) begin
    drop login db_user;
end
if exists(
    select * from sys.database_principals
        where name = 'db_user' and type = 'S'
) begin
    drop user db_user;
end
create login db_user with password = 'S3cret.P4ssword';
create user db_user for login db_user;

-- tables
deny alter, delete on log to db_user;
deny alter, insert, update, delete on log_msg_type to db_user;
grant alter, select, insert, delete on users to db_user;
grant alter, select, insert, delete on account to db_user;
grant alter, select, insert, delete on payment to db_user;
grant select, insert on log to db_user;
grant select on log_msg_type to db_user;

-- views
deny alter on interest to db_user;
deny alter on users_with_total_balance to db_user;
deny alter on users_without_accounts to db_user;
grant select on interest to db_user;
grant select on users_with_total_balance to db_user;
grant select on users_without_accounts to db_user;

-- procedures
deny alter on auth_user to db_user;
deny alter on transfer to db_user;
deny alter on add_funds to db_user;
deny alter on open_account to db_user;
deny alter on add_interest to db_user;
grant execute on auth_user to db_user;
grant execute on transfer to db_user;
grant execute on add_funds to db_user;
grant execute on open_account to db_user;
grant execute on add_interest to db_user;

go
