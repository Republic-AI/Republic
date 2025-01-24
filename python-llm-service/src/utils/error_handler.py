from flask import jsonify
from typing import Union, Tuple, Dict, Any

def handle_error(error: Exception) -> Union[Tuple[Dict[str, Any], int], Dict[str, Any]]:
    """Handle different types of errors and return appropriate responses."""
    if isinstance(error, ValueError):
        # Handle validation errors
        return jsonify({"error": str(error)}), 400
    elif isinstance(error, KeyError):
        # Handle missing key errors
        return jsonify({"error": f"Missing required field: {str(error)}"}), 400
    elif isinstance(error, NotImplementedError):
        # Handle not implemented features
        return jsonify({"error": "This feature is not implemented yet"}), 501
    else:
        # Handle all other errors
        return jsonify({"error": f"Internal server error: {str(error)}"}), 500 