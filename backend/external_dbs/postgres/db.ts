import { SQLDatabase } from "encore.dev/storage/sqldb";

// Cambiamos "postgres" a "notesdb" para siempre.
export default new SQLDatabase("notesdb", {migrations: "./migrations"});
