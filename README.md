# Egg bank

## Installation steps

1. Connect to Microsoft SQL Server using SQL Server Management Studio.
1. Create a new database.
1. Open a new Query.
1. Paste the script within `database.sql` into the query window.
1. Execute the query.
   - This will create a new database along with a user for the web server
     with the credentials `db_user` and `S3cret.P3ssword`
1. Update configuration options in the `.env` file.
   - For all configuration options see [configuration](#configuration).
1. Install dependencies with `npm install`.

## Running

1. Start the server with `npm run dev`.
   - This will make the server accessible on port 5173 meaning that you can connect to it
     in a web browser on the address <http://localhost:5173>.

## Configuration

All configuration is stored in the file `.env` in the project directory.
Configuration is written in the format of `KEY=value` with each key-value
pair being on its own line.

| Config key | Data type | Explanation | Example |
| ---------- | --------- | ----------- | ------- |
| DATABASE_USER | string | The database user under which the web server will connect to. | db_user |
| DATABASE_PASSWORD | string | Password of the database user. | S3cret.P4ssword |
| DATABASE_SERVER | string | Location of the server, can be an IP address with `tcp:` prefix or a hostname. | localhost, tcp:127.0.0.1 |
| DATABASE | string | Name of the database. You probably want to leave this as is | egg_bank |
| DATABASE_PORT | integer | The port of the database | 1433 |
| TRUSTSERVERCERTIFICATE | yes/no | Whether to trust the database server's certificate, even though it might be self signed | true |
| ENCRYPT| yes/no | Whether to encrypt connection | no |
