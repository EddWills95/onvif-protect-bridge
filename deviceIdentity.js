// deviceIdentity.ts
import crypto from "crypto";

export const DEVICE_UUID = crypto.randomUUID();
console.log("Device UUID:", DEVICE_UUID);
