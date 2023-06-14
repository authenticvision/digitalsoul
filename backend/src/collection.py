import os

from flask import Blueprint, request, current_app, Response, send_file
from src.tmpdb import TemporaryDatabase
import json
from src.metaanchor_api import MetaAnchorAPI



bp = Blueprint('collection', __name__, url_prefix='/collection/')


def assemble_error_response(error_code, msg, http_err_code= 500, ex=None):
    resp_obj = {
        "success": False,
        "msg": msg,
        "error_code": error_code
    }

    if ex:
        resp_obj['exception'] = str(ex)

    return Response(json.dumps(resp_obj), status=http_err_code, mimetype='application/json')

def intTryParse(value):
    try:
        return int(value), True
    except ValueError:
        return value, False

@bp.route('/<string:token_id_or_anchor>', methods=['GET'])
def getMetadata(token_id_or_anchor):
    import logging
    logger = logging.getLogger('waitress')
    logger.info(f'Metadata for {token_id_or_anchor}')

    if token_id_or_anchor.isdigit():
        token_id = int(token_id_or_anchor)
        slid, anchor = MetaAnchorAPI().resolve(token_id=token_id)
    else:
        anchor = token_id_or_anchor
        slid, anchor = MetaAnchorAPI().resolve(anchor=anchor)

    # Create a dynamic URL for images
    public_url = os.getenv('PUBLIC_URL', request.base_url.replace(f'collection/{token_id_or_anchor}', ''))


    metadata = TemporaryDatabase().getTokenMetadata(slid_b36=slid)

    if "name" not in metadata:
        metadata["name"] = f"{TemporaryDatabase().getDefaultTokenName()} {anchor[0:5]}..{anchor[-3:]}"

    if "image" not in metadata:
        metadata["image"] = public_url.strip('/') + f'/artwork/{anchor}',  # This calls the endpoint below

    return metadata

@bp.route('/asset-from-sip/<string:sip_token>', methods=['GET'])
def getAssetFromSip(sip_token):
    import logging
    logger = logging.getLogger('waitress')
    logger.info(f'assetRequest')
    return MetaAnchorAPI().get_asset_info(sip_token=sip_token)

