/// <reference types="node" />
type UCMMSendTimeout = {
    time_tick: number;
    ticks: number;
};
/**
 * Gets the Best Available Timeout Values
 *
 * @param timeout - Desired Timeout in ms
 * @returns Timeout Values
 */
declare const generateEncodedTimeout: (timeout: number) => UCMMSendTimeout;
/**
 * Builds an Unconnected Send Packet Buffer
 *
 * @param message_request - Message Request Encoded Buffer
 * @param path - Padded EPATH Buffer
 * @param timeout - timeout
 * @returns packet
 */
declare const build: (message_request: Buffer, path: Buffer, timeout?: number) => Buffer;
export { generateEncodedTimeout, build };
