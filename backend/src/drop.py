from flask import Blueprint, request, current_app, Response, send_file, abort
import werkzeug.exceptions
import json

from src.metaanchor_api import MetaAnchorAPI

bp = Blueprint('drop', __name__, url_prefix='/drop/')

@bp.route('/', methods=['POST'])
def dropAnchor():
    std_body_format_spec = '{"sip_token": "A string with SIP Token in Format local.v2.xxxxx", "beneficiary": "A string Wallet address in format 0x123...abc"}'

    drop_params = None
    try:
        drop_params = json.loads(request.data)

        if 'sip_token' not in drop_params:
            raise Exception("Missing sip_token")

        if 'beneficiary' not in drop_params:
            raise Exception["Missing beneficiary"]

    except Exception as e:
        raise werkzeug.exceptions.BadRequest(f"Bad body format, expected {std_body_format_spec}")

    return MetaAnchorAPI().post('anchor/drop', json_data=drop_params)