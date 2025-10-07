/// <reference types="node" />
/**
 * Builds Port Segement for EPATH
 *
 * @param port - Port to leave Current Node (1 if Backplane)
 * @param link - link address to route packet
 * @returns EPATH Port Segment
 */
declare const build: (port: number, link: number | string) => Buffer;
export { build };
