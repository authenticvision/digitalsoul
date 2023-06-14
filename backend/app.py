import json

from flask import Flask, request
import logging
import argparse
from flask_cors import CORS
from src.database import setup_db, get_db
from src.collection import bp as bp_collection
from src.artwork import bp as bp_artwork
from src.drop import bp as bp_drop

import os
from sqlalchemy import exc, select
import waitress

# Class-based application configuration
class ConfigClass(object):
    """ Flask application config """
    SQLALCHEMY_DATABASE_URI = os.getenv('POSTGRES_DSN')
    SQLALCHEMY_TRACK_MODIFICATIONS = False    # Avoids SQLAlchemy warning
    CORS_HEADERS = ['Content-Type', 'application/json']
    METAANCHOR_API_URL = os.getenv('METAANCHOR_API_URL', 'http://api.metaanchor.io.at/api/v1') # fixme encode production

    default_api_key = ''
    # Try to read from config file
    try:
        with open('conf/metaanchor.json', 'r') as f:
            data = json.load(f)
            default_api_key = data['polygon-pos']['api_key'] # FIXME! not configureable at all...
            print("Default API-Key loaded from conf/metaanchor.json")
    except Exception as e:
        print(f"Error loading conf/metaanchor.json - unparseable: {e} ")

    METAANCHOR_API_KEY = os.getenv('METAANCHOR_API_KEY', default_api_key) # Either contains '', the json-loaded api key or the one from the environment variable. In that order of ascending priority

def create_app():
    app = Flask(__name__)
    app.config.from_object(__name__+'.ConfigClass')

    # Supports credentials is important to carry the cookies for user authentication...
    cors = CORS(app, resources={r"/*": {"origins": "*"}, r"/drop/": {"origins": "*"}, "/user/*": {"origins": "*"}}, supports_credentials=True )

    import logging
    logger = logging.getLogger('waitress')
    logger.setLevel("DEBUG")
    logger.info('Hello baby!')

    # Register blueprints
    app.register_blueprint(bp_collection)
    app.register_blueprint(bp_artwork)
    app.register_blueprint(bp_drop)

    # assemble database
    # setup_db(app=app)

    @app.route("/")
    def hello():
        return {"msg": "Hello from DigitalSoul-Sandbox project", "files": os.listdir('.')}

    @app.route("/healthz")
    def livez():
        # this is called by K8s to check whether the service is alive; any non-200 response kills the API server!
        with get_db().engine.connect() as connection:
            connection.scalar(select(1)) # will raise exception and get us an error 500 if pool is broken
        return "OK"

    @app.route('/api/v1/secure')
    def my_endpoint():
        return {'authorized': True}

    @app.errorhandler(Exception)
    def handle_exception(e):
        # now you're handling non-HTTP exceptions only
        app.logger.error(e)
        return e  # pass through anyway...

    return app


if __name__ == '__main__':
    # use "flask run [--help]" from this directory to run a development server instead
    waitress.serve(create_app(), port=int(os.getenv('API_PORT', '8080')))
