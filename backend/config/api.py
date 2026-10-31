from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def stable_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None
    detail = response.data
    if isinstance(detail, dict) and 'code' in detail and 'message' in detail:
        payload = detail
    elif isinstance(detail, dict):
        payload = {'code': 'VALIDATION_ERROR' if response.status_code == 400 else 'REQUEST_ERROR', 'message': 'The request could not be completed.', 'fields': detail}
    else:
        payload = {'code': 'REQUEST_ERROR', 'message': str(detail), 'fields': {}}
    return Response(payload, status=response.status_code, headers=response.headers)
