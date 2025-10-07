/// <reference types="node" />
/// <reference types="node" />
import Controller from "../controller";
import { EventEmitter } from "events";
import Tag from "../tag";
type cmAllValues = {
    [index: string]: any;
};
type cmAllControllersValues = {
    [index: string]: cmAllValues;
};
declare class ControllerManager {
    controllers: extController[];
    /**
     * Controller Manager manages PLC connections and tags.  Automatically scans and writes tags that have values changed. Reconnects automatically.
     */
    constructor();
    /**
     * Adds controller to be managed by controller manager
     *
     * @param ipAddress - controller IP address
     * @param slot - Slot number or custom path
     * @param rpi - How often to scan tag value in ms
     * @param connected - Use connected messaging
     * @param retrySP - How long to wait to retry broken connection in ms
     * @param opts - custom options for future use
     * @returns Extended Controller object
     */
    addController(ipAddress: string, slot?: number | Buffer, rpi?: number, connected?: boolean, retrySP?: number, opts?: any): extController;
    /**
     * Returns all current controller tags
     *
     * @returns tag values indexed by controller ip address and tag name
     */
    getAllValues(): cmAllControllersValues;
}
export declare interface extController {
    reconnect: boolean;
    ipAddress: string;
    slot: number | Buffer;
    opts: any;
    rpi: any;
    PLC: Controller;
    tags: any[];
    connected: boolean;
    conncom: any;
    retryTimeSP: number;
    on(event: string, listener: Function): this;
    on(event: 'Connected', listener: (this: this) => {}): this;
    on(event: 'TagChanged', listener: (tag: Tag, previousValue: any) => {}): this;
    on(event: 'TagInit', listener: (tag: Tag) => {}): this;
    on(event: 'TagUnknown', listener: (tag: Tag) => {}): this;
    on(event: 'Disconnected', listener: () => {}): this;
}
export declare class extController extends EventEmitter {
    /**
     * Extended Controller Class To Manage Rebuilding Tags after as disconnect / reconnect event
     *
     * @param ipAddress - controller IP address
     * @param slot - Slot number or custom path
     * @param rpi - How often to scan tag value in ms
     * @param connected - Use connected messaging
     * @param retrySP - How long to wait to retry broken connection in ms
     * @param opts - custom options for future use
     */
    constructor(ipAddress: string, slot?: number | Buffer, rpi?: number, connCom?: boolean, retrySP?: number, opts?: any);
    /**
     * Connect To Controller
     */
    connect(reconnect?: boolean): void;
    /**
     * Add Tag Events to emit from controller
     *
     * @param tag
     */
    addTagEvents(tag: Tag): void;
    /**
     * Handle Controller Error during connect or while scanning
     *
     * @param e - Error emitted
     */
    errorHandle(e: any): void;
    /**
     * Add tag to controller scan list.
     *
     * @param tagname - Tag Name
     * @param program - Program Name
     * @param arrayDims - Array Dimensions
     * @param arraySize - Array Size
     * @returns Tag object
     */
    addTag(tagname: string, program?: string, arrayDims?: number, arraySize?: number): Tag;
    /**
     * Remove tag from controller scan list.
     *
     * @param tagname - Tag Name
     * @param program - Program Name
     */
    removeTag(tagname: string, program?: string): void;
    /**
     * Disconnect Controller Completely
     *
     * @returns Promise resolved after disconnect of controller
     */
    disconnect(): Promise<void>;
}
export default ControllerManager;
export { Tag };
