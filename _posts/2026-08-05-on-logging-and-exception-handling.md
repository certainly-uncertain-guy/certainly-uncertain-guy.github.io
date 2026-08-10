---
title: "On logging and exception handling"
date: 2026-08-05
categories: [mentoring]
tags: [python, engineering, process]
excerpt: "Why logging and exception handling are two sides of the same coin, and a structured pattern for both that scales past a single script."
---
When something goes wrong in a running service, you need two things: a way to signal that something failed and stop the normal flow of code, and a record of what happened so you can figure out *why* it failed. These are separate mechanisms, but they are deeply linked in practice. You raise an exception when you detect a problem; you log before or after to leave a breadcrumb trail.

## Logging fundamentals

### The core idea

Python's `logging` module gives you a **named tree of loggers**. Instead of sprinkling `print()` everywhere, you write to a logger, and the logger decides where to send the message: a file, the terminal, a list in memory, a log aggregator. You can change the destination without touching the code that *emits* the log.

```
root logger
└── myapp        ← your application's logger, created at startup
```

### Log levels: severity from low to high

| Level | Number | Meaning |
|-------|--------|---------|
| `DEBUG` | 10 | Verbose detail, useful during development |
| `INFO` | 20 | Normal milestones: "request processed", "job complete" |
| `WARNING` | 30 | Something unexpected, but the run continues |
| `ERROR` | 40 | Something failed; the run may or may not recover |
| `CRITICAL` | 50 | System-level failure |

A logger set to `DEBUG` passes everything through. A logger set to `INFO` drops all `DEBUG` messages. The level is a **floor**, not a filter. Furthermore, observe that the numbers are spaced 10 apart on purpose, leaving room in between. If the five built-in levels don't fit your use case, you can register a custom level, say, `NOTICE` at 25 and it slots in cleanly between `INFO` and `WARNING` without disturbing anything else.


### Getting and using a logger

```python
import logging

# Get a logger by name. If it doesn't exist yet, Python creates it.
# If it already exists, you get the same object back.
logger = logging.getLogger('myapp')

logger.debug("Entering processing phase")
logger.info("Job complete: %d items processed", len(items))
logger.warning("Resource %s is over capacity", resource_id)
logger.error("No solution found for job %s", job_id)
```

### Configure once, retrieve anywhere

The standard pattern is: configure the logger once at application startup, then retrieve it by name everywhere else.

```python
# startup.py — configure once
def setup_logging():
    logger = logging.getLogger('myapp')
    logger.setLevel(logging.DEBUG)
    # ... attach handlers ...
    return logger

# main.py — the app's entry point calls it exactly once
from startup import setup_logging

if __name__ == "__main__":
    setup_logging()
    run_app()

# any_other_module.py — retrieve by name, no config needed
logger = logging.getLogger('myapp')
```

The call in `main.py` has to happen *before* anything else logs. That is why it's the first line inside the entry point, not something left to whichever module happens to import first. Every other module just calls `getLogger('myapp')` and gets the already-configured logger back.

## Handlers and formatters

A **handler** answers: *where does the log message go?*
A **formatter** answers: *what does the message look like?*

A single logger can have multiple handlers, and each handler can have its own formatter and its own level floor.

### Example: two handlers on one logger

```python
def setup_logging():
    # Handler 1: keeps operator-facing messages in memory (for API responses)
    list_handler = ListHandler()
    list_handler.setFormatter(logging.Formatter('%(message)s'))
    list_handler.addFilter(_ExactLevel(logging.INFO))   # INFO only

    # Handler 2: writes structured JSON to stdout → log aggregator
    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(JsonFormatter())
    stream_handler.setLevel(logging.DEBUG)              # everything

    logger = logging.getLogger('myapp')
    logger.setLevel(logging.DEBUG)
    logger.addHandler(list_handler)
    logger.addHandler(stream_handler)

    return logger
```

So one `logger.info("...")` call fans out to *two* handlers simultaneously:

```
logger.info("Job complete")
    │
    ├── ListHandler   → appends {"level": "INFO", "message": "Job complete", ...}
    │                   (returned to the caller in the response body)
    │
    └── StreamHandler → writes {"level":"INFO","message":"Job complete","correlationId":"..."}
                        to stdout (picked up by your log aggregator)
```

### The custom `ListHandler`

```python
class ListHandler(logging.Handler):
    def __init__(self):
        super().__init__()
        self.log_messages = []          # just a plain list

    def emit(self, record):             # called once per log message
        self.log_messages.append({
            "level": record.levelname,
            "message": self.format(record),
            "correlationId": correlation_id_var.get(),
        })
```

`logging.Handler` is a base class. You should subclass it and implement `emit(record)`. A `LogRecord` carries the message text, level, timestamp, filename, line number, and any exception info. `self.format(record)` runs the attached formatter.

This pattern is how you embed accumulated log messages directly into an API response body. The handler collects them as the request runs, and you read `log_messages` when building the response.

### The custom `JsonFormatter`

```python
class JsonFormatter(logging.Formatter):
    def format(self, record):
        payload = {
            "level": record.levelname,
            "message": record.getMessage(),
            "correlationId": correlation_id_var.get(),
            "logger": record.name,
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload)
```

`logging.Formatter` is the base class for formatting. Override `format(record)` to return whatever string you want. The `if record.exc_info` block automatically appends the full stack trace when you log an exception with `logger.error("...", exc_info=True)` or `logger.exception("...")`.

### The level filter

```python
class _ExactLevel(logging.Filter):
    def __init__(self, level):
        self._level = level

    def filter(self, record):
        return record.levelno == self._level   # True = keep, False = drop
```

Handlers have a *floor* (`.setLevel()`), but no ceiling by default. This filter adds a ceiling: only exact-match `INFO` messages reach `ListHandler`. The result: operators see meaningful progress messages, not debug noise or errors. Errors go to the log aggregator, not to the operator-facing UI.

## Exception handling fundamentals

### What an exception is

An exception is an object that Python creates when something goes wrong. It travels *up the call stack* until some `except` clause catches it. If nothing catches it, the program crashes.

```
top_level_function()
  └── intermediate_function()
        └── raise InvalidRequestKey("Missing required field")
              ↑ bubbles up through intermediate_function → top_level_function
                → caught by the centralized exception handler
```

### `try` / `except` / `else` / `finally`

```python
try:
    result = risky_operation()    # code that might fail
except ValueError as e:
    print(f"Bad value: {e}")      # handle one specific type
except (KeyError, IndexError) as e:
    print(f"Missing data: {e}")   # handle multiple types together
else:
    print("Success:", result)     # runs ONLY if no exception was raised
finally:
    cleanup()                     # ALWAYS runs, exception or not
```

`else` is underused and useful: it keeps the "happy path" code separate from exception handling. `finally` is for cleanup (closing files, releasing locks) that must happen regardless.

<!-- ### Raising exceptions

```python
raise ValueError("something is wrong")        # create and raise immediately
raise                                          # re-raise the current exception (inside except)
raise RuntimeError("wrapper") from original_e  # chain: attaches original as __cause__
``` -->

### Custom exception classes

The simplest possible custom exception:

```python
class MyError(Exception):
    pass

raise MyError("details")
```

You inherit from `Exception` (or any subclass of it). Custom exceptions let callers write `except MyError` instead of `except Exception`. This is much more precise, and they won't accidentally catch unrelated errors.

## A structured exception pattern for APIs

### Exception classes with HTTP status codes

A clean pattern for REST APIs is to embed the HTTP status code directly on the exception class:

```python
class InvalidRequestKey(Exception):
    status_code = 400                              # class-level default

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)                   # always call super
        self.message = message
        if status_code is not None:
            self.status_code = status_code         # override default if provided
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv
```

Three things happening here:

1. **`status_code` as a class attribute** — every instance has a sensible HTTP default, but you can override per-raise: `raise InvalidRequestKey("...", 422)`.
2. **`message` stored on the instance** — unlike the built-in `Exception`, which stores its text in `.args`, this pattern has an explicit `.message`, making it easy to pull the text back out in an error handler.
3. **`to_dict()`** — a convenience method for serializing the exception to a response body.

### Where exceptions are raised

```python
@staticmethod
def _validate_request(body):
    if not body:
        raise InvalidRequestKey("Request missing JSON body", 400)
    resource_name = body.get('resource_name')
    if not resource_name:
        raise InvalidRequestKey("Request missing resource_name", 400)
    if resource_name not in KNOWN_RESOURCES:
        raise InvalidRequestKey(
            f"resource_name '{resource_name}' does not match any configured resource", 400
        )
```

Notice: no `try`/`except` here. The function checks conditions and raises. It is not responsible for *handling* the error — it is responsible for *detecting* it. Handling happens higher up the call stack.

<!-- ### Where exceptions are caught — the centralized handler

```python
@app.exception_handler(Exception)
async def handle_exception(request: Request, e: Exception):
    if isinstance(e, InvalidRequestKey):
        response = {
            "code": e.status_code,
            "name": "Invalid Request",
            "description": e.message,
            "logs": logger.handlers[0].log_messages
        }
        status_code = e.status_code
    elif isinstance(e, NoResultException):
        ...
    else:
        status_code = 500
        response = {"error": str(traceback.format_exc())}
        logger.error("Unhandled exception (500):\n%s", traceback.format_exc())

    logger.error("Request failed [%s] %s: %s",
                 status_code, type(e).__name__, getattr(e, 'message', str(e)))
    return JSONResponse(status_code=status_code, content=response)
```

This is the **centralized exception handler** pattern. FastAPI's `@app.exception_handler(Exception)` decorator tells the framework: whenever an unhandled exception bubbles out of any endpoint function, call this function instead of crashing.

The handler does three things:
1. Dispatches on type with `isinstance()` to build the right JSON response body.
2. Logs the error with its status code and type.
3. Returns a `JSONResponse` — the request always gets a proper HTTP response, never a naked 500.

The `logs` key in each response contains all the `INFO` messages the `ListHandler` accumulated during that request.

## The full picture

Here is the flow for a bad request, end to end:

```
POST /process  (invalid resource name)
│
├── auth middleware
│     └── calls await call_next(request)
│
├── process_endpoint()
│     └── validate_and_run(body)
│           └── _validate_request(body)
│                 └── raise InvalidRequestKey("resource_name 'BOGUS' does not match...", 400)
│
└── InvalidRequestKey bubbles up to @exception_handler(Exception)
      ├── isinstance check → builds {"code":400, "name":"Invalid Request", ...}
      ├── logger.error("Request failed [400] InvalidRequestKey: ...")
      │     ├── ListHandler  → appends to .log_messages  (included in response body)
      │     └── StreamHandler → writes JSON to stdout → log aggregator
      └── return JSONResponse(status_code=400, content={...})
```

The caller gets a structured JSON body with a human-readable description and the accumulated log messages. The ops team sees the same event in the log aggregator, with a correlation ID for tracing. -->

## Best practices

**Use specific exception types.**

```python
# bad — catches everything, masks real bugs
try:
    result = compute()
except Exception:
    pass

# good — only handles what you expect
try:
    result = compute()
except NoResultException as e:
    logger.warning("No result, returning fallback: %s", e.message)
    result = fallback()
```

**Let exceptions propagate when you can't meaningfully handle them.** Deep business logic functions should raise exceptions and let a centralized handler deal with them. They shouldn't each have their own `try`/`except`. This keeps error-handling logic in one place and business logic clean.

**Log at the right level.**

| Situation | Level |
|-----------|-------|
| "I'm entering this function" | `DEBUG` |
| "Batch of 42 items processed" | `INFO` |
| "Requested resource doesn't exist, using fallback" | `WARNING` |
| "Caught an unhandled exception" | `ERROR` |

If `INFO` messages go to an operator-facing UI, be deliberate: only log what an operator would actually want to see there.

**Include context in log messages.**

```python
# hard to debug
logger.error("Processing failed")

# useful
logger.error("Processing failed for job %s at stage %s: %s",
             job_id, stage_name, e.message)
```

**Log the full traceback for unexpected errors.**

```python
else:
    status_code = 500
    response = {"error": str(traceback.format_exc())}
    logger.error("Unhandled exception (500):\n%s", traceback.format_exc())
```

For known exceptions a short message is enough — you know what happened. For anything unexpected, you want the full stack trace.

**Avoid bare `except:` or `except Exception: pass`.** Silently swallowing exceptions is how bugs disappear into the void and reappear six months later as mysterious wrong answers.

**Avoid logging and re-raising the same exception.**

```python
# don't do this — the error gets logged twice when the caller also logs it
try:
    risky()
except SomeError as e:
    logger.error("Failed: %s", e)
    raise   # ← now the top-level handler logs it again
```

<!-- Decide at *one level* whether to log. Usually the highest-level handler logs; intermediate code just re-raises. -->

## Cleaning up the exception hierarchy

If you have several custom exception classes with identical `__init__` and `to_dict` boilerplate, refactor them into a hierarchy:

```python
class AppException(Exception):
    status_code = 500

    def __init__(self, message, status_code=None, payload=None):
        super().__init__(message)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

class InvalidRequestKey(AppException):
    status_code = 400

class NoResultException(AppException):
    status_code = 410

class MissingConfigException(AppException):
    status_code = 420
```

Then the centralized handler simplifies to:

```python
if isinstance(e, AppException):
    response = {
        "code": e.status_code,
        "name": type(e).__name__,
        "description": e.message,
        "logs": ...
    }
    status_code = e.status_code
else:
    ...  # unexpected 500
```

<!-- This eliminates the `isinstance` chain and makes adding new exception types trivial — just subclass `AppException` and set a `status_code`.

## Summary

| Concept | What it is | How it's used |
|---------|------------|---------------|
| Logger | Named channel for emitting messages | `logging.getLogger('myapp')` |
| Handler | Destination for log messages | `ListHandler`, `StreamHandler` |
| Formatter | Shape of each message | `JsonFormatter`, `%(message)s` |
| Filter | Fine-grained control over what gets emitted | `_ExactLevel` |
| Custom exception | Named signal for a specific failure mode | `InvalidRequestKey`, `NoResultException` |
| Centralized handler | Single place that turns exceptions into HTTP responses | `@app.exception_handler(Exception)` | -->

The key mental model: **raise early, handle late**. Deep in business logic you raise a specific exception. You don't try to handle it there; you let it bubble up to the outermost layer, which knows how to turn it into a proper HTTP response and a log entry. That separation keeps business logic clean and error handling consistent.