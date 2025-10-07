/// <reference types="node" />
export = Controller;
declare class Controller {
    constructor(port: number, localAddress: any);
    socket: dgram.Socket;
    localAddress: any;
    connections: any[];
    addConnection(config: any, rpi: any, address: any, port?: number): any;
    _setupMessageEvent(): void;
    _messageRouter(data: any): void;
}
import dgram = require("dgram");
