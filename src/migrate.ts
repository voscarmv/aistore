#!/usr/bin/env node
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { program } from 'commander';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

program.name('migrate')
    .description('Migrate the postgres database for server')
    .option('-u, --username <string>', 'DB Username')
    .option('-p, --password <string>', 'DB Password')
    .option('-h, --host <string>', 'DB Host', 'localhost')
    .option('-n, --name <string>', 'DB Name')
    .option('-d, --dburl <string>', 'DB URL, e.g. postgres://username:password@host/database')

program.parse();
const options = program.opts();

const host = options.host ? options.host : 'localhost';
const dbUrl = options.dburl ? options.dburl : `postgres://${options.username}:${options.password}@${host}/${options.name}`;

(async () => {
    try {
        const db = drizzle(dbUrl);
        console.log(`${__dirname}/drizzle`);
        await migrate(db, { migrationsFolder: `${__dirname}/drizzle` });
        console.log('Done.')
        process.exit(0);
    } catch (e: any) {
        console.log('Error.');
        console.log(e.message);
        process.exit(1);
    }
})();