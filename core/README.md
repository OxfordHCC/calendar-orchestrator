Solid Calendar Orchestrator Core

= = = = = = =



This directory contains the core code of the orchestrator. It also has a CLI entry (`orchestrator.js`) for it (currently limited functionality).



To use the CLI entry, do the following:

1. Install dependencies: `npm i`

2. (Optional) Generate prisma schema: `npx prisma generate`

3. Set up environmental variable for `DATABASE_URL`

4. Run the entry: `npm run start`



To use it as a library:

1. Install dependencies in your application

2. (Optional) Generate prisma schema under this directory: `npx prisma generate`

3. Set up environmental variable for `DATABASE_URL`
