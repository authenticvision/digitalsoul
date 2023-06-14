# metaanchor-framework
A framework to work with Authentic Vision Meta Anchor (tm) Technology

# SETUP
1. Download the complete directory as zip and unpack it on your webserver (or git clone)
  1. `wget https://github.com/tbergmueller/metaanchor-framework/archive/refs/heads/master.zip && unzip master.zip`
  1. Rename directory if needed  
1. Replace the `backend/conf/metaanchor.json` with the `metaanchor.json` you received from us. __Make sure to never check this to public repositories or repositories at all, as it contains secret keys and API-keys that would compromise your complete collection__
1. Optional configurations
   1. Adapt public-exposed ports (5020 for backend and 5071 for frontend per default) in `docker-compose.yml` 
1. Adapt `VUE_APP_BASE_URL` in `frontend/.env` to reflect your webservers public address and the backend-port (default: 5020) you configured in the step before.
  1. When you provided us with `http://my-webserver.com:5020/collection`, then set `VUE_APP_BASE_URL=http://my-webserver.com:5020`
1. Run `sudo docker-compose build && sudo docker-compose up -d`. This takes a few minutes and builds everything as well as starts it in the background
  1. In case you need to debug, use `sudo docker logs --follow metaanchor_backend` and `sudo docker logs --follow metaanchor_frontend` respectively


## Making NFTs
1. For demo only, there is a temporary database in `backend/conf/tmpdb.json` ... Fill it.
  1. TODO instructions on what a SLID is etc.
  1. In case a SLID is not mentioned there, the NFT will get the DigitalSoul-Standard design with the SLID printed on the image
1. Copy images into the `backend/assets` folder (image paths are relative from there, so if an image `blub.jpg` is directly in the `frontend/assets` folder, the image shall be listed as `blub.jpg` in `backend/conf/tmpdb.json`)
1. Thats it ;) 