# Solid Calendar Orchestrator Core

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

## Running service

1. Install dependencies: `npm i`

2. Run the service: `npm run build && npm run start`

The orchestrator will retrieve and update the calendar data in the *registered* users' Pods from time to time. The configuration is fetched from users' Pods (location above).

To register users, either use the API or use the companion [Configure-er App](../app).

## Configure

Note the software is in development, and APIs are subject to change. The recommended way is to use the companion App to configure.

### Use the companion App

This is the recommended way. Set up the [App](../app) by following its document, and navigate to the browser to use.

### CLI example for using API

Here are some example of using the API from cli.

> They use HTTPie, a more human-friendly cli HTTP client. We give one example also in curl; and the rest is similar.

Assume the following information:

- Orchestrator url: `http://localhost:3000`
- Webid: `https://my.pod/user1/profile/card#me`
- Issuer: `https://my.pod/`
- Solid login
   - username: `user1_email@a.b`
   - password: `mypassword`
- Calendar (ics) url: `https://some.service/my_calendar.ics`

Note the `issuer` field is always optional.

#### Register a user

```
http POST localhost:3000/user webid=https://my.pod/user1/profile/card#me issuer=https://my.pod/ email=user1_email@a.b password=mypassword
```

Or (using curl)

```
curl -H “Content-Type: application/json” -X POST -d webid=https://my.pod/user1/profile/card#me -d issuer=https://my.pod/ -d email=user1_email@a.b -d password=mypassword http://localhost:3000
```

#### Get user information

```
http GET localhost:3000/user webid=https://my.pod/user1/profile/card#me
```

#### Set user's calendar URL

```
http POST localhost:3000/user webid=https://my.pod/user1/profile/card#me issuer=https://my.pod/ cal_url=https://some.service/my_calendar.ics
```

#### Update user's calendar data

```
http POST localhost:3000/user webid=https://my.pod/user1/profile/card#me issuer=https://my.pod/
```

## API

See [swagger.yaml](swagger.yaml) for the documented API.
You may use any Swagger UI for viewing it, e.g.[the official example](https://swagger.io/tools/swagger-ui/).

## TODO

> Here are some detailed stuffs.
> For main TODOs in higher level, please see [README on the parent directory](../README.md).

- [ ] Customize port and pathPrefix