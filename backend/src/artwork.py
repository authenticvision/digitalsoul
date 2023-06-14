import logging
import os
import mimetypes

from flask import Blueprint, request, current_app, Response, send_file, abort
import werkzeug.exceptions
import cv2
from src.tmpdb import TemporaryDatabase

from src.metaanchor_api import MetaAnchorAPI


bp = Blueprint('artwork', __name__, url_prefix='/artwork/')

@bp.route('/<string:anchor>', methods=['GET'])
def getAnchorImage(anchor):
    # Use opencv to paint a bit on the image

    [slid, anchor] = MetaAnchorAPI().resolve(anchor)

    if not slid:
        raise werkzeug.exceptions.NotFound(f"No artwork for anchor {anchor}")

    potentialImage = TemporaryDatabase().getImageName(slid_b36=slid)
    if potentialImage:
        # determine file-type
        mimetype, _ = mimetypes.guess_type(potentialImage)

        # simply return that image
        return send_file(f"assets/{potentialImage}", mimetype=mimetype)

    # For Demo-Purposes, we will now write the SLID into the image!
    # This is a security risk in an actual setting
    # Never make the SLID public!
    img = cv2.imread('assets/digitalsoul_template.jpg', cv2.IMREAD_UNCHANGED)

    # font
    font = cv2.FONT_HERSHEY_DUPLEX
    color = (255, 255, 255, 255)
    thickness = 10

    # Using cv2.putText() method
    img = cv2.putText(img, slid,  (1200, 1080), font, 3.7, color, thickness, cv2.LINE_AA)

    _, img_encoded = cv2.imencode('.png', img)
    buf = img_encoded.tobytes()
    response = Response(buf, mimetype='image/png')
    response.headers.set('Content-Length', len(buf))

    return response

@bp.route('/img/list', methods=['GET'])
def get_list():
    return {"blub": os.listdir(os.getcwd() + "/assets/"), "hi": os.getcwd()}