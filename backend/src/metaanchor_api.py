import os
import requests
import logging
from flask import current_app

class MetaAnchorAPI:
    def __init__(self):
        self._headers = {'Authorization': f'Bearer {current_app.config["METAANCHOR_API_KEY"]}'}
        # API base url guaranteed to have a trailing slash
        self._base_url = os.getenv('METAANCHOR_API_URL', 'https://api.metaanchor.io/api/v1').strip('/') + "/"
        self._logger =  logging.getLogger('metaanchor')

    def get(self, path, params={}):
        requ_url = self._base_url + path.strip('/')
        try:
            response = requests.get(url=requ_url, params=params, headers=self._headers)
            response_data = response.json() # Tryparse
            return response_data

        except Exception as e:
            self._logger.error(f"GET-Request to {requ_url} failed: {e}")
            return None


    def post(self, path, json_data):
        requ_url = self._base_url + path.strip('/')
        try:
            response = requests.post(url=requ_url, json=json_data, headers=self._headers)
            response_data = response.json()  # Tryparse
            return response_data

        except Exception as e:
            self._logger.error(f"POST-Request to {requ_url} failed: {e}")
            return None


    def resolve(self, token_id=None, anchor=None):
        to_resolve = None
        nr_params = 0

        if token_id:
            to_resolve = token_id
            nr_params  += 1

        if anchor:
            to_resolve = anchor
            nr_params += 1

        if nr_params != 1:
            raise Exception("Pass EITHER token_id OR anchor.")

        jresp = self.get(f"/anchor/resolve/{to_resolve}")

        if not jresp or not jresp['success']:
            # TODO error handling
            return None, None

        # Got a valid response:
        return jresp['slid'], jresp['anchor']


    def get_asset_info(self, sip_token):
        jresp = self.get(f"/anchor/asset-by-sip/{sip_token}")
        # FIXME error handling...
        return jresp


