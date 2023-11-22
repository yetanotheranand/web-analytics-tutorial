---
title: Creating your own Web Analytics tool
layout: page
nav_order: 6
---

# Writing your own Web Analytics script
{: .no_toc }

## Prerequisites
- JavaScript Knowledge: Understand the basics of JavaScript, especially DOM manipulation. Familiarity with asynchronous programming and callbacks.
- Beacon API: This is used for sending data asynchronously to a web server without waiting for the server's response.
- Web Analytics Basics: Have a basic understanding of web analytics concepts such as page views, events, conversions, bounce rate, etc.
- Data Privacy and Anonymization: Understand the importance of user privacy and how to handle and anonymize user data.

## Technology Stack:
- Package Manager (npm)
- JavaScript: For client-side tracking.
- Beacon API: For sending data to the server asynchronously.
- Server-Side Technology(node): For receiving and processing analytics data.
- MongoDB: For saving events for data analytics

## Approach

1. Identify what data is to be sent

2. Identify how frequently should the data be sent

3. Attaching event listeners to the events, and capturing the required data

4. Creating a script to send data payload using Beacon API

5. Batching up events to avoid frequent data transmission

6. Have a error handling mechanism

7. Establishing server to receive the data and perform processing like user segmentation

8. Wrapping all the client-side script in a library

## Implementation

### Database Setup

Setup MongoDB cloud instance by following steps [here](https://www.mongodb.com/docs/atlas/getting-started/).

This instance will be used to persist all the analytics related events.

The basic steps using Atlas UI[^4] are:
- Create an Atlas account
- Deploy a free cluster
- Add your connection IP address to your IP access list
- Create a database user for your cluster
- Connect to your cluster
- Create a database `analytics`

Locate the connection string for your database by following [these](https://www.mongodb.com/basics/mongodb-connection-string#:~:text=How%20to%20get%20your%20MongoDB,connection%20string%20for%20your%20cluster.) steps.

### Server Setup

Now we can focus on building our server to receive payloads from our website and persisting the data to the MongoDB instance.

1. Create a new directory for the server

```
mkdir demo && cd demo
```

2. Initialize the folder with npm

```
npm init
```

3. Declare and install the required dependencies

```
npm i express mongoose nodemon dotenv
```

4. Create the starting point of the application and configure `node start` script in `package.json`

```
touch index.js .env
```
```
"scripts": {
    "start": "nodemon index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
},
```

5. Configure your `MONGODB_CONNECTION_STRING=mongodb+srv://<user>:<password>.<instance>.mongodb.net/analytics?retryWrites=true&w=majority` in the `.env` file. This connection string[^5] was obtained previously while setting up the MongoDB instance.

6. Use `dotenv`, `express` and `mongoose` in your `index.js`

```
const express = require('express');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

7. Create MongoDB connection from your server using `mongoose` client.

```
function connectDB() {
  const url = process.env.MONGODB_CONNECTION_STRING;

  try {
    mongoose.connect(url, {
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
  const dbConnection = mongoose.connection;
  dbConnection.once("open", (_) => {
    console.log(`Database is connected`);
  });

  dbConnection.on("error", (err) => {
    console.error(`Database connection error: ${err}`);
  });
  return dbConnection;
}
```

8. Listen on the configured `PORT=8080` in the `.env` file, and initialize the `dbClient` to connect to MongoDB instance.
```
let dbClient;
app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
  dbClient = connectDB();
});
```

9. Add routes to your server to handle traffic

```
app.get("/", (request, response) => {
  response.send({ message: "Server is running!" });
});
app.post("/analytics", async (request, response) => {
  // Request validation
  // Request processing
  // Save event to the database
  // Return response
  // Error handling
}
```

10. Accept `POST` request on `/analytics` endpoint to accept the event payload. This payload should reflect what you are sending from the `analytics.js` client present on your website.

```
try {
    const collection = dbClient.collection('advanced_project');
    const entry = request.body;
    if (isEmpty(entry.page) || isEmpty(entry.event) || isEmpty(entry.visitor) || isEmpty(entry.ts)) {
      response.sendStatus(400);
    }
    const record = {
      page: entry.page,
      event: entry.event,
      visitor: entry.visitor,
      event_ts: entry.ts,
      log_ts: new Date()
    };
    await collection.insertOne(record);
    response.sendStatus(201);
  } catch (e) {
    console.log(e);
    response.sendStatus(500);
  }
```

11. Start your server to serve traffic

```
npm start
```

### Client Setup



---
[^1]: [Beacon API](https://developer.mozilla.org/en-US/docs/Web/API/Beacon_API)

[^2]: [Page Lifecycle API](https://developer.chrome.com/articles/page-lifecycle-api/)

[^3]: [Strategies for Telemetry Exfiltration (aka Beaconing In Practice)](https://calendar.perfplanet.com/2020/beaconing-in-practice/)

[^4]: [MongoDB Atlas UI](https://www.mongodb.com/docs/atlas/getting-started/)

[^5]: [MongoDb Connection String](https://www.mongodb.com/basics/mongodb-connection-string#:~:text=How%20to%20get%20your%20MongoDB,connection%20string%20for%20your%20cluster.)
