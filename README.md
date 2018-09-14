## What is this?

Example project using [Objection.js](https://vincit.github.io/objection.js) and [Knex.js](https://knexjs.org/). Knex provides a query builder and migration tool and Objection is an ORM built on top of Knex.

## Usage

Running basic proof-of-concept test:

Start the API server:

```
npm run start
```

Run the "test client":

```
node client.js
```

## Migrations

Install knex cli:

```
npm install knex -g
```

To add a new migration:

```
knex migrate:make <migration name>
```

Run all migrations:

```
knex migrate:latest
```

## Testing

Simply run:

```
npm t
```

## Benefits

* Built-in migrations. Having solid migrations definitely a must.
* Built-in JSON validation schema support. Let's you have a description of what the schema looks like inside the actual model, too.
* Backend is switchable - can use sqlite3 for testing. Supports Postgres, MSSQL, MySQL, MariaDB, SQLite3, Oracle, or Amazon Redshift.
* Query builder - we don't need to write our own one. Can always fall back to raw queries where needed.
* Clearly defined relationships between the models. No guessing of how they are connected to the rest of the codebase.

## Drawbacks

* Opinionated query builder may end up getting in our way or causing performance issues.
* There's currently no way to have multiple migration directories. Ideally we could have each `*-core` define its own migrations, but I think we would need to define them all at the top level. I had been investigating lerna for managing the different repos, but I'm wondering whether we should just put them under plain directories in one repo and be done with it.
* Slight confusion with where validation should happen. You can enforce json schema validation at the model level, but obviously you can also create DB-level validation. Bit weird that it's split like that.
