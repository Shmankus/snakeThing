import "./polyfills.mjs"; // must be first

import { DeskThing } from "@deskthing/server";
import { DESKTHING_EVENTS } from "@deskthing/types";
import WebSocket from "ws";
import path from "path";
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
let pythonServer: import('child_process').ChildProcess | null = null;
let statsPythonServer: ChildProcessWithoutNullStreams | null = null;
import { createRequire } from 'module';

                    


import { setupSettings } from './settings';

// Initialize settings
setupSettings().catch(error => {
  console.error('Failed to setup settings:', error);
  DeskThing.sendFatal("Failed to setup settings: " + error.message);
});


// globals
let wsClient: WebSocket | null = null;

// ===================== Data Send Loops ===================








export const start = async () => {

     DeskThing.send({
      type: "dateTime",
      payload: new Date().toISOString(),
    });

};

const stop = async () => {

  DeskThing.sendLog("Server Stopped");
  wsClient?.close();
  wsClient = null;
};

DeskThing.on(DESKTHING_EVENTS.START, start);
DeskThing.on(DESKTHING_EVENTS.STOP, stop);
