<template>
  <div>
    <img decoding="async" :style="{ maxWidth: '50%' }" title="meta-anchor-demo-logo-grey" src="../assets/meta-anchor-demo-logo-grey.svg">
  </div>
  <div>
    <h1>{{ heading }}</h1>
  </div>

  <div class="error-box" :hidden="hideError">
    <p class="error-message"> {{ errorMsg }}</p>
  </div>

  <div :hidden="hideSpinner" ref="animationContainer" style="margin: 0 auto; margin-top:30px; margin-bottom:30px; width: 150px; height: 150px;"></div>  

  <div :hidden="imageHidden">  
    <video v-if="isVideo" :src="imgUrl" :style="{maxWidth: '90%'}" autoplay muted loop playsinline="true" preload="auto">
      Your browser does not support the video tag.
    </video>
    <img v-else :src="imgUrl" :style="{maxWidth: '90%'}" /> 
  </div>

  <div class="owner-box" style="margin-top: 50px" :hidden="hideOwner">
    <p class="owner-message">owned by <a :href="ownerLink">{{ ownerLinkText }}</a></p>
  </div>

  <div hidden="true">
    <textarea id="output_window" cols="50" rows="5" v-model="logOutput"></textarea>
    <br>
        <label for="text-sip">SIP Token</label>
        <input type="text" id="text-sip" name="text-sip" v-model="sipToken" disabled>
        <br>
        <label for="text-sip">Current owner</label>
        <input type="text" id="text-sip" name="text-sip" v-model="owner" disabled>
        <br><br>
        <br>
  </div>
            
  </template>
  <script>
  import axios from 'axios';
  import lottie from 'lottie-web';

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
        hideSpinner: true,
        imageHidden: true,
        error: null,
        logOutput: "Waiting for output..",
        queryParams: {},
        sipToken: null,
        nftInfoString: null,
        nftInfo: null,
        beneficiary: "",
        anchor: "fetching...",
        owner: "fetching...",
        ownerLink: "",
        ownerLinkText: "?",
        imgUrl: null,
        isVideo: null,
        tokenUri: null,
        tokenMetadata: null,
        errorMsg: null,
        hideError: true,
        heading: "Fetching data...",
        wereOwner: false, // indicates whether i already was the owner
        myInterval: null,
        monitoringIntervalMilliseconds: 1500,
      };
    },
    created() {
        const params = new URLSearchParams(window.location.search);
            for (const [key, value] of params.entries()) {
            this.queryParams[key] = value;
            }
            this.outputSip()
            this.beneficiary = this.queryParams['av_beneficiary']
            if(!this.beneficiary) {
              this.reportError("Receiving wallet not configured in app");
              this.updateView();
              return;
            }
            this.fetchChainState()      
    },
    mounted() {
      const container = this.$refs.animationContainer;
      lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        background: 'transparent',
        loop: true,
        autoplay: true,
        path: 'https://lottie.host/f4400779-cc78-4631-9eab-a68e85c25d12/RmoHnAgJBj.json'
      });
      document.addEventListener('visibilitychange', this.handleVisibilityChange)
    },
    beforeUnmount() {
      this.stopChainMonitoring();
      document.removeEventListener('visibilitychange', this.handleVisibilityChange)          
    },
    methods: {
     makeShortenedWallet(walletAddr) {
        let toReturn = walletAddr.substring(0, 8) + "..."
        const len = walletAddr.length;
        toReturn += walletAddr.substring(len - 7, len-1)
        return toReturn;
     },
     async getMimeTypeOfImage() {
      axios.head(this.imgUrl).then(response => {
        const contentType = response.headers['content-type'];
        this.isVideo = contentType.startsWith("video/")
        console.log("isVideo? " + this.isVideo + "(Content-type: " + contentType + ")")
      }).catch(error => {
        console.error(`Error retrieving MIME-type from ${this.imgUrl}: ${error}`)
      })
     },
     async fetchChainState() {
      console.log("Fetch chainstate...")
      apiClient.get('/collection/asset-from-sip/' + this.sipToken) // FIXME this needs configuration!
              .then((response) => {
                this.nftInfoString = JSON.stringify(response.data)
                this.nftInfo = response.data;
                this.anchor = this.nftInfo.anchor
                this.owner = this.nftInfo.owner
                this.ownerLink= "https://testnets.opensea.io/" + this.owner
                this.ownerLinkText =  this.makeShortenedWallet(this.owner)
                this.tokenUri = this.nftInfo.token_uri

                if(this.tokenUri && !this.tokenMetadata) {
                  console.log(this.tokenUri)
                  this.fetchTokenMetadata(); // go and get the data... 
                }

                this.reactToChainState();
              })
              .catch(error => this.appendOutput(error));
     },
     handleVisibilityChange() {
      if(document.hidden) {
        this.stopChainMonitoring();
      } else {
        this.fetchChainState();
      }
     },
     async startChainMonitoring() {
        if(!this.myInterval) {
          console.log("Start chain monitoring...")
          this.myInterval = setInterval( () => {
            this.fetchChainState();  
          }, this.monitoringIntervalMilliseconds );
        }
        
     },
     async stopChainMonitoring() {
      if(this.myInterval) {
        console.log("Stopp chain monitoring..")
        clearInterval(this.myInterval);
        this.myInterval = null;
      }          
     },
     async reportError(errorMsg) {
      this.errorMsg = errorMsg;
      this.appendOutput("ERROR: " + errorMsg);
      this.updateView();
     },
     async fetchTokenMetadata() {
      axios.get(this.tokenUri).then(response => {
        this.tokenMetadata = response.data;
        this.imgUrl = this.tokenMetadata.image;        
        this.getMimeTypeOfImage();
      }).catch(error => {
        console.log(error)
      })      
     },
     async reactToChainState() {
      console.log(this.owner)
      console.log(this.beneficiary)
      console.log("was owner: " + this.wereOwner)
      if(!this.owner || !this.beneficiary) {
        this.reportError("Owner or beneficiary not set");
        return;
      }
      if(this.owner.toLowerCase() == this.beneficiary.toLowerCase()) {
        this.startChainMonitoring();
        this.wereOwner = true;
      }
      else {
        this.stopChainMonitoring();
        console.log("Would need to claim...")
        if(!this.wereOwner) {
          this.dropAnchor();
        } else {
          console.log("Do not drop anchor, as I was the previous owner...")
        }
      }
      this.updateView();
     },
     async updateView() {
      if(this.errorMsg) {
        this.showErrorView();
        return;
      }
      if(this.owner.toLowerCase() == this.beneficiary.toLowerCase()) {
        this.showNftView()
      } else {
        if(this.wereOwner) {
          this.showNftLostView();
        } else {
          this.showDropAnchorView();
        }
      }
     },
     async showNftView() {
      this.heading = "Your DigitalSoul NFT"
      this.imageHidden = false;
      this.hideSpinner = true;
      this.hideError = true;
     },

     async showDropAnchorView() {
      this.heading = "Claiming NFT..."
      this.imageHidden = true;
      this.hideSpinner = false;
      this.hideError = true;
     },

     async showNftLostView() {
      this.heading = "NFT transferred..."
      this.imageHidden = true;
      this.hideSpinner = true;
      this.hideError = true;
     },

     async showErrorView() {
      this.heading = "Whoops..."
      this.imageHidden = true;
      this.hideSpinner = true;
      this.hideError = false;
     },

     async dropAnchor() {
        this.clearOutput()
        if (!this.sipToken || (!this.sipToken.startsWith('v2.local') && !this.sipToken.startsWith('v4.public'))) {
				this.reportError("SIP-Token via GET-Parameter not retrieved correctly. Supposed to be in av_sip and being in format v2.local.* or v4.public.*")
				return
			}

			if(!this.isValidEthereumAddress(this.beneficiary)) {
				this.reportError("Please enter a wallet adress in format 0xabc..123")
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

<style>
  @import url('https://fonts.cdnfonts.com/css/source-sans-pro');
  body {
    background: #181b24 ;
    font-family: 'Source Sans Pro', sans-serif;
    color: #ffffff;

  }
  input {
    background-color: #505157;
    font-family: 'Source Sans Pro', sans-serif;
    color: #ffffff;
  }
  h1 {
    color: #ffffff;
  }
  .error-box {
  background-color: #f8d7da;
  color: #721c24;
  padding: 15px;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
  margin-bottom: 15px;
 }
.error-message {
  font-weight: bold;
  margin: 0;
}

.owner-box{
  background-color: #505157;
  color: #ffffff;
  padding: 15px;
  border: 1px solid #605157;
  border-radius: 5px;
  margin-bottom: 15px;
 }
.owner-message {
  font-weight: bold;
  margin: 0;
}

a:link, a:visited {
  color: #ffffff;
}

/* mouse over link */
a:hover {
  color: #cccccc;
}

/* selected link */
a:active {
  color: blue;
}

</style>