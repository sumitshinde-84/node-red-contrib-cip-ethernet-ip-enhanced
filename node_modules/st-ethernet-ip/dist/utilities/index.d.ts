/// <reference types="node" />
/**
 * Wraps a Promise with a Timeout
 *
 * @param promise - Promise to add timeout to
 * @param ms - Timeout Length (ms)
 * @param error - Error to Emit if Timeout Occurs
 * @returns promise that rejects if not completed by timeout length
 */
declare const promiseTimeout: (promise: Promise<any>, ms: number, error?: Error | string) => Promise<any>;
/**
 * Delays X ms
 *
 * @param ms - Delay Length (ms)
 * @returns Promise resolved after delay length
 */
declare const delay: (ms: number) => Promise<void>;
/**
 * Helper Funcs to process strings
 *
 * @param buff - Buffer with encoded string length
 * @returns String
 */
declare const bufferToString: (buff: Buffer) => string;
/**
 * Helper Funcs to process strings
 *
 * @param str - Text string
 * @param len - Buffer Length to be encode string on to
 * @returns Buffer
 */
declare const stringToBuffer: (str: string, len?: number) => Buffer;
type structureString = {
    DATA: Buffer;
    LEN: number;
};
/**
 * Convert string stucture object to string
 *
 * @param obj - string structure object
 * @returns
 */
declare const objToString: (obj: structureString) => string;
/**
 * Convert string to string structure object
 *
 * @param str - String to encode
 * @param len - Buffer length
 * @returns
 */
declare const stringToObj: (str: any, len?: number) => {
    LEN: any;
    DATA: any[];
};
export { promiseTimeout, delay, stringToBuffer, bufferToString, objToString, stringToObj };
