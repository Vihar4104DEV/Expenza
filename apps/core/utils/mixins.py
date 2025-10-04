from apps.core.utils.response_wrapper import api_response


class MessageMixin:
    success_messages = {
        "create": "Data added successfully.",
        "update": "Data updated successfully.",
        "retrieve": "Details fetched successfully.",
        "list": "Data fetched successfully.",
        "destroy": "Data deleted successfully.",
        "partial_update": "Data updated successfully.",
    }

    error_messages = {
        "create": "Failed to add data.",
        "update": "Failed to update data.",
        "retrieve": "Failed to fetch detail.",
        "list": "Failed to fetch data.",
        "destroy": "Failed to delete data.",
        "partial_update": "Failed to partially update data.",
    }

    def update_messages(self):
        """Hook for overriding messages dynamically."""
        pass

    def finalize_response(self, request, response, *args, **kwargs):
        """
        Wrap all responses in the standardized format.
        """
        action = getattr(self, "action", None)
        self.update_messages()

        success_message = self.success_messages.get(action, "Operation successful.")
        error_message = self.error_messages.get(action, "Operation failed.")

        status_code = response.status_code
        success = status_code < 400

        # Extract error (if validation failed)
        error_text = None
        if not success and isinstance(response.data, dict):
            from apps.core.utils.exceptions import extract_first_error_message
            error_text = extract_first_error_message(response.data)

        final_message = (
            success_message if success else f"{error_message} {error_text or ''}".strip()
        )

        return api_response(
            data=response.data if success else None,
            message=final_message,
            status_code=status_code,
            error=error_text,
            success=success,
        )
