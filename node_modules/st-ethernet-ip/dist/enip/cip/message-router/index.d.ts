/// <reference types="node" />
declare const services: {
    GET_INSTANCE_ATTRIBUTE_LIST: number;
    GET_ATTRIBUTES: number;
    GET_ATTRIBUTE_ALL: number;
    GET_ATTRIBUTE_SINGLE: number;
    GET_ENUM_STRING: number;
    RESET: number;
    START: number;
    STOP: number;
    CREATE: number;
    DELETE: number;
    MULTIPLE_SERVICE_PACKET: number;
    APPLY_ATTRIBUTES: number;
    SET_ATTRIBUTE_SINGLE: number;
    FIND_NEXT: number;
    READ_TAG: number;
    WRITE_TAG: number;
    READ_TAG_FRAGMENTED: number;
    WRITE_TAG_FRAGMENTED: number;
    READ_MODIFY_WRITE_TAG: number;
    FORWARD_OPEN: number;
    FORWARD_CLOSE: number;
    GET_FILE_DATA: number;
};
/**
 * Builds a Message Router Request Buffer
 *
 * @param service - CIP Service Code
 * @param path - CIP Padded EPATH (Vol 1 - Appendix C)
 * @param data - Service Specific Data to be Sent
 * @returns Message Router Request Buffer
 */
declare const build: (service: number, path: Buffer, data: Buffer) => Buffer;
type MessageRouter = {
    service: number;
    generalStatusCode: number;
    extendedStatusLength: number;
    extendedStatus: [number];
    data: Buffer;
};
/**
 * Parses a Message Router Request Buffer
 *
 * @param buf - Message Router Request Buffer
 * @returns Decoded Message Router Object
 */
declare const parse: (buf: Buffer) => MessageRouter;
export { build, parse, services };
