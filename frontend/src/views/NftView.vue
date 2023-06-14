<template>
    <div>
        {{ walletAddress }}
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
                currentOwner: null,
            }           
        },
        props: {
            walletAddress: String,
            sipToken: String,
        },
        created() {
            this.currentOwner = "hi";
            this.myAddress = "servus"
        },
        async fetchCurrentOwner() {
            apiClient.get('/collection/asset-from-sip')
        }
    }

</script>