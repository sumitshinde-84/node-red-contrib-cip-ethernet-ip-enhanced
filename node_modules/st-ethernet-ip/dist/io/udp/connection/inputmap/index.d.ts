/// <reference types="node" />
type inputMapItem = {
    size: number;
    byte: number;
    offset: number;
    name: string;
    value: any;
};
declare class InputMap {
    mapping: inputMapItem[];
    /**
     * Helper to decode input buffer to process value
     */
    constructor();
    /**
     * Add a bit value to decode
     *
     * @param byte - Which byte to start at
     * @param offset - Number of bits to offset
     * @param name - Unique name to reference value
     */
    addBit(byte: number, offset: number, name: string): void;
    /**
     * Add a 16 bit integer value to decode
     *
     * @param byte - Number off bytes to offset
     * @param name - Unique name to reference value
     */
    addInt(byte: number, name: string): void;
    /**
     * Reads input buffer and decodes each map process value
     *
     * @param data - Device input buffer
     */
    _readMap(data: Buffer): void;
    /**
     * Get a process value from a input buffer
     *
     * @param name - Name of map item
     * @param buf - Device input buffer
     * @returns Process value
     */
    getValue(name: string, buf: Buffer): any;
    /**
     * Get array of names assigned to mappings
     *
     * @returns Array of names
     */
    getNames(): string[];
}
export default InputMap;
