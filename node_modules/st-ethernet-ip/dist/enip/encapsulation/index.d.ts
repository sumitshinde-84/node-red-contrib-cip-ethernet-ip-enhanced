/// <reference types="node" />
declare const commands: {
    NOP: number;
    ListServices: number;
    ListIdentity: number;
    ListInterfaces: number;
    RegisterSession: number;
    UnregisterSession: number;
    SendRRData: number;
    SendUnitData: number;
    IndicateStatus: number;
    Cancel: number;
};
/**
 * Parses Encapulation Status Code to Human Readable Error Message.
 *
 * @param status - Status Code
 * @returns Human Readable Error Message
 */
declare const parseStatus: (status: number) => string;
/**
 * Checks if Command is a Valid Encapsulation Command
 *
 * @param cmd - Encapsulation command
 * @returns test result
 */
declare const validateCommand: (cmd: number) => boolean;
type CommonPacketData = {
    TypeID: number;
    data: Buffer;
    length: number;
};
declare let CPF: {
    ItemIDs: {
        Null: number;
        ListIdentity: number;
        ConnectionBased: number;
        ConnectedTransportPacket: number;
        UCMM: number;
        ListServices: number;
        SockaddrO2T: number;
        SockaddrT2O: number;
        SequencedAddrItem: number;
    };
    /**
     * Checks if Command is a Valid Encapsulation Command
     *
     * @param cmd - Encapsulation command
     * @returns test result
     */
    isCmd: (cmd: number) => boolean;
    /**
     * Builds a Common Packet Formatted Buffer to be
     * Encapsulated.
     *
     * @param dataItems - Array of CPF Data Items
     * @returns CPF Buffer to be Encapsulated
     */
    build: (dataItems: CommonPacketData[]) => Buffer;
    /**
    * Parses Incoming Common Packet Formatted Buffer
    * and returns an Array of Objects.
    *
    * @param {Buffer} buf - Common Packet Formatted Data Buffer
    * @returns {Array} Array of Common Packet Data Objects
    */
    parse: (buf: Buffer) => CommonPacketData[];
};
type EncapsulationData = {
    commandCode: number;
    command: string;
    length: number;
    session: number;
    statusCode: number;
    status: string;
    options: number;
    data: Buffer;
};
declare let header: {
    /**
     * Builds an ENIP Encapsolated Packet
     *
     * @param cmd - Command to Send
     * @param session - Session ID
     * @param data - Data to Send
     * @returns  Generated Buffer to be Sent to Target
     */
    build: (cmd: number, session?: number, data?: Buffer | []) => Buffer;
    /**
     * Parses an Encapsulated Packet Received from ENIP Target
     *
     * @param buf - Incoming Encapsulated Buffer from Target
     * @returns Parsed Encapsulation Data Object
     */
    parse: (buf: Buffer) => EncapsulationData;
};
/**
 * Returns a Register Session Request String
 *
 * @returns register session buffer
 */
declare const registerSession: () => Buffer;
/**
 * Returns an Unregister Session Request String
 *
 * @param session - Encapsulation Session ID
 * @returns unregister session buffer
 */
declare const unregisterSession: (session: number) => Buffer;
/**
 * Returns a UCMM Encapsulated Packet String
 *
 * @param session - Encapsulation Session ID
 * @param data - Data to be Sent via UCMM
 * @param timeout - Timeout (sec)
 * @returns UCMM Encapsulated Message Buffer
 */
declare const sendRRData: (session: number, data: Buffer, timeout?: number) => Buffer;
/**
 * Returns a Connected Message Datagram (Transport Class 3) String
 *
 * @param {number} session - Encapsulation Session ID
 * @param {Buffer} data - Data to be Sent via Connected Message
 * @param {number} ConnectionID - Connection ID from FWD_OPEN
 * @param {number} SequenceNumber - Sequence Number of Datagram
 * @returns Connected Message Datagram Buffer
 */
declare const sendUnitData: (session: number, data: Buffer, ConnectionID: number, SequnceNumber: number) => Buffer;
export { header, CPF, validateCommand, commands, parseStatus, registerSession, unregisterSession, sendRRData, sendUnitData, EncapsulationData, CommonPacketData };
