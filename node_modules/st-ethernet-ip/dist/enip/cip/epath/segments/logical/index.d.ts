/// <reference types="node" />
declare const types: {
    ClassID: number;
    InstanceID: number;
    MemberID: number;
    ConnPoint: number;
    AttributeID: number;
    Special: number;
    ServiceID: number;
};
/**
 * Builds Single Logical Segment Buffer
 *
 * @param type - Valid Logical Segment Type
 * @param address - Logical Segment Address
 * @param padded - Padded or Packed EPATH format
 * @returns segment
 */
declare const build: (type: number, address: number, padded?: boolean) => Buffer;
export { types, build };
