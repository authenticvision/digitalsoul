from src.database import get_db
db = get_db()

class ApiKey(db.Model):
    __tablename__ = 'api_key'
    api_key_id = db.Column(db.Integer, primary_key=True)
    contract_id = db.Column(db.Integer, db.ForeignKey('contract.contract_id'))
    api_key = db.Column(db.String, nullable=False)

    contract = db.relationship("Contract")


class Contract(db.Model):
    __tablename__ = 'contract'
    contract_id = db.Column(db.Integer, primary_key=True)
    contract_short_name = db.Column(db.String, nullable=False)
    network = db.Column(db.String)
    address = db.Column(db.String)



