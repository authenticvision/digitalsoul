# DigitalSoul

A Service to design and serve Digital Assets for [Asset-Bound NFTs (ERC-6956)](https://ercs.ethereum.org/ERCS/erc-6956). 

Designed to work with [Meta Anchor Technology](https://metaanchor.io).

This service provides:
- The **Landing page** for the MetaAnchor-App, which allows to display and transfer DigitalSoul-NFTs
- The **DigitalSoul-Studio**, which allows you to manage your Smart Contract and create and manage your DigitalSoul-NFTs. 


## Support

Find us on [Discord](https://discord.com/invite/ddsCeG8Z5d)

## Choosing hosted vs self-hosted
With your DigitalSoul-NFTs, you can chose whether you want to use the 

### Hosted
The latest released version of DigitalSoul Studio is available as a hosted instance at https://digitalsoul.metaanchor.io 

**Benefits**:
- Maintained and updated on a regular basis
- No webserver needed
- Automated backups and monitoring

**Getting started**: 
- Head over to https://digitalsoul.metaanchor.io and log in with the wallet owning your Smart-Contract. 
- Don't have a DigitalSoul Smart Contract yet? Apply for DevKit or Startup Kit on https://metaanchor.io

### Self-hosted
You can self-host DigitalSoul-Studio from this repository on your own web-server.

**Benefits**:
- Enables you to implement your own features and landing-page designs
- Full control over your data

**Getting started**: 
- Some automatization features for self-hosted are still under development. If you want to self-host already, hit us up in our [Discord](https://discord.com/invite/ddsCeG8Z5d)


# Development
This section concerns people who want to implement their own features.

## Codebase

### Technologies

The project is **full-stack Javascript**: meaning that the whole frontend is
powered by React, via Next.js, and all APIs are also built with it as well.
Here's a list of all technologies we use:

- **PostgreSQL**: Data storage
- **NextAuth**: For session & authentication
- **Prisma**: Persistence layer
- **React**: Frontend

## Hacking

The first step to run DigitalSoul Studio locally is to grab a copy of the repository via
Git:

`git clone https://github.com/authenticvision/digitalsoul`

*Tip: it is preferable to use SSH to connect, since it'll give you the option to
push in case you're a maintainer.*

### Preparing the environment

There are a couple of major steps to get your instance running:

1. **Install Docker & docker-compose**: See the [Docker documentation][docker]
   for instructions on installing it with your OS.
2. **Install the MetaMask Browser Extension**: For signin, at the moment, we
   only provide support for authentication with MetaMask. [See the instructions
   for your browser here][metamask]
3. **Apply for a DevKit**: You'll require having a MetaAnchor API Key for
   communicating with the MetaAnchor API. [Apply for one here][devkit]

[docker]: https://docs.docker.com/get-docker
[metamask]: https://metamask.io/download
[devkit]: https://www.authenticvision.com/mac

After completing these steps, you'll be ready to move on 💯

### Getting the instance up

#### **⚠️ Warning**

At the moment, the project is under heavy development. Stuff might break and the
database schema is not fully completed and can go through changes. YMMV.

#### Fill the environment variables

First of all, we'll have to place our MetaAnchor key as environment variables.
There's a couple of ways to do that, we'll use the `.env` approach. So let's
copy the `.env.sample` file into a local, git-ignored file, on your nearest
terminal tab, inside the project folder:

`cp .env.sample .env.local`

You should also copy the PostgreSQL database config file as well:

`cp .db.env.sample .db.env`

Open both configuration files on your favorite editor and fill them in.

#### Build the containers

Now we need to get the containers ready to go, using docker. For production:

`docker-compose -f docker-compose.prod.yml build`

For development:

`docker-compose build`

This might take a while, it'll grab the PostgreSQL image and build another image
for our application to live. After that's done, we can spin up our instance:

`docker-compose -f docker-compose.prod.yml up`

For development:

`docker-compose up`

Getting our instance up, will generate our Prisma client, run the pending
migrations and get our server up.

*Tip: use the -d flag to run the detached mode, you can follow the logs later by
using `docker-compose logs -f`*

Great, now the digitalsoul instance is running under `http://localhost:3000`.

*Tip: If you ever need to change the DB, you can (1) spin up a shell inside the
digitalsoul container: `docker-compose exec digitalsoul sh` (2) do a Prisma's push
command, optionally forcing a reset of the data: `yarn run db:push` or `yarn run
db:reset`*

### Running tests
With a running instance, execute `docker compose exec digitalsoul npm run test`

## Considerations for production deployment
For production use, you obviously need persistent (and backup-able) data storage.
`docker-compose-prod.yml` therefore mounts `./ds-data` and `./db-data`, which should
be local filesystems, which are backed up regularily. These are snapshots of your DB
NFT binary data (such as images, videos and other media files)

## License

Licensed under the terms of the [MIT License][mit]. Check the `LICENSE` file inside this repository for more details.

[mit]: https://opensource.org/license/MIT
