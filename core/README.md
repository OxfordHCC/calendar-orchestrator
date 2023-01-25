Solid Calendar Orchestrator Core

------

This directory contains the core code of the orchestrator. It also has a CLI entry (`app.js`) for it.

Currently the orchestrator contains basic but usable functionalities:

1. Register & de-register users through (RESTful) API

2. Request token from CSS to modify user's Pod

3. Store information into database
   
   1. If running in node.js, it is stored as a JSON file `db.json`
      
      - Using JSON for prototying & data size is small
      
      - May need optimization in the future
   
   2. (Deprecated) If otherwise, it is stored into a prisma database
      
      - This is kept for now for historical reasons -- it used to be a part of the calendar main app
      
      - Will be removed in the future because it does not fit orchestrator's role

4- Update user calendar data in their Pods

# Usage

## From CLI

To use the CLI entry, do the following:

1. Install dependencies: `npm i`

2. Run the entry: `npm run start`

The orchestrator will retrieve and update the calendar data in the registered users' Pods from time to time.

## As library

> This is kept for historical usage. We are no longer working on this, and will remove it at some point.

To use it as a library:

1. Install dependencies in your application

2. (Optional) Generate prisma schema under this directory: `npx prisma generate`

3. Set up environmental variable for `DATABASE_URL`

# API

> TODO.
> 
> See code for now.
