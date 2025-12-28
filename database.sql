drop database if exists egg_bank;
go
create database egg_bank;
go
use egg_bank;

create table users (
    id int identity(1,1) primary key,
    name nvarchar(50) not null unique,
    password nvarchar(50) not null,
    admin bit not null default(0),
);

create table account_type (
    id int identity(1,1) primary key,
    type nvarchar(20) not null unique,
);

create table account (
    id int identity(1,1) primary key,
    user_id int foreign key references users(id) not null,
    name nvarchar(20) not null,
    type int foreign key references account_type(id) not null,
    status nvarchar(15) not null check(status in ('active', 'disabled')),
    balance decimal(38, 3) not null,
);

create table payment (
    id int identity(1,1) primary key,
    timestamp datetime not null default(getdate()),
    from_acc int foreign key references account(id) not null,
    to_acc int foreign key references account(id) not null,
    amount decimal(38, 3) not null check(amount > 0),
);

create table log_msg_type (
    id int identity(1,1) primary key,
    type nvarchar(30) not null unique,
);

create table log (
    id int identity(1,1) primary key,
    timestamp datetime not null default(getdate()),
    type int foreign key references log_msg_type(id) not null,
    message nvarchar(50) not null,
    user_id int null default(null),
    account int null default(null),
);

go

insert into users (name, password, admin) values ('admin', 'Hunter12', 'true');
insert into account_type (type) values ('basic'), ('savings');
insert into log_msg_type (type) values ('user created'), ('user deleted'), ('account opened'), ('account closed');

go

create trigger log_added_users on users for insert as begin
    declare @created int = (select id from log_msg_type where type = 'user created');
    insert into log (type, message, user_id) select @created, 'added user ' + name, id from inserted;
end

go

create or alter procedure auth_user
    @name nvarchar(50), @password nvarchar(50), @authed int out
as begin
    set @authed = (select id from users where name = @name and password = @password);
end;

go

