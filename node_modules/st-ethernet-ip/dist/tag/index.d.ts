/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from 'events';
type tag = {
    name: string;
    type: number;
    bitIndex: number;
    arrayDims: number;
    value: any;
    controllerValue: any;
    path: Buffer;
    program: string;
    stage_write: boolean;
};
type tagError = {
    code: number;
    status: any;
};
type tagState = {
    tag: tag;
    read_size: number;
    error: tagError;
    timestamp: Date;
    instance: string;
    keepAlive: number;
};
export declare interface Tag extends EventEmitter {
    state: tagState;
    on(event: string, listener: Function): this;
    on(event: 'Changed', listener: (this: this, previousValue: any) => {}): this;
    on(event: 'Initialized', listener: (this: this) => {}): this;
    on(event: 'Unknown', listener: (this: this) => {}): this;
    on(event: 'KeepAlive', listener: (this: this) => {}): this;
}
export declare class Tag extends EventEmitter {
    /**
     * PLC Tag Object
     *
     * @param tagname - Tagname
     * @param program - Program name. Leave undefined for Controller scope
     * @param datatype - Data type code if it needs to be explicitly defined (Not commonly used)
     * @param keepAlive - Time interval in mS to set stage_write to true to keep connection alive.  0 = disabled.
     * @param arrayDims - Dimensions of an array tag
     * @param arraySize - Size of array
     */
    constructor(tagname: string, program?: string, datatype?: number, keepAlive?: number, arrayDims?: number, arraySize?: number);
    /**
     * Returns the total number of Tag Instances
     * that have been Created
     *
     * @readonly
     * @static
     * @returns instances
     */
    static get instances(): number;
    /**
     * Returns the Tag Instance ID
     *
     * @readonly
     * @returns Instance ID
     */
    get instance_id(): string;
    /**
     * Gets Tagname
     *
     * @returns tagname
     */
    get name(): string;
    /**
     * Gets Program Name
     *
     * @returns program
     */
    get program(): string;
    /**
     * Sets Tagname if Valid
     *
     * @param name - New Tag Name
     */
    set name(name: string);
    /**
     * Gets Tag Datatype
     *
     * @returns datatype
     */
    get type(): string;
    /**
     * Gets Tag Bit Index
     * - Returns null if no bit index has been assigned
     *
     * @returns bitIndex
     */
    get bitIndex(): number;
    /**
     * Sets Tag Datatype if Valid
     *
     * @param type - Valid Datatype Code
     */
    set type(type: string | number);
    /**
     * Gets Tag Read Size
     *
     * @returns read size
     */
    get read_size(): number;
    /**
     * Sets Tag Read Size
     *
     * @param size - read size
     */
    set read_size(size: number);
    /**
     * Gets Tag value
     * - Returns null if no value has been read
     *
     * @returns value
     */
    get value(): any;
    /**
     * Sets Tag Value
     *
     * @param newValue - value
     */
    set value(newValue: any);
    /**
     * Sets Controller Tag Value and Emits Changed Event
     *
     * @param new - value
     */
    set controller_value(newValue: any);
    /**
     * Sets Controller Tag Value and Emits Changed Event
     *
     * @returns new value
     */
    get controller_value(): any;
    /**
     * Gets Timestamp in a Human Readable Format
     *
     * @readonly
     * @returns Timestamp formatted as "mm/dd/yyyy-HH:MM:ss.l"
     */
    get timestamp(): string;
    /**
     * Gets Javascript Date Object of Timestamp
     *
     * @readonly
     * @returns Date object
     */
    get timestamp_raw(): Date;
    /**
     * Gets Error
     *
     * @readonly
     * @returns error
     */
    get error(): tagError;
    /**
     * Returns a Padded EPATH of Tag
     *
     * @readonly
     * @returns Padded EPATH
     */
    get path(): Buffer;
    /**
     * Returns a whether or not a write is staging
     *
     * @returns true or false
     */
    get write_ready(): boolean;
    unknownTag(): void;
    /**
     * Generates Read Tag Message
     *
     * @param size
     * @returns {buffer} - Read Tag Message Service
     */
    generateReadMessageRequest(size?: number): Buffer;
    /**
     * Generates Fragmented Read Tag Message
     *
     * @param offset - offset based on previous message
     * @param size
     * @returns Read Tag Message Service
     */
    generateReadMessageRequestFrag(offset?: number, size?: number): Buffer;
    /**
     *  Parses Good Read Request Messages
     *
     * @param Data - Returned from Successful Read Tag Request
     */
    parseReadMessageResponse(data: Buffer): void;
    /**
     *  Parses Good Read Request Messages Using A Mask For A Specified Bit Index
     *
     * @param Data - Returned from Successful Read Tag Request
     */
    parseReadMessageResponseValueForBitIndex(data: Buffer): void;
    /**
     *  Parses Good Read Request Messages For Atomic Data Types
     *
     * @param Data - Returned from Successful Read Tag Request
     */
    parseReadMessageResponseValueForAtomic(data: Buffer): void;
    /**
     * Generates Write Tag Message
     *
     * @param value - If Omitted, Tag.value will be used
     * @param size
     * @returns Write Tag Message Service
     * @memberof Tag
     */
    generateWriteMessageRequest(value?: any, size?: number): Buffer;
    /**
     * Generates Write Tag Message For A Bit Index
     *
     * @param value
     * @returns Write Tag Message Service
     */
    generateWriteMessageRequestForBitIndex(value: number): Buffer;
    /**
     * Generates Write Tag Message For Atomic Types
     *
     * @param value
     * @param size
     * @returns Write Tag Message Service
     */
    generateWriteMessageRequestForAtomic(value: any, size: number): Buffer;
    /**
     * Generates Write Tag Message Frag
     *
     * @param offset - Offset of data already written
     * @param value - If Omitted, Tag.value will be used
     * @param size
     * @returns Write Tag Message Service
     * @memberof Tag
     */
    generateWriteMessageRequestFrag(offset: number, value: any, size?: number): Buffer;
    /**
     * Unstages Value Edit by Updating controllerValue
     * after the Successful Completion of
     * a Tag Write
     *
     * @memberof Tag
     */
    unstageWriteRequest(): void;
    /**
     * Determines if a Tagname is Valid
     *
     * @param tagname - Name of PLC tag
     * @returns true or false
     */
    static isValidTagname(tagname: string): boolean;
}
export default Tag;
