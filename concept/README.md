# Refurbish Concept
This gathers the rough concept of the metaanchor-framework

## Overall architecture

![Architecture Diagram](component_diagram.png)

The component diagram is a very rough view on how the metaanchor-framework (right part in dashed blue box) interacts with `https://router.metaanchor.io` and `https://api.metaanchor.io`

- `backend.myserver.com` should be NEST-JS
- `frontend.myserver.com` should be (???)
- `db.myserver.com` should be (???)

### Overall requirements
- The framework is [multi-tenant](https://en.wikipedia.org/wiki/Multitenancy). 
  - Tenants are defined as users logging in to `frontend.myserver.com/admin` with different wallets.
  - Tenants shall not have direct access to the database or the actual server, where services are running.
  - Tenants may be of the same or a different organization, i.e. work and configure the same or different smart contracts
  - TODO define how a server knows which tenants are permissible
- In a user-hosted setting, there is typically only one tenant
- Per default (if users do not host their own framework), all tenants will use a `metaanchor.io`-hosted multi tenant setup.
- The requests to `api.metaanchor.io` shall be kept to a minimum
- `router.metaanchor.io` shall never be called by the framework, but will call the framework.

# Frontend (frontend.myserver.com)

## Landing-Page Wireframes
![Landing page wireframes](landing_wireframes.png)

**CLAIM** wireframe is the view you see, when the NFT is owned by another wallet, but a valid SipV4 token allows to claim the NFT. This Page may later be customizable s.t. users may connect their wallet in this page or confirm the claim with a button press. Per default, the NFT shall be claimed automatically.

**LOST** Page is shown only after OWN page. OWN page transitions to LOST, when another device transferred the NFT, i.e. the current owner does no longer match the wallet of the device (av_beneficiary GET parameter).

**OWN** shows the NFT itself, when the NFT's current owner on the blockchain matches the device wallet (av_beneficiary GET parameter)

## Collection Administration

A complete "Wordpress-like" admin interface to manage the collection shall be provided.

Authorization shall be done via Wallet-Login (Wallet-Connect or other mechansim). List of allowed wallets will be comissioned based on the API-key and remote-configured by router.metaanchor.io (??). This is the default login mechansim, other login mechanisms may make sense in the future.

### Features:
Collection owner (Login wallet matches SmartContract.owner())
- Collection-wide
   - Edit collection name
   - Configure collection (e.g. owner-editability)
- NFT
   - Edit all NFTs in the collection 
   - Upload media files and manage which NFT has which media file
   - Edit metadata of NFTs ("Traits")
   - Update CSV-Lists and batches of images 
   - Assign media files and/or metadata to a group of NFTs.


Additional features:
- Owner-Editability; An individual owner (current owner of NFT X) shall be able to configure (selected) properties of his owned NFTs, e.g. change the image. I.e. each holder of NFTs of collection X shall be able to log in to the admin interface and use the "NFT" settings. Naturally, filtered only for his NFTs.


**TODO wireframes + description**



# Backend (backend.myserver.com)
The backend acts as API for frontend as well as API for router.metaanchor.io (where it may either receive information or returns information on request)

## Discovery 
When started, `https://api.metaanchor.io/api/v1/register` is called with the API-Key. In an ideal case, the server can resolve it's own public address

Payload:
```
{
    "port": {
        "frontend": 5071,
        "backend": 5020
    }
    "uri": {
        "frontend": "https://frontend.myserver.com",
        "backend": "https://backend.myserver.com"
    }, 
    "push_api_key": "..."
}
```

`uri` is optional. Per default, api.metaanchor.io will try to resolve your server's public address through the REFERRER of the requst sent to `https://api.metaanchor.io/api/v1/register`. Note this will only work for simple setups, in case you have more complex routing, please provide URI. 

`push_api.api_key` is an api-key, which is authorized to access `backend.myserver.com/api/v1/push/*`


## api/v1/push/*

For synchronizing information from the internal MetaAnchor-Infrastruktur to your deployed metaanchor-framework, the `api/v1/push/*` endpoints are designed. Under these endpoints your setup receives information and data from the MetaAnchor-Infrastructure in a secure way, i.e. only `metaanchor.io` will be accepted as sender.

Endpoints:

- `api/v1/push/slids` ... receives all supported SLIDs of your setup. In case we add new SLIDs, this endpoint will be called
- `api/v1/push/notify` ... Interface to send notice, update-notifications etc
- `api/v1/push/status` ... Returns a status report (Hashes of SLIDs, ..., allowing metaanchor to remote-monitor)
- ...   

## Endpoints for Frontend (/landing and /admin)

TODO


# Setup and Discovery

### Setup steps
-  User has one command he needs to copy-paste onto his server which guides him through installation. E.g. `curl https://www.example.com/files/install-metaanchor.sh -o install-metaanchor.sh && ./metaanchor.sh`. 
   - Any other user-friendly approach works as well!
   - The user is asked to paste the API-Key into setup
   - API Key is validated against api.metaanchor.io. If invalid, error out.
   - User can configure setup (e.g. Ports etc..)
- Images are built, installed and started. This contains
  - `backend.myserver.com`
  - `frontend.myserver.com`
  - `db.myserver.com` (not publicy accessible!)
  - An `push_api`-key is generated, which can be used from `api.metaanchor.io` to push new information (e.g. new supported SLIDs etc., inform about updates etc). **We can also discuss alternative authorization options to allow api.metaanchor.io to push information to the local running instance..**
- Discovery & Init is run
  - Database is synched from metaanchor_api (LINK XXX)
- During setup `backend.myserver.com/status` indicates the initialization status and potential error messages. 
  - As soon as setup is complete, this endpoint is no longer available (privacy reasons)



