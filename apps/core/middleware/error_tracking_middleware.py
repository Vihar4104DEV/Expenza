"""
Enhanced Error Tracking Middleware

This middleware provides detailed error tracking with line numbers, stack traces,
and request context for better debugging.
"""

import logging
import traceback
import sys
from typing import Dict, Any, Optional
from django.http import JsonResponse
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
from apps.core.utils.response_wrapper import api_response

logger = logging.getLogger(__name__)


class EnhancedErrorTrackingMiddleware(MiddlewareMixin):
    """
    Enhanced error tracking middleware that captures detailed error information.
    
    This middleware:
    1. Captures full stack traces with line numbers
    2. Logs detailed error context
    3. Provides clean error responses to clients
    4. Tracks error patterns for debugging
    """
    
    def process_exception(self, request, exception):
        """
        Process exceptions with enhanced error tracking.
        
        Args:
            request: Django request object
            exception: The exception that occurred
            
        Returns:
            JsonResponse or None
        """
        try:
            # Get detailed error information
            error_details = self._get_error_details(exception)
            
            # Get request context
            request_context = self._get_request_context(request)
            
            # Log comprehensive error information
            self._log_error(error_details, request_context, request)
            
            # Return appropriate response based on environment
            if settings.DEBUG:
                return self._debug_response(error_details, request_context)
            else:
                return self._production_response(error_details)
                
        except Exception as middleware_error:
            # Fallback error handling for middleware itself
            logger.error(f"Error in EnhancedErrorTrackingMiddleware: {str(middleware_error)}")
            return None
    
    def _get_error_details(self, exception) -> Dict[str, Any]:
        """
        Extract detailed error information from exception.
        
        Args:
            exception: The exception object
            
        Returns:
            Dict containing error details
        """
        # Get the current exception info
        exc_type, exc_value, exc_traceback = sys.exc_info()
        
        # Extract traceback information
        tb_list = traceback.extract_tb(exc_traceback)
        
        # Get the last frame (where the error occurred)
        last_frame = tb_list[-1] if tb_list else None
        
        # Find the first frame in our application code (not in site-packages)
        app_frame = None
        for frame in reversed(tb_list):
            if 'site-packages' not in frame.filename and 'venv' not in frame.filename:
                app_frame = frame
                break
        
        # Use app frame if found, otherwise use last frame
        error_frame = app_frame or last_frame
        
        return {
            'exception_type': exc_type.__name__ if exc_type else 'Unknown',
            'exception_message': str(exception),
            'error_file': error_frame.filename if error_frame else 'Unknown',
            'error_line': error_frame.lineno if error_frame else 'Unknown',
            'error_function': error_frame.name if error_frame else 'Unknown',
            'error_code': error_frame.line if error_frame else 'Unknown',
            'full_traceback': traceback.format_exc(),
            'traceback_frames': [
                {
                    'file': frame.filename,
                    'line': frame.lineno,
                    'function': frame.name,
                    'code': frame.line
                }
                for frame in tb_list
            ]
        }
    
    def _get_request_context(self, request) -> Dict[str, Any]:
        """
        Extract relevant request context information.
        
        Args:
            request: Django request object
            
        Returns:
            Dict containing request context
        """
        try:
            # Get user information safely
            user_info = 'Anonymous'
            if hasattr(request, 'user') and request.user.is_authenticated:
                user_info = f"User ID: {request.user.id}, Email: {getattr(request.user, 'email', 'N/A')}"
            
            # Get request body safely
            request_body = 'N/A'
            try:
                if hasattr(request, 'body'):
                    request_body = request.body.decode('utf-8')[:1000]  # Limit size
            except:
                request_body = 'Could not decode request body'
            
            return {
                'method': request.method,
                'path': request.path,
                'user': user_info,
                'ip_address': self._get_client_ip(request),
                'user_agent': request.META.get('HTTP_USER_AGENT', 'N/A'),
                'request_headers': dict(request.headers),
                'request_body': request_body,
                'query_params': dict(request.GET),
                'content_type': request.content_type,
            }
        except Exception as e:
            logger.error(f"Error getting request context: {str(e)}")
            return {'error': 'Could not extract request context'}
    
    def _get_client_ip(self, request) -> str:
        """Get client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip or 'Unknown'
    
    def _log_error(self, error_details: Dict[str, Any], request_context: Dict[str, Any], request):
        """
        Log comprehensive error information.
        
        Args:
            error_details: Error details dictionary
            request_context: Request context dictionary
            request: Django request object
        """
        # Create a comprehensive error log message
        log_message = f"""
========================================
🚨 APPLICATION ERROR DETECTED 🚨
========================================

ERROR DETAILS:
- Type: {error_details['exception_type']}
- Message: {error_details['exception_message']}
- File: {error_details['error_file']}
- Line: {error_details['error_line']}
- Function: {error_details['error_function']}
- Code: {error_details['error_code']}

REQUEST CONTEXT:
- Method: {request_context['method']}
- Path: {request_context['path']}
- User: {request_context['user']}
- IP: {request_context['ip_address']}
- User Agent: {request_context['user_agent']}

STACK TRACE:
{error_details['full_traceback']}

========================================
"""
        
        # Log the error
        logger.error(log_message)
        
        # Also log a shorter version for easier scanning
        logger.error(
            f"💥 ERROR: {error_details['exception_type']} in "
            f"{error_details['error_file']}:{error_details['error_line']} - "
            f"{error_details['exception_message']}"
        )
    
    def _debug_response(self, error_details: Dict[str, Any], request_context: Dict[str, Any]) -> JsonResponse:
        """
        Return detailed error response for debug mode.
        
        Args:
            error_details: Error details dictionary
            request_context: Request context dictionary
            
        Returns:
            JsonResponse with detailed error information
        """
        debug_data = {
            'error_location': {
                'file': error_details['error_file'],
                'line': error_details['error_line'],
                'function': error_details['error_function'],
                'code': error_details['error_code']
            },
            'error_type': error_details['exception_type'],
            'error_message': error_details['exception_message'],
            'request_info': {
                'method': request_context['method'],
                'path': request_context['path'],
                'user': request_context['user']
            },
            'stack_trace': error_details['traceback_frames']
        }
        
        return api_response(
            success=False,
            message=f"Internal Server Error: {error_details['exception_message']}",
            data=debug_data,
            status_code=500
        )
    
    def _production_response(self, error_details: Dict[str, Any]) -> JsonResponse:
        """
        Return clean error response for production mode.
        
        Args:
            error_details: Error details dictionary
            
        Returns:
            JsonResponse with clean error message
        """
        # Determine if this is a client error or server error
        if 'ValidationError' in error_details['exception_type']:
            status_code = 400
            message = error_details['exception_message']
        elif 'PermissionDenied' in error_details['exception_type']:
            status_code = 403
            message = "Permission denied"
        elif 'NotFound' in error_details['exception_type']:
            status_code = 404
            message = "Resource not found"
        else:
            status_code = 500
            message = "An internal server error occurred"
        
        return api_response(
            success=False,
            message=message,
            status_code=status_code
        ) 



import json
import logging
import time
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings

logger = logging.getLogger(__name__)

class APILoggingMiddleware(MiddlewareMixin):
    """
    Custom middleware for detailed API logging to console
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = logging.getLogger('api_console')
        # Add async_mode attribute for Django compatibility
        self.async_mode = False
    
    def process_request(self, request):
        # Start timing
        request.start_time = time.time()
        
        # Log request details
        if hasattr(request, 'path') and request.path.startswith('/api/'):
            self.logger.info(f"🚀 API REQUEST: {request.method} {request.path}")
            # self.logger.info(f"   Headers: {dict(request.headers)}")
            
            # Log request body for POST/PUT/PATCH
            # if request.method in ['POST', 'PUT', 'PATCH']:
            #     try:
            #         if hasattr(request, 'body') and request.body:
            #             body = request.body.decode('utf-8')
            #             if len(body) < 1000:  # Only log if not too long
            #                 self.logger.info(f"   Body: {body}")
            #             else:
            #                 self.logger.info(f"   Body: {body[:1000]}... (truncated)")
            #     except Exception as e:
            #         self.logger.warning(f"   Could not log request body: {e}")
    
    def process_response(self, request, response):
        # Calculate execution time
        if hasattr(request, 'start_time'):
            execution_time = (time.time() - request.start_time) * 1000  # Convert to milliseconds
            
            # Log response details for API calls
            if hasattr(request, 'path') and request.path.startswith('/api/'):
                self.logger.info(f"✅ API RESPONSE: {request.method} {request.path} - Status: {response.status_code} - Time: {execution_time:.2f}ms")
                
                # Log slow APIs
                if execution_time > 500:
                    self.logger.warning(f"🐌 SLOW API: {request.method} {request.path} took {execution_time:.2f}ms")
                
                # Log response content for errors
                if response.status_code >= 400:
                    try:
                        if hasattr(response, 'content'):
                            content = response.content.decode('utf-8')
                            if len(content) < 1000:
                                self.logger.error(f"   Error Response: {content}")
                            else:
                                self.logger.error(f"   Error Response: {content[:1000]}... (truncated)")
                    except Exception as e:
                        self.logger.warning(f"   Could not log error response: {e}")
        
        return response
    
    def process_exception(self, request, exception):
        # Log exceptions
        if hasattr(request, 'path') and request.path.startswith('/api/'):
            self.logger.error(f"❌ API EXCEPTION: {request.method} {request.path} - {str(exception)}")
        return None 