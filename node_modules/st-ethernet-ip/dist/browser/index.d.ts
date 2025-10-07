/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { Socket } from "dgram";
import { EventEmitter } from "events";
type browserDevice = {
    EncapsulationVersion: number;
    socketAddress: {
        sin_family: number;
        sin_port: number;
        sin_addr: string;
        sin_zero: Buffer;
    };
    vendorID: number;
    deviceType: number;
    productCode: number;
    revision: string;
    status: number;
    serialNumber: string;
    productName: string;
    state: number;
    timestamp: number;
};
export declare interface Browser extends EventEmitter {
    socket: Socket;
    originatorIPaddress: string;
    autoBrowse: boolean;
    updateRate: number;
    disconnectMultiplier: number;
    deviceList: browserDevice[];
    updateInterval: NodeJS.Timer;
    on(event: 'New Device', listener: (device: browserDevice) => {}): this;
    on(event: 'Broadcast Request', listener: () => {}): this;
    on(event: 'Device Disconnected', listener: (device: browserDevice) => {}): this;
    on(event: 'Device List Updated', listener: (deviceList: browserDevice[]) => {}): this;
    on(event: string, listener: Function): this;
}
export declare class Browser extends EventEmitter {
    constructor(originatorPort?: number, originatorIPaddress?: string, autoBrowse?: boolean, updateRate?: number, disconnectMultiplier?: number);
    start(): void;
    stop(): void;
    checkStatus(): void;
    _setupSocketEvents(): void;
    _parseListIdentityResponse(msg: any): browserDevice;
    _addDevice(device: any): void;
}
export default Browser;
