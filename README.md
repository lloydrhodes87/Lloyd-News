# BE2-NC-Knews

## Northcoders News API

This is an API for NC-NEWS. An article based database where users can access and submit articles and comments as well as make updates and deletions to data.

---
## Getting Started


This is a guide to help you get set up with the API so that you can use it locally.

## prerequisites


- Node.js v10.9.0
- Postgres v10.5

## Installing

First cd into the location that you want to store the file and run the following commands in your terminal.

```
git clone https://github.com/lloydrhodes87/BE2-NC-Knews.git
cd BE2-NC-Knews
npm install
```

Then open the file in your preferred code editor.

In the package.json file you will find lots of handy ready made scripts to help with the setup process.

in the terminal run the following command

```
npm run create:config
```

This will create a knexfile.js which you will need to modify.

Change the client to 'pg' and the database name to nc_news

If you are using Linux then you will also need to add a username and password and make sure that this file is in git ignore.

A full example can be seen below.

```
 module.exports = {
  development: {
    client: 'pg',
    connection: {
      database: 'nc_news',
    },
    migrations: {
      directory: './db/migrations',
    },
    seeds: {
      directory: './db/seeds',
    },
  },
  test: {
    client: 'pg',
    connection: {
      database: 'nc_news_test',
    },
    migrations: {
      directory: './db/migrations',
    },
    seeds: {
      directory: './db/seeds',
    },
  },
};
```


For more information see knex documentation (https://knexjs.org/#Installation-node)

---

## running the development database from a browser or postman

in your terminal run the following command

```
npm run create:db:dev
npm run seed:run:dev
```

Then in your browser or using postman use localhost:9090 and try out some of the endpoints from the package json file.

---

## Running in test mode

in your terminal run the following command

```
npm run create:db
npm run seed:run
npm:test
```

### Running the tests

To see the available tests navigate to app.spec.js in the spec folder. All endpoints have been tested thorougly.

To run tests make sure you are in test mode in the command line

```
npm test
```

---

## Deployment

Hosted on [Heroku](nc-news-lrd.herokuapp.com)

## Built With

- Node - JS runtime
- Express - Web application framework
- Knex - SQL query builder
- PostgreSQL - Relational database

## Authors

- Lloyd Rhodes - [Github](https://github.com/lloydrhodes87)

## License

This project is licensed under the MIT License - see the LICENSE.md file for details

## Acknowledgments

Thanks to all the staff at northcoders and all of the other students in my cohort.
