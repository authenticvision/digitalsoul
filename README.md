# metaanchor-framework

A framework to work with Authentic Vision Meta Anchor (tm) Technology

## Development

We use [Prisma][prisma] to manage our DB. Currently, we're tied to PostgreSQL
due to it's wide support to JSON, Binary Data and being battle-tested. SQLite
can be offered in the future, but it's not on the roadmap at the moment.

As so, after building the containers and getting things up, we'll have to
push the DB to it's initial state, you can do so by firing up a shell inside the
metaanchor container, like so:

```
docker-compose exec metaanchor sh
```

This will dump you into a ash shell (which is the default shell for Alpine
Linux). Run the following prisma command:

```
npx prisma db push
```

Ideally, after we have reached a stable version of our schema, we'll switch to
migration whenever needing to do any changes to the DB. This will suffice for
now.

## License

Under the terms of the MIT License, check the LICENSE file for more information.
