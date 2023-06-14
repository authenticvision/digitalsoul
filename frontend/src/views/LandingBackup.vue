<template>
    <div>
        <br>
        <label for="text-sip">Scanned Anchor</label>
        <input type="text" id="text-sip" name="text-sip" v-model="anchor" disabled>
        <br>
        <br>
        <label for="text-sip">SIP</label>
        <input type="text" id="text-sip" name="text-sip" v-model="sipToken" disabled>
        <br>
        <label for="text-sip">Current owner</label>
        <input type="text" id="text-sip" name="text-sip" v-model="owner" disabled>
        <br><br>
        <br>
        <div>
            <label for="text-input">Enter Wallet-Address</label>
            <input type="text" id="text-beneficiary" name="text-beneficiary" v-model="beneficiary">
            <button @click="dropAnchor">Drop Anchor</button>
        </div>
        <div>
            <textarea id="output_window" cols="50" rows="5" v-model="logOutput"></textarea>
        </div>
        <div>
          <textarea hidden="true" id="nft_window" cols="50" rows="5" v-model="nftInfoString"></textarea>
        </div>

        <div>
          <img :src="imgUrl" :style="{ maxWidth: '100%' }" />
        </div>
        

    </div>
  </template>
  
  <script>
  import axios from 'axios';

    const apiClient = axios.create({
    withCredentials: false,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    });
    
  
  export default {
    data() {
      return {
        data: null,
        isLoading: false,
        error: null,
        logOutput: "Waiting for output..",
        queryParams: {},
        sipToken: null,
        nftInfoString: null,
        nftInfo: null,
        beneficiary: "",
        anchor: "fetching...",
        owner: "fetching...",
        imgUrl: null,

      };
    },
    created() {
        const params = new URLSearchParams(window.location.search);
            for (const [key, value] of params.entries()) {
            this.queryParams[key] = value;
            }
            this.outputSip()
            this.beneficiary = this.queryParams['av_beneficiary']
            this.fetchChainState()      
    },
    mounted() {
    },
    beforeUnmount() {
    },
    methods: {
     async fetchChainState() {
      apiClient.get('/collection/asset-from-sip/' + this.sipToken) // FIXME this needs configuration!
              .then((response) => {
                this.nftInfoString = JSON.stringify(response.data)
                console.log(this.nftInfo)
                this.nftInfo = response.data;
                this.anchor = this.nftInfo.anchor
                this.owner = this.nftInfo.owner
                if(this.anchor && this.owner) {
                  if(this.owner.toLowerCase() == this.beneficiary.toLowerCase()) {
                    this.imgUrl = this.nftInfo.metadata.image
                  } else {
                    this.imgUrl = null
                  }
                }
              })
              .catch(error => this.appendOutput(error));
     },
      async dropAnchor() {
        this.clearOutput()
        if (!this.sipToken || !this.sipToken.startsWith('v2.local')) {
				this.appendOutput("ERROR: SIP-Token via GET-Parameter not retrieved correctly. Supposed to be in av_sip and being in format v2.local.*")
				return
			}

			if(!this.isValidEthereumAddress(this.beneficiary)) {
				this.appendOutput("ERROR: Please enter a wallet adress in format 0xabc..123")
				return				
			}

			let bodyParams = {
                "sip_token": this.sipToken,
                "beneficiary": this.beneficiary
			}

			this.appendOutput("Starting to drop anchor.. this may take a while")

      apiClient.post('/drop/', bodyParams) // FIXME this needs configuration!
				.then((response) => {
          this.appendOutput(JSON.stringify(response.data))
          this.fetchChainState()
        })
				.catch(error => this.appendOutput(error));            

      },
      outputSip() {
            this.sipToken= this.queryParams['av_sip'];		
		},
        clearOutput() {
            this.logOutput = ""
            this.appendOutput("Start dropping anchor..")

        },
        appendOutput(text) {
			let curText = this.logOutput;
			curText = curText + "\n" + text
            this.logOutput = curText			
		},
        isValidEthereumAddress(address) {
			const regex = /^0x[0-9a-fA-F]{40}$/;
			return regex.test(address);
		},
    },
  };
  </script>
