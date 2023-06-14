import json

class TemporaryDatabase:
    def __init__(self):
        with open('conf/tmpdb.json') as f:
            self._data = json.load(f)

    def getImageName(self, slid_b36):
        if slid_b36 in self._data["img_per_base36_slid"]:
            return self._data["img_per_base36_slid"][slid_b36]

        if "default_img" in self._data:
            return self._data["default_img"]
            
        return None

    def getTokenMetadata(self, slid_b36):
        if "metadata_default" not in self._data:
            raise Exception("Default metadata missing in DB")

        metadata = self._data["metadata_default"]

        if slid_b36 in self._data["metadata_per_base36_slid"]:
            specificMetadata = self._data["metadata_per_base36_slid"][slid_b36]
            metadata.update(specificMetadata)

        return metadata

    def getDefaultTokenName(self):
        if "default_token_name" not in self._data:
            raise Exception("Default token name not in DB")
        return self._data["default_token_name"]
