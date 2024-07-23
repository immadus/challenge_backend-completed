## Task 1 - Identify and fix the issue with getCatsInfo API

### Issue
The getCatsInfo API was failing after a few requests due to an issue with token refresh mechanism in the getCatsWorker.

### Root Cause
The original implementation only refreshed the token once, 5 seconds after its initial generation. This caused the token to expire after subsequent requests, breaking the API.

### Fix Applied
The token generation mechanism in `getCatsWorker.js` has been updated to check the token's age on every request. If the token is older than 5 seconds, a new one is generated. This ensures that a fresh token is always available for API requests.

### Files Changed
- `workers/getCatsWorker.js`

### Additional Suggestions and Best Practices
1. Implement proper error handling and logging in the worker threads to make debugging easier.
2. Consider using a more robust caching mechanism for tokens, such as Redis, for better scalability.
3. Implement rate limiting to prevent abuse of the API.
4. Add unit tests for the token generation and refresh mechanism to ensure its reliability.
5. Consider implementing a circuit breaker pattern for the token service to handle potential failures gracefully.



## Task 2 - Add correlationId header to all the requests and response

### Changes Made
- Added a new utility function to generate correlation IDs.
- Implemented a hook in the main server file to check for and generate correlation IDs for each request.
- Modified the worker generation utility to pass correlation IDs in responses.
- Updated worker files to include correlation IDs in their messages back to the main thread.

### Files Changed
1. `index.js`
2. `utils/generateNewWorker.js`
3. `workers/getCatsWorker.js`
4. `workers/getDogsWorker.js`
5. `utils/correlationId.js` (new file)

### Implementation Details
- A new `x-correlation-id` header is now present in all requests and responses.
- If a client provides a correlation ID, it will be used; otherwise, a new one is generated.
- The correlation ID is passed through the entire request lifecycle, including worker threads.

### Best Practices
- Use the correlation ID for logging throughout the application to easily trace requests.
- Consider adding the correlation ID to any external service calls for end-to-end tracing.
- Implement logging middleware that includes the correlation ID in all log messages.



## Task 3 - Terminate the idle worker and recreate when needed

### Approach
We implemented a system to manage worker threads efficiently by terminating idle workers and creating new ones on demand. This approach helps to conserve system resources while ensuring that workers are available when needed.

### Key Features
1. Idle Worker Termination: Workers that haven't received requests for 15 minutes are automatically terminated.
2. On-Demand Worker Creation: New workers are created when a request comes in and no active worker is available.
3. Idle Timer Reset: The idle timer for a worker is reset after each message it processes.
4. Logging: Worker creation and termination events are logged to the console for monitoring.

### Files Changed
1. `utils/generateNewWorker.js`: Major changes to implement worker management logic.
2. `index.js`: Updated to use the new worker management system.

### Implementation Details
- A `workers` object keeps track of all active workers and their idle timers.
- The `getOrCreateWorker` function either returns an existing worker or creates a new one if needed.
- Each worker has an idle timer that is reset after processing a message.
- If the idle timer reaches 15 minutes, the worker is terminated and removed from the `workers` object.
- Worker creation and termination events are logged to the console.

### Best Practices
- Consider implementing more robust logging, possibly to a file or external logging service.
- Monitor the frequency of worker creation and termination to optimize the idle timeout.
- Implement error handling for scenarios where worker creation fails.
- Consider adding metrics to track worker lifecycle and performance.