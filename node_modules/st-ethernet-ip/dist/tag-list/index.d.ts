/// <reference types="node" />
import { Template } from "../structure";
import type Controller from '../controller';
type tagListTagType = {
    code: number;
    sintPos: number;
    typeName: string;
    structure: boolean;
    arrayDims: number;
    reserved: boolean;
};
type tagListTag = {
    id: number;
    name: string;
    type: tagListTagType;
    program: string;
};
type tagListTemplates = {
    [index: string]: Template;
};
declare class TagList {
    tags: tagListTag[];
    templates: tagListTemplates;
    /**
     * TagList Class for retrieving a list of all tags on a PLC
     */
    constructor();
    /**
     * Generates the CIP message to request a list of tags
     *
     * @param instanceID- instance id to start getting a list of object tags
     * @param program - (optional) name of the program to search
     * @returns message to be sent to PLC
     */
    _generateListMessageRequest(instanceID?: number, program?: string): Buffer;
    /**
     * Parse CIP response into tag data
     *
     * @param data - Buffer data to parse
     * @param program - (optional) name of the program tag is from (optional)
     * @returns Last instance id parsed
     */
    _parseAttributeListResponse(data: Buffer, program?: string): number;
    /**
     * Get and store tag type name from code for all tags
     */
    _getTagTypeNames(): void;
    /**
     *
     * @param tagType - tag type numerical value
     * @returns tag list type object
     */
    _parseTagType(tagType: number): tagListTagType;
    /**
     * Parse CIP response into tag data
     *
     * @param PLC - Controller to get tags from
     * @param program - (optional) name of the program tag is from (optional)
     * @returns Promise resolves taglist array
     */
    getControllerTags(PLC: Controller, program?: string): Promise<tagListTag[]>;
    /**
     * Gets Controller Program Names
     *
     * @returns array of program names
     */
    get programs(): string[];
    /**
     * Gets tag info from tag name and program name
     *
     * @param tagName
     * @param program
     * @returns
     */
    getTag(tagName: string, program?: string): tagListTag;
    /**
     *
     * @param tagName
     * @param program
     * @returns tag template or null if none
     */
    getTemplateByTag(tagName: string, program?: string): Template;
    /**
     * Get all templates from a PLC
     *
     * @param PLC
     * @returns Promise that resolves after all templates are retrieved from PLC
     */
    _getAllTemplates(PLC: Controller): Promise<void>;
}
export default TagList;
export { tagListTag, tagListTemplates, tagListTagType };
