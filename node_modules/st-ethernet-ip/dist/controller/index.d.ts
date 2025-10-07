/// <reference types="node" />
import { ENIP, enipConnection, enipError, enipTCP, enipSession } from "../enip";
import TagGroup from "../tag-group";
import TagList, { tagListTag, tagListTemplates } from "../tag-list";
import { Structure } from "../structure";
import Tag from "../tag";
import type { CommonPacketData } from '../enip/encapsulation';
type controllerState = {
    name: string;
    serial_number: number;
    slot: number;
    time: Date;
    path: Buffer;
    version: string;
    status: number;
    run: boolean;
    program: boolean;
    faulted: boolean;
    minorRecoverableFault: boolean;
    minorUnrecoverableFault: boolean;
    majorRecoverableFault: boolean;
    majorUnrecoverableFault: boolean;
    io_faulted: boolean;
};
declare class Controller extends ENIP {
    state: {
        TCP: enipTCP;
        session: enipSession;
        connection: enipConnection;
        error: enipError;
        controller: controllerState;
        subs: TagGroup;
        scanning: boolean;
        scan_rate: number;
        connectedMessaging: boolean;
        timeout_sp: number;
        rpi: number;
        fwd_open_serial: number;
        unconnectedSendTimeout: number;
        tagList: TagList;
    };
    workers: {
        read: any;
        write: any;
        group: any;
    };
    /**
     * PLC Controller class
     *
     * @param connectedMessaging whether to use connected or unconnected messaging
     * @param opts future options
     * @param opts.unconnectedSendTimeout unconnected send timeout option
     */
    constructor(connectedMessaging?: boolean, opts?: any);
    /**
     * Returns the Scan Rate of Subscription Tags
     *
     * @returns scan rate in ms
     */
    get scan_rate(): number;
    /**
     * Sets the Subsciption Group Scan Rate
     *
     */
    set scan_rate(rate: number);
    /**
     * Returns the Timeout Setpoint
     *
     * @returns Timeout setpoint in ms
     */
    get timeout_sp(): number;
    /**
     * Sets the Timeout Setpoint
     *
     */
    set timeout_sp(sp: number);
    /**
     * Returns the Rpi
     *
     * @returns rpi setpoint in ms
     */
    get rpi(): number;
    /**
     * Sets the Rpi
     *
     */
    set rpi(sp: number);
    /**
     * Get the status of Scan Group
     *
     * @returns true or false
     */
    get scanning(): boolean;
    /**
     * Returns the connected / unconnected messaging mode
     *
     * @returns true, if connected messaging; false, if unconnected messaging
     */
    get connectedMessaging(): boolean;
    /**
     * Sets the Mode to connected / unconnected messaging
     *
     */
    set connectedMessaging(conn: boolean);
    /**
     * Gets the Controller Properties Object
     *
     * @readonly
     * @memberof Controller
     * @returns Controller properties object
     */
    get properties(): controllerState;
    /**
     * Fetches the last timestamp retrieved from the controller
     * in human readable form
     *
     * @readonly
     */
    get time(): string;
    /**
     * Initializes Session with Desired IP Address
     * and Returns a Promise with the Established Session ID
     *
     * @param IP_ADDR - IPv4 Address (can also accept a FQDN, provided port forwarding is configured correctly.)
     * @param SLOT - Controller Slot Number (0 if CompactLogix), or a Buffer representing the whole routing path
     * @returns Promise that resolves after connection
     */
    connect(IP_ADDR: string, SLOT?: number | Buffer, SETUP?: boolean): Promise<void>;
    /**
     * Run a GET_ATTRIBUTE_SINGLE on any class, instance, attribute.
     * For attribute of a class set instance to 0x00.
     *
     * @param classID
     * @param instance
     * @param attribute
     * @param attData buffer with additional data to append to request (optional)
     * @returns attribute buffer
     */
    getAttributeSingle(classID: number, instance: number, attribute: number, attData?: Buffer): Promise<Buffer>;
    /**
     * Run a SET_ATTRIBUTE_SINGLE on any class, instance, attribute. You have to know the size of the buffer
     * of the data you are setting attribute to.  For attribute of a class set instance to 0x00.
     *
     * @param classID - CIP Class ID
     * @param instance - CIP Instance ID
     * @param attribute - Attribute Number
     * @param newValue - New value to set to as a Buffer
     * @returns
     */
    setAttributeSingle(classID: number, instance: number, attribute: number, newValue: Buffer): Promise<void>;
    /**
     * Gets file data block used for retrieving eds file from some devices
     *
     * @param classID - CIP Class ID
     * @param instance - CIP Instance ID
     * @param blockNum - Block Number
     * @returns File data
     */
    getFileData(classID: number, instance: number, blockNum: number): Promise<Buffer>;
    /**
     * Disconnects the PLC instance gracefully by issuing forwardClose, UnregisterSession
     * and then destroying the socket
     * and Returns a Promise indicating a success or failure or the disconnection
     *
     * @memberof Controller
     * @returns Promise that is resolved after disconnection
     */
    disconnect(): Promise<string>;
    /**
     * Writes a forwardOpen Request and retrieves the connection ID used for
     * connected messages.
     * @returns Promise resolving to OT connection ID
     */
    forwardOpen(): Promise<number>;
    /**
     * Writes a forwardClose Request and retrieves the connection ID used for
     * connected messages.
     *
     * @returns Promise resolving OT connection ID
     */
    forwardClose(): Promise<number>;
    /**
     * Writes Ethernet/IP Data to Socket as an Unconnected Message
     * or a Transport Class 1 Datagram
     *
     * @param data - Message Router Packet Buffer
     * @param connected - Use Connected Messaging
     * @param timeout - Timeout (sec)
     * @param cb - Callback to be Passed to Parent.Write()
     */
    write_cip(data: Buffer, connected?: boolean, timeout?: number, cb?: any): void;
    /**
     * Reads Controller Identity Object
     *
     * @returns Promise resolved when completed reading and storing controller properties
     */
    readControllerProps(): Promise<void>;
    /**
     * Reads the Controller Wall Clock Object (L8 Named Controllers Only)
     *
     * @returns Promise resolved when completed reading wall clock
     */
    readWallClock(): Promise<void>;
    /**
     * Write to PLC Wall Clock
     *
     * @param date - Date Object
     * @returns Promise resolved after writing new Date to controller
     */
    writeWallClock(date?: Date): Promise<void>;
    /**
     * Reads Value of Tag and Type from Controller
     *
     * @param tag - Tag Object to Write
     * @param size - Size used for writing array
     * @returns Promise resolved after read completed
     */
    readTag(tag: Tag | Structure, size?: any): Promise<void>;
    /**
     * Writes value to Tag
     *
     * @param tag - Tag Object to Write
     * @param value - If Omitted, Tag.value will be used
     * @param size - Used for writing arrays
     * @returns Promise resolved after complete writing
     */
    writeTag(tag: Tag | Structure, value?: any, size?: number): any;
    /**
     * Reads All Tags in the Passed Tag Group
     *
     * @param group - Tag Group instance
     * @returns Promise resolved on completion of reading group
     */
    readTagGroup(group: TagGroup): Promise<void>;
    /**
     * Writes to Tag Group Tags
     *
     * @param group - Tag Group instance
     * @returns Promise resolved after reading tag group
     */
    writeTagGroup(group: TagGroup): Promise<void>;
    /**
     * Adds Tag to Subscription Group
     *
     * @param tag - Tag instance
     */
    subscribe(tag: Tag | Structure): void;
    /**
     * Begin Scanning Subscription Group
     *
     * @returns Promise resolved after scanning state goes to false
     */
    scan(): Promise<void>;
    /**
     * Pauses Scanning of Subscription Group
     *
     */
    pauseScan(): void;
    /**
     * Iterates of each tag in Subscription Group
     *
     * @param callback - Call back function with a Tag instance as a parameter
     */
    forEach(callback: (tag: Tag | Structure) => {}): void;
    /**
     *
     * @param tagList - Tag list instance to store tagnames from PLC
     * @param program - Program name
     * @returns Promise resolved when completed
     */
    getControllerTagList(tagList: TagList, program?: string): Promise<void>;
    /**
     * Initialized Controller Specific Event Handlers
     *
     */
    _initializeControllerEventHandlers(): void;
    /**
     * Remove Controller Specific Event Handlers
     *
     */
    _removeControllerEventHandlers(): void;
    /**
     * Reads Value of Tag and Type from Controller
     *
     * @param tag - Tag Object to Write
     * @param size - Number of tags to read used for arrays
     * @returns Promise resolved when complete
     */
    _readTag(tag: Tag | Structure, size?: number): Promise<void>;
    /**
     * Reads Data of Tag from Controller To Big To Fit In One Packet
     *
     * @param tag - Tag Object to Write
     * @param size - Number of tags to read used for arrays
     * @returns Promise resolved when complete
     */
    _readTagFragmented(tag: Tag | Structure, size?: number): Promise<void>;
    /**
     * Writes value to Tag
     *
     * @param tag - Tag Object to Write
     * @param value - If Omitted, Tag.value will be used
     * @param size - Number of tags to read used for arrays
     * @returns Promise resolved when complete
     */
    _writeTag(tag: Tag | Structure, value?: any, size?: number): Promise<void>;
    /**
     * Writes value to Tag To Big To Fit In One Packet
     *
     * @param tag - Tag Object to Write. Used only for Structures.
     * @param value - If Omitted, Tag.value will be used
     * @param size - Number of tags to read used for arrays
     * @returns Promise resolved when complete
     */
    _writeTagFragmented(tag: Structure | Tag, value?: any, size?: number): Promise<void>;
    /**
     * Reads All Tags in the Passed Tag Group
     *
     * @param group - Tag group instance
     * @returns Promise resolved when complete
     */
    _readTagGroup(group: TagGroup): Promise<void>;
    /**
     * Writes to Tag Group Tags
     *
     * @param group - Tag Group instance
     * @returns Promise resolved when complete
     */
    _writeTagGroup(group: TagGroup): Promise<void>;
    /**
     * @typedef EncapsulationData
     * @type {Object}
     * @property {number} commandCode - Ecapsulation Command Code
     * @property {string} command - Encapsulation Command String Interpretation
     * @property {number} length - Length of Encapsulated Data
     * @property {number} session - Session ID
     * @property {number} statusCode - Status Code
     * @property {string} status - Status Code String Interpretation
     * @property {number} options - Options (Typically 0x00)
     * @property {Buffer} data - Encapsulated Data Buffer
     */
    /*****************************************************************/
    /**
     * @typedef MessageRouter
     * @type {Object}
     * @property {number} service - Reply Service Code
     * @property {number} generalStatusCode - General Status Code (Vol 1 - Appendix B)
     * @property {number} extendedStatusLength - Length of Extended Status (In 16-bit Words)
     * @property {Array} extendedStatus - Extended Status
     * @property {Buffer} data - Status Code
     */
    /*****************************************************************/
    /**
     * Handles SendRRData Event Emmitted by Parent and Routes
     * incoming Message
     *
     * @param srrd - Array of Common Packet Formatted Objects
     */
    _handleSendRRDataReceived(srrd: CommonPacketData[]): void;
    /**
     * Handles SendUnitData Event Emmitted by Parent and Routes
     * incoming Message
     *
     * @param sud - Array of Common Packet Formatted Objects
     */
    _handleSendUnitDataReceived(sud: CommonPacketData[]): void;
    /**
     * Get tag list tags that are not reserved tags
     *
     * @returns Array of tag list items
     */
    get tagList(): tagListTag[];
    /**
     * Get tag list templates
     *
     * @returns List of templates indexed by tag name hash
     */
    get templateList(): tagListTemplates;
    /**
     * Gets an arrays size (Not optimized)
     *
     * @param tag - Tag instance
     * @returns
     */
    getTagArraySize(tag: Tag | Structure): Promise<number>;
    /**
     * Helper function to add new tag to PLC tag group
     *
     * @param tagname - Tag or Structure name
     * @param program - PLC program name. null = Controller scope
     * @param subscribe - enable read and write when scanning
     * @param arrayDims - array dimension number
     * @param arraySize - array size
     * @returns tag or structure instance
     */
    newTag(tagname: string, program?: string, subscribe?: boolean, arrayDims?: number, arraySize?: number): Tag | Structure;
    /**
     * Get tag or structure instance by name
     *
     * @param name
     * @returns
     */
    getTagByName(name: string): Tag | Structure;
}
export default Controller;
