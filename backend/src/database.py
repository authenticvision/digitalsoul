from flask_sqlalchemy import SQLAlchemy

__db = SQLAlchemy()

def get_db():
    if __db is None:
        raise Exception("Database not initialized")
    return __db

def setup_db(app):
    __db.init_app(app)

