import { SQLDatabase } from "encore.dev/storage/sqldb";

export default new SQLDatabase("postgres-temp", {migrations: "./migrations"});
