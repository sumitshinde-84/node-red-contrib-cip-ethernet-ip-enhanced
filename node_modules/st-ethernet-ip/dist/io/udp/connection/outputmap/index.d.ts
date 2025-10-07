/// <reference types="node" />
type outputMapItem = {
    size: number;
    byte: number;
    offset: number;
    name: string;
    value: any;
};
declare class OutputMap {
    mapping: outputMapItem[];
    /**
     * Helper to encode input buffer from process value
     */
    constructor();
    /**
     * Add a bit value to encode
     *
     * @param byte - Which byte to start at
     * @param offset - Number of bits to offset
     * @param name - Unique name to reference value
     * @param value - Initial value
     */
    addBit(byte: number, offset: number, name: string, value?: boolean): void;
    /**
     * Add a 16 bit integer value to encode
     *
     * @param byte - Number off bytes to offset
     * @param name - Unique name to reference value
     * @param value - Initial value
     */
    addInt(byte: number, name: string, value?: number): void;
    /**
     * Reads encodes each map process value and writes to buffer
     *
     * @param data - Device output buffer
     * @returns Device output buffer encoded with values
     */
    _writeMap(data: Buffer): Buffer;
    /**
     * Set a process value for a output buffer
     *
     * @param name - Name of map item
     * @param data - Device input buffer
     * @param value - New value to send to device
     * @returns Output buffer to send to device
     */
    setValue(name: string, value: any, data: Buffer): Buffer;
    /**
     * Get array of names assigned to mappings
     *
     * @returns Array of names
     */
    getNames(): string[];
}
export default OutputMap;
