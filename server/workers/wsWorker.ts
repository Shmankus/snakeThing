// wsWorker.ts
import { parentPort } from 'worker_threads';
import WebSocket from 'ws';

let wsClient: WebSocket | null = null;

function connectWs() {
  if (wsClient && wsClient.readyState === WebSocket.OPEN) return;

  wsClient = new WebSocket("ws://127.0.0.1:6789");

  wsClient.on("message", (data) => {
    // Instead of DeskThing.send, forward the message to the main thread
    parentPort?.postMessage({
      type: "screenCaptureBase64",
      payload: data.toString()
    });
  });

  wsClient.on("close", () => {
    parentPort?.postMessage({ type: "log", payload: "WS connection closed" });
    wsClient = null;
  });

  wsClient.on("error", (err) => {
    parentPort?.postMessage({ type: "error", payload: err.message });
    wsClient = null;
  });
}

// start connection
connectWs();

// optional: ping or heartbeat to keep worker alive
setInterval(() => {
  parentPort?.postMessage({ type: "log", payload: "Worker alive" });
}, 5000);
