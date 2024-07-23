const { Worker } = require("worker_threads");
const path = require("path");
const requestTracker = require("./requestTracker");

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

let workers = {};

const generateNewWorker = (workerName) => {
  console.log(`Creating new worker: ${workerName}`);
  const worker = new Worker(path.join(__dirname, "../workers", workerName));

  worker.on("message", (data) => {
    const { response, requestId, correlationId } = data; 
    requestTracker[requestId]({ response, correlationId });
    delete requestTracker[requestId];

    // Reset the idle timer after each message
    resetIdleTimer(workerName);
  });

  worker.on("error", () => {
    console.log(`Worker ${workerName} encountered an error. Terminating.`);
    terminateWorker(workerName);
  });

  workers[workerName] = {
    worker,
    idleTimer: setTimeout(() => terminateWorker(workerName), IDLE_TIMEOUT),
  };

  return worker;
};

const resetIdleTimer = (workerName) => {
  if (workers[workerName]) {
    clearTimeout(workers[workerName].idleTimer);
    workers[workerName].idleTimer = setTimeout(
      () => terminateWorker(workerName),
      IDLE_TIMEOUT
    );
  }
};

const terminateWorker = (workerName) => {
  if (workers[workerName]) {
    console.log(`Terminating idle worker: ${workerName}`);
    workers[workerName].worker.terminate();
    clearTimeout(workers[workerName].idleTimer);
    delete workers[workerName];
  }
};

const getOrCreateWorker = (workerName) => {
  if (!workers[workerName]) {
    return generateNewWorker(workerName);
  }
  resetIdleTimer(workerName);
  return workers[workerName].worker;
};

module.exports = { getOrCreateWorker };
