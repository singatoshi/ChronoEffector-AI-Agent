import asyncio
from functools import wraps
from typing import Any

import typer


class AsyncTyper(typer.Typer):
    """Typer subclass that supports async command functions."""

    def command(self, *args: Any, **kwargs: Any) -> Any:
        decorator = super().command(*args, **kwargs)

        def wrapper(fn: Any) -> Any:
            @wraps(fn)
            def runner(*a: Any, **kw: Any) -> Any:
                return asyncio.run(fn(*a, **kw))

            decorator(runner)
            return fn

        return wrapper
