""" 
This Module provides a unified response format for all API responses.


Response Format:

{
    "success": true,
    "status": 200,
    "message": "Success",
    "error": null,
    "data": null
}

"""

from rest_framework.response import Response


def api_response(
    data={},
    message="Success",
    status_code=200,
    error=None,
    success=True,
):
    """
    Unified response format for all API responses.
    """
    return Response(
        {
            "status": int(success),
            "message": message,
            "data": data if data else {},
        },
        status=status_code,
    )
