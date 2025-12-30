# Egg bank

## Installation steps

1. Connect to Microsoft SQL Server using SQL Server Management Studio.
1. Start the SQL Server Agent service if it is not running.
   - See <https://database.guide/enable-sql-server-agent-via-ssms/> for a guide.
1. Execute script within `database.sql` in SQL Server Management Studio.
   - This will create the database on its own, you do not need to do it manually.
1. Update configuration options in the `.env` file.
   - For all configuration options see [config](#config).
1. Install dependencies with `npm install`.
1. Run the server with `npm run dev`.
   - This will make the server accessible on port 5173 meaning that you can connect to it
     in a web browser on the address <http://localhost:5173>.

## Config

All configuration is stored in the file `.env` in the project directory.

| Config key | Data type | Explanation | Example |
| ---------- | --------- | ----------- | ------- |
| DATABASE_USER | string | The database user under which the web server will connect to. | sa |
| DATABASE_PASSWORD | string | Password of the database user. | S3cret |
| DATABASE_SERVER | string | Location of the server, can be an IP address or a hostname. | localhost |
| DATABASE_PORT | integer | The port of the database | 1433 |
| DATABASE | string | Name of the database. You probably want to leave this as is | egg_bank |
| TRUSTSERVERCERTIFICATE | bool | Whether to trust the database server's certificate, even though it might be self signed | true |
