/// <reference types="node" />
type templateType = {
    code: number;
    string: string;
    structure: boolean;
    reserved: boolean;
    arrayDims: number;
};
type templateMember = {
    name: string;
    info: number;
    type: templateType;
    offset: number;
};
type templateAttributes = {
    id: number;
    ObjDefinitionSize: number;
    StructureSize: number;
    MemberCount: number;
    StructureHandle: number;
};
declare class Template {
    _attributes: templateAttributes;
    _members: templateMember[];
    _name: string;
    id: number;
    /**
     * Template Class reads and parses information template information that is used for parsing STRUCT datatypes
     */
    constructor();
    /**
     * Build CIP message to get template attributes
     *
     * @param templateID - Id number of template
     * @returns CIP message to get template attributes
     */
    _buildGetTemplateAttributesCIP(templateID: number): Buffer;
    /**
     * Parse message response and store template attributes
     *
     * @param data - message response
     */
    _parseReadTemplateAttributes(data: Buffer): void;
    /**
     * Build CIP message to get template members
     *
     * @param offset
     * @param reqSize
     * @returns CIP message to get template members
     */
    _buildGetTemplateCIP(offset: number, reqSize: number): Buffer;
    /**
     * Parse Template message data to create and store template member info
     *
     * @param data
     */
    _parseReadTemplate(data: Buffer): void;
    /**
     * Retrives Template attributes from PLC
     *
     * @param PLC - Controller Class Object
     * @param templateID - template ID number
     * @returns Promise resolved after retrival of template attributes
     */
    _getTemplateAttributes(PLC: any, templateID: number): Promise<void>;
    /**
     * Retrives the Template from PLC based on attribute data
     *
     * @param PLC - Controller Class object
     * @returns
     */
    _getTemplate(PLC: any): Promise<void>;
    /**
     * Retrives complete template from PLC
     *
     * @param PLC - Controller Class object
     * @param templateID - Template ID
     * @returns Promise resolved upon retrival of template
     */
    getTemplate(PLC: any, templateID: number): Promise<void>;
}
export default Template;
