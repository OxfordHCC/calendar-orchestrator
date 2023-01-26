Solid Calendar Orchestrator Core

------

This directory contains the core code of the orchestrator. It has a CLI entry (`app.js`).

Currently the orchestrator contains basic but usable functionalities:

1. Register & de-register users through (RESTful) API

2. Request token from CSS to modify user's Pod

3. Store information into database / configuration
   
   1. Basic user information (list of users, etc) is stored as a JSON file `db.json`
      
      - Using JSON for prototying & data size is small
      
      - May need optimization in the future
   
   2- User-side configuration (e.g. calendar URL) is stored into user's Pod (`calendar_orchestrator/config.ttl`)

4- Update user calendar data in their Pods

# Usage

## From CLI

To use the CLI entry, do the following:

1. Install dependencies: `npm i`

2. Run the entry: `npm run build && npm run start`

The orchestrator will retrieve and update the calendar data in the registered users' Pods from time to time.

# API

> TODO.
> 
> See code for now.
