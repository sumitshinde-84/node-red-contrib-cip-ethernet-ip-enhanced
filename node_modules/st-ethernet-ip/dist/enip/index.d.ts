/// <reference types="node" />
/// <reference types="node" />
import { Socket } from 'net';
import * as encapsulation from './encapsulation';
import * as CIP from './cip';
/**
 * Low Level Ethernet/IP
 *
 * @class ENIP
 * @extends {Socket}
 * @fires ENIP#Session Registration Failed
 * @fires ENIP#Session Registered
 * @fires ENIP#Session Unregistered
 * @fires ENIP#SendRRData Received
 * @fires ENIP#SendUnitData Received
 * @fires ENIP#Unhandled Encapsulated Command Received
 */
type enipTCP = {
    establishing: boolean;
    established: boolean;
};
type enipSession = {
    id: number;
    establishing: boolean;
    established: boolean;
};
type enipConnection = {
    id: number;
    establishing: boolean;
    established: boolean;
    seq_num: number;
};
type enipError = {
    code: number;
    msg: string;
};
declare class ENIP extends Socket {
    state: {
        TCP: enipTCP;
        session: enipSession;
        connection: enipConnection;
        error: enipError;
    };
    constructor();
    /**
     * Returns an Object
     *  - <number> error code
     *  - <string> human readable error
     *
     * @readonly
     * @memberof ENIP
     */
    get error(): enipError;
    /**
     * Session Establishment In Progress
     *
     * @readonly
     * @memberof ENIP
     */
    get establishing(): boolean;
    /**
     * Session Established Successfully
     *
     * @readonly
     * @memberof ENIP
     */
    get established(): boolean;
    /**
     * Get ENIP Session ID
     *
     * @readonly
     * @memberof ENIP
     */
    get session_id(): number;
    /**
     * Various setters for Connection parameters
     *
     * @memberof ENIP
     */
    set establishing_conn(newEstablish: boolean);
    set established_conn(newEstablished: boolean);
    set id_conn(newID: number);
    set seq_conn(newSeq: number);
    /**
     * Various getters for Connection parameters
     *
     * @memberof ENIP
     */
    get establishing_conn(): boolean;
    get established_conn(): boolean;
    get id_conn(): number;
    get seq_conn(): number;
    connect(port: unknown, host?: unknown, connectionListener?: unknown): any;
    /**
     * Writes Ethernet/IP Data to Socket as an Unconnected Message
     * or a Transport Class 1 Datagram
     *
     * NOTE: Cant Override Socket Write due to net.Socket.write
     *        implementation. =[. Thus, I am spinning up a new Method to
     *        handle it. Dont Use Enip.write, use this function instead.
     *
     * @param data - Data Buffer to be Encapsulated
     * @param connected - Connected communication
     * @param timeout - Timeout (sec)
     * @param cb - Callback to be Passed to Parent.Write()
     */
    write_cip(data: Buffer, connected?: boolean, timeout?: number, cb?: () => void): void;
    /**
     * Sends Unregister Session Command and Destroys Underlying TCP Socket
     *
     * @override
     * @param {Exception} exception - Gets passed to 'error' event handler
     * @memberof ENIP
     */
    destroy(exception?: Error): this;
    _initializeEventHandlers(): void;
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
     * Socket.on('data) Event Handler
     *
     * @param data - Data Received from Socket.on('data', ...)
     */
    _handleDataEvent(data: Buffer): void;
    /**
     * Socket.on('close',...) Event Handler
     *
     * @memberof ENIP
     */
    _handleCloseEvent(): void;
}
export { ENIP, CIP, encapsulation, enipConnection, enipSession, enipError, enipTCP };
