from rest_framework.pagination import PageNumberPagination
from rest_framework.status import HTTP_400_BAD_REQUEST
from rest_framework.exceptions import ValidationError
from django.core.paginator import EmptyPage, PageNotAnInteger


class CustomPagePagination(PageNumberPagination):
    """
    Custom pagination with:
    - Consistent validation
    - Clean metadata (no URLs, just numbers)
    - Friendly errors that bubble up to global handler
    """
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100
    page_query_param = "page"

    def paginate_queryset(self, queryset, request, view=None):
        page_size = self.get_page_size(request)
        if not page_size:
            return None

        # Validate page_size
        if self.page_size_query_param in request.query_params:
            raw_page_size = request.query_params[self.page_size_query_param]
            try:
                requested_page_size = int(raw_page_size)
                if requested_page_size < 1:
                    raise ValidationError(
                        {self.page_size_query_param: f"Invalid page size: {requested_page_size}. Must be a positive integer."}
                    )
            except ValueError:
                raise ValidationError(
                    {self.page_size_query_param: f"Invalid page size: {raw_page_size}. Must be an integer."}
                )

        paginator = self.django_paginator_class(queryset, page_size)
        raw_page_number = request.query_params.get(self.page_query_param, 1)

        # Validate page number
        try:
            page_number = int(raw_page_number)
            if page_number < 1:
                raise ValidationError(
                    {self.page_query_param: f"Invalid page number: {page_number}. Must be a positive integer."}
                )
        except ValueError:
            raise ValidationError(
                {self.page_query_param: f"Invalid page number: {raw_page_number}. Must be an integer."}
            )

        try:
            self.page = paginator.page(page_number)
        except EmptyPage:
            raise ValidationError(
                {self.page_query_param: f"Page {page_number} does not exist. The collection has {paginator.num_pages} pages."}
            )
        except PageNotAnInteger:
            raise ValidationError(
                {self.page_query_param: f"Page number '{raw_page_number}' is not valid."}
            )

        return list(self.page)

    def get_pagination_data(self, data):
        """
        Return dict with pagination metadata + list.
        """
        if not hasattr(self, "page") or self.page is None:
            return {
                "total_record": 0,
                "next": 0,
                "previous": 0,
                "total_pages": 0,
                "list": []
            }

        total_pages = self.page.paginator.num_pages
        current_page = self.page.number

        return {
            "total_record": self.page.paginator.count,
            "next": current_page + 1 if current_page < total_pages else 0,
            "previous": current_page - 1 if current_page > 1 else 0,
            "total_pages": total_pages,
            "list": data,
        }

    def get_paginated_response_schema(self, schema):
        """
        For API docs (Swagger / DRF schema).
        """
        return {
            "type": "object",
            "properties": {
                "total_record": {"type": "integer", "description": "Total number of items"},
                "next": {"type": "integer", "description": "Next page number (0 if none)"},
                "previous": {"type": "integer", "description": "Previous page number (0 if none)"},
                "total_pages": {"type": "integer", "description": "Total number of pages"},
                "list": schema,
            },
        }
