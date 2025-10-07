/// <reference types="node" />
/**
 * lookup for the Redundant Owner (Vol.1 - Table 3-5.8 Field 15)
 */
declare const owner: {
    Exclusive: number;
    Multiple: number;
};
/**
 * lookup for the Connection Type (Vol.1 - Table 3-5.8 Field 14,13)
 */
declare const connectionType: {
    Null: number;
    Multicast: number;
    PointToPoint: number;
    Reserved: number;
};
/**
 * lookup for the Connection Priority (Vol.1 - Table 3-5.8 Field 11,10)
 */
declare const priority: {
    Low: number;
    High: number;
    Scheduled: number;
    Urgent: number;
};
/**
 * lookup for the fixed or variable parameter (Vol.1 - Table 3-5.8 Field 9)
 */
declare const fixedVar: {
    Fixed: number;
    Variable: number;
};
/**
 * Build for Object specific connection parameters (Vol.1 - Table 3-5.8)
 */
declare const build_connectionParameters: (owner: number, type: number, priority: number, fixedVar: number, size: number) => number;
/**
 * lookup table for Time Tick Value (Vol.1 - Table 3-5.11)
 */
declare const timePerTick: {
    1: number;
};
declare const connSerial = 4919;
/**
 * lookup table for Timeout multiplier (Vol.1 - 3-5.4.1.4)
 */
declare const timeOutMultiplier: {
    4: number;
    8: number;
    16: number;
    32: number;
    64: number;
    128: number;
    256: number;
    512: number;
};
/**
 * Builds the data portion of a forwardOpen packet
 *
 * @param timeOutMs - How many ticks until a timeout is thrown
 * @param timeOutMult - A multiplier used for the Timeout
 * @param otRPI - O->T Request packet interval in milliseconds.
 * @param serialOrig - Originator Serial Number (SerNo of the PLC)
 * @param netConnParams - Encoded network connection parameters
 * @returns Data portion of the forwardOpen packet
 */
declare const build_forwardOpen: (otRPI?: number, netConnParams?: number, timeOutMs?: number, timeOutMult?: number, connectionSerial?: number, TOconnectionID?: number) => Buffer;
/**
 * Builds the data portion of a forwardClose packet
 *
 * @param timeOutMs - How many ms until a timeout is thrown
 * @param vendorOrig - Originator vendorID (Vendor of the PLC)
 * @param serialOrig - Originator Serial Number (SerNo of the PLC)
 * @param connectionSerial - Connection Serial Number
 * @returns Data portion of the forwardClose packet
 */
declare const build_forwardClose: (timeOutMs?: number, vendorOrig?: number, serialOrig?: number, connectionSerial?: number) => Buffer;
export { build_forwardOpen, build_forwardClose, build_connectionParameters, connSerial, timePerTick, timeOutMultiplier, priority, owner, connectionType, fixedVar };
