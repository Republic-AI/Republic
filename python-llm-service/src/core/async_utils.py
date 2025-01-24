import asyncio
from functools import wraps

def async_route(f):
    """Decorator to handle async route functions in Flask."""
    @wraps(f)
    def wrapped(*args, **kwargs):
        return asyncio.run(f(*args, **kwargs))
    return wrapped 