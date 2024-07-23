const fastify = require("fastify")({ logger: true, connectionTimeout: 5000 });
const { generateCorrelationId } = require("./utils/correlationId");
const { getOrCreateWorker } = require("./utils/generateNewWorker");
const requestTracker = require("./utils/requestTracker");

fastify.addHook("onRequest", (request, reply, done) => {
  const correlationId =
    request.headers["x-correlation-id"] || generateCorrelationId();
  request.correlationId = correlationId;
  reply.header("x-correlation-id", correlationId);
  done();
});

fastify.get("/getCatsInfo", function handler(request, reply) {
  requestTracker[request.id] = (result) => reply.send(result);
  const worker = getOrCreateWorker("getCatsWorker.js");
  worker.postMessage({
    requestId: request.id,
    correlationId: request.correlationId,
  });
});

fastify.get("/getDogsInfo", function handler(request, reply) {
  requestTracker[request.id] = (result) => reply.send(result);
  const worker = getOrCreateWorker("getDogsWorker.js");
  worker.postMessage({
    requestId: request.id,
    correlationId: request.correlationId,
  });
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
