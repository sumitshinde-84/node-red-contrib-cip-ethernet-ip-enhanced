/// <reference types="node" />
import Tag from "../tag";
import Template from "./template";
import type TagList from '../tag-list';
export declare interface Structure extends Tag {
    _valueObj: any;
    _taglist: any;
    _template: Template;
}
export declare class Structure extends Tag {
    /**
     * Structure Class to handle structure tags
     *
     * @param tagname - Tagname
     * @param taglist - Tag list of PLC. Needs to be retrieved first.
     * @param program - Program name. Leave undefined for Controller scope
     * @param datatype - Data type code if it needs to be explicitly defined (Not commonly used)
     * @param keepAlive - Time interval in mS to set stage_write to true to keep connection alive.  0 = disabled.
     * @param arrayDims - Dimensions of an array tag
     * @param arraySize - Size of array
     */
    constructor(tagname: string, taglist: TagList, program?: string, datatype?: number, keepAlive?: number, arrayDims?: number, arraySize?: number);
    /**
     * Gets structure tag value as an object containing all members
     */
    get value(): any;
    /**
     * Parses either single or array of structures
     *
     * @param data - tag value as a data buffer
     * @returns tag value as an object containing all members
     */
    parseValue(data: Buffer): any;
    /**
     * Sets structure tag value as an object containing all members
     */
    set value(newValue: any);
    /**
     * Write current value as object to value as buffer
     */
    writeObjToValue(): void;
    /**
     * Generates write message to write current structure value to PLC
     *
     * @param value
     * @param size
     * @returns Write message request
     */
    generateWriteMessageRequest(value?: any, size?: number): Buffer;
    /**
     * Generates write message to write current structure value to PLC
     *
     * @param offset - Offset of data already written
     * @param value - Fragment of value of structure as a buffer
     * @param size - size of the data
     * @returns message
     */
    generateWriteMessageRequestFrag(offset?: number, value?: Buffer, size?: number): Buffer;
    /**
     * Parse structure data read from PLC
     *
     * @param data - data from PLC
     * @param template - Template that forms the data structure
     * @returns Structure tag value as an object
     */
    _parseReadData(data: Buffer, template: Template): any;
    /**
     * Parses and array of structure tag data read from PLC
     * @param data - data from PLC
     * @returns Array of structure tag values as objects
     */
    _parseReadDataArray(data: Buffer): any[];
    /**
     * Creates data to send to PLC to write structure value
     *
     * @param structValues - Structure tag value as an object / string
     * @param template - Template of Structure tag
     * @returns Data to be sent to PLC
     */
    _parseWriteData(structValues: any, template: Template): Buffer;
    /**
     * Creates data to send to PLC to write and array of structure values
     *
     * @param newValue - array of sture values that are objects / strings
     * @returns data message to be sent to PLC
     */
    _parseWriteDataArray(newValue: any[]): Buffer;
    /**
     * Get current value on the PLC controller
     */
    get controller_value(): Buffer;
    /**
     *  Set controller value and update object value
     *  @param newValue - Structure tag value as a buffer
     */
    set controller_value(newValue: any);
}
export { Template };
