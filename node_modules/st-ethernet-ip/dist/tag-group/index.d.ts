/// <reference types="node" />
import type Tag from "../tag";
type tagGroupState = {
    tags: object;
    path: Buffer;
    timestamp: Date;
};
type readMessageRequests = {
    data: Buffer;
    tag_ids: string[];
};
type writeTagMessageRequests = {
    data: Buffer;
    tag: Tag;
    tag_ids: string[];
};
declare class TagGroup {
    state: tagGroupState;
    /**
     * Tag Group Class used for reading and writing multiple tags at once
     */
    constructor();
    /**
     * Fetches the Number of Tags
     *
     * @readonly
     * @returns Number of tags
     */
    get length(): number;
    /**
     * Adds Tag to Group
     *
     * @param tag - Tag to Add to Group
     */
    add(tag: Tag): void;
    /**
     * Removes Tag from Group
     *
     * @param tag - Tag to be Removed from Group
     */
    remove(tag: Tag): void;
    /**
     * Iterable, Allows user to Iterate of each Tag in Group
     *
     * @param callback - Accepts Tag Class
     */
    forEach(callback: (tag: Tag) => {}): void;
    /**
     * Generates Array of Messages to Compile into a Multiple
     * Service Request
     *
     * @returns Array of Read Tag Message Services
     */
    generateReadMessageRequests(): readMessageRequests[];
    /**
     * Parse Incoming Multi Service Request Messages
     *
     * @param responses - response from controller
     * @param ids - Tag ids

     */
    parseReadMessageResponses(responses: any[], ids: string[]): void;
    /**
     * Generates Array of Messages to Compile into a Multiple
     * Service Request
     *
     * @returns Array of Write Tag Message Services
     */
    generateWriteMessageRequests(): writeTagMessageRequests[];
    /**
     * Parse Incoming Multi Service Request Messages
     *
     * @param ids
     */
    parseWriteMessageRequests(ids: string[]): void;
}
export default TagGroup;
