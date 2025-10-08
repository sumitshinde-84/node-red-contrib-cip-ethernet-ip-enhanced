//@ts-check
/*
  Copyright: (c) 2016-2020, St-One Ltda., Guilherme Francescon Cittolin <guilherme@st-one.io>
  GNU General Public License v3.0+ (see LICENSE or https://www.gnu.org/licenses/gpl-3.0.txt)
*/

const net = require('net');

function nrInputShim(node, fn) {
    function doErr(err) { err && node.error(err) }
    node.on('input', function (msg, send, done) {
        send = send || node.send;
        done = done || doErr;
        fn(msg, send, done);
    });
}

module.exports = function (RED) {
    "use strict";

    const eip = require('st-ethernet-ip');
    const {
        Controller,
        Tag,
        EthernetIP
    } = eip;
    const {
        EventEmitter
    } = require('events');

    // ---------- Constants ----------
    const DEFAULT_CYCLE_TIME = 500;
    const MIN_CYCLE_TIME = 2000; // Minimum for connected messaging to avoid queue overflow
    const CONNECTION_WAIT_TIME = 3000; // Wait time before starting polling
    const RECONNECT_DELAY = 5000;

    // ---------- Connected Messaging Patch ----------
    // NOTE: This modifies the Controller prototype to support Connected Messaging mode.
    // This is necessary because st-ethernet-ip doesn't provide hooks for custom connection paths.
    //
    // Connection Modes:
    // - 'standard': Traditional unconnected messaging with PORT segments
    // - 'connected': Connected messaging WITHOUT PORT segments (for direct-connect PLCs)
    // - 'connected-routing': Connected messaging WITH PORT segments (for chassis-based PLCs)

    const originalControllerConnect = Controller.prototype.connect;

    Controller.prototype.connect = async function(IP_ADDR, SLOT = 0) {
        const { PORT } = EthernetIP.CIP.EPATH.segments;
        const BACKPLANE = 1;

        // Get connection mode from controller instance
        const connectionMode = this._connectionMode || 'standard';

        // Determine if we need PORT segments
        const needsPortSegment = connectionMode !== 'connected';

        // Determine if we need Forward Open (connected messaging)
        const needsForwardOpen = connectionMode === 'connected' || connectionMode === 'connected-routing';

        // Configure connection path
        if (!needsPortSegment) {
            // Connected mode without routing: Skip PORT segment
            this.state.controller.slot = SLOT;
            this.state.controller.path = Buffer.alloc(0); // Empty path
        } else if (typeof SLOT === "number") {
            // Standard or connected with routing: Use PORT segment
            this.state.controller.slot = SLOT;
            this.state.controller.path = PORT.build(BACKPLANE, SLOT);
        } else if (Buffer.isBuffer(SLOT)) {
            this.state.controller.path = SLOT;
        } else {
            throw new Error("Invalid slot parameter type");
        }

        // Get parent ENIP class and connect
        const ENIPClass = Object.getPrototypeOf(Controller.prototype).constructor;
        const sessid = await ENIPClass.prototype.connect.call(this, IP_ADDR);

        if (!sessid) throw new Error("Failed to Register Session with Controller");

        this._initializeControllerEventHandlers();

        // Establish Forward Open for connected messaging modes
        if (needsForwardOpen && this.state.connectedMessaging === true) {
            const connid = await this.forwardOpen();
            if (!connid) throw new Error("Failed to Establish Forward Open Connection with Controller");
        }

        // Skip readControllerProps for connected mode without routing (not supported by some PLCs)
        if (connectionMode !== 'connected') {
            await this.readControllerProps();
        }
    };

    // ---------- Ethernet-IP Endpoint ----------

    function generateStatus(status, val) {
        let obj;

        if (typeof val != 'string' && typeof val != 'number' && typeof val != 'boolean') {
            val = RED._("ethip.endpoint.status.online");
        }

        switch (status) {
            case 'online':
                obj = {
                    fill: 'green',
                    shape: 'dot',
                    text: val.toString()
                };
                break;
            case 'badvalues':
                obj = {
                    fill: 'yellow',
                    shape: 'dot',
                    text: RED._("ethip.endpoint.status.badvalues")
                };
                break;
            case 'offline':
                obj = {
                    fill: 'red',
                    shape: 'dot',
                    text: RED._("ethip.endpoint.status.offline")
                };
                break;
            case 'error':
                obj = {
                    fill: 'red',
                    shape: 'dot',
                    text: RED._("ethip.endpoint.status.error")
                };
                break;
            case 'connecting':
                obj = {
                    fill: 'yellow',
                    shape: 'dot',
                    text: RED._("ethip.endpoint.status.connecting")
                };
                break;
            default:
                obj = {
                    fill: 'grey',
                    shape: 'dot',
                    text: RED._("ethip.endpoint.status.unknown")
                };
        }
        return obj;
    }

    function EthIpEndpoint(config) {
        EventEmitter.call(this);
        const node = this;
        let status;
        const isVerbose = RED.settings.get('verbose');
        let connectTimeoutTimer;
        let connected = false;
        let closing = false;
        const tags = new Map();

        RED.nodes.createNode(this, config);

        //avoids warnings when we have a lot of listener nodes
        this.setMaxListeners(0);

        //Create tags
        config.vartable = config.vartable || {};
        for (let prog of Object.keys(config.vartable)) {

            for (let varname of Object.keys(config.vartable[prog])) {
                if(!varname){
                    //skip empty values
                    continue;
                }

                let obj = config.vartable[prog][varname];
                let type = (obj.type || '').toString().toUpperCase();
                let dt = eip.EthernetIP.CIP.DataTypes.Types[type] || null;

                if (isVerbose) {
                    node.log(RED._("ethip.info.tagregister") + `: Name:[${varname}], Prog:[${prog}], Type:[${dt}](${type})`);
                }

                if (!Tag.isValidTagname(varname)){
                    node.warn(RED._("ethip.warn.invalidtagname", {name: varname}));
                    continue;
                }
                
                let tag = new Tag(varname, prog || null, dt);
                
                tag.on('Initialized', onTagChanged);
                tag.on('Changed', onTagChanged);
                
                tags.set(`${prog}:${varname}`, tag);
            }
        }

        node.getStatus = function getStatus() {
            return status;
        };

        node.getTag = function getTag(t) {
            return tags.get(t);
        };

        node.getTags = function getTags(t) {
            return tags;
        };

        node.getAllTagValues = function getAllTagValues() {
            let res = {};

            node._plc.forEach(tag => {
                res[tag.name] = tag.controller_value;
            });

            return res;
        };

        function manageStatus(newStatus) {
            if (status == newStatus) return;

            status = newStatus;
            node.emit('__STATUS__', {
                status: status
            });
        }

        function onTagChanged(tag, lastValue) {
            node.emit('__ALL_CHANGED__', tag, lastValue);
        }

        function onConnect() {
            clearTimeout(connectTimeoutTimer);
            manageStatus('online');

            connected = true;

            // In connected messaging mode, skip auto-scanning (not supported properly by some PLCs)
            // Tags will be read on-demand instead
            const isConnected = node._plc._isConnected === true;
            if (!isConnected) {
                for (let t of tags.values()) {
                    node._plc.subscribe(t);
                }

                node._plc.scan_rate = parseInt(config.cycletime) || DEFAULT_CYCLE_TIME;
                node._plc.scan().catch(onScanError);
            } else if (isVerbose) {
                node.log('Connected messaging mode: Auto-scanning disabled, using on-demand reads');
            }
        }

        function onConnectError(err) {
            let errStr = err instanceof Error ? err.toString() : JSON.stringify(err);
            node.error(RED._("ethip.error.onconnect") + errStr, {});
            onControllerEnd();
        }

        function onControllerError(err) {
            let errStr = err instanceof Error ? err.toString() : JSON.stringify(err);
            node.error(RED._("ethip.error.onerror") + errStr, {});
            onControllerEnd();
        }

        function onScanError(err) {
            if (closing) {
                //closing the connection will cause a timeout error, so let's just skip it
                return;
            }

            //proceed to cleanup and reconnect
            onControllerError(err);
        }

        function onControllerEnd() {
            clearTimeout(connectTimeoutTimer);
            manageStatus('offline');

            connected = false;

            // don't restart if we're closing...
            if(closing) {
                destroyPLC();
                return;
            } else {
                //reset tag values, in case we're dropping the connection because of a wrong value
                node._plc.forEach((tag) => {
                    tag.value = null;
                });
            }

            //try to reconnect if failed to connect
            connectTimeoutTimer = setTimeout(connect, RECONNECT_DELAY);
        }

        function onControllerClose(err) {
            try {
                node._plc._handleCloseEvent(err);
            } catch (e) {
                node.error(`${RED._("ethip.error.onerror")} ${e.message}`, {});
            }
        }

        function destroyPLC() {
            if (node._plc) {
                node._plc.destroy();

                // Remove event listeners to prevent memory leaks
                node._plc.removeListener("close", onControllerClose);
                node._plc.removeListener("error", onControllerError);
                node._plc.removeListener("end", onControllerEnd);
                net.Socket.prototype.destroy.call(node._plc);
                node._plc = null;
            }
        }

        function closeConnection(done) {
            //ensure we won't try to connect again if anybody wants to close it
            clearTimeout(connectTimeoutTimer);

            if (isVerbose) {
                node.log(RED._("ethip.info.disconnect"));
            }

            manageStatus('offline');
            connected = false;

            destroyPLC();

            if (typeof done == 'function') {
                done();
            }
        }

        // close the connection and remove tag listeners
        function onNodeClose(done) {
            closing = true;
            closeConnection(() => {
                for (let tag of tags.values()) {
                    tag.removeListener('Initialized', onTagChanged);
                    tag.removeListener('Changed', onTagChanged);
                }
                done();
            });
        }

        function connect() {
            //ensure we won't try to connect again if anybody wants to close it
            clearTimeout(connectTimeoutTimer);

            // don't restart if we're closing...
            if(closing) return;

            if (node._plc) {
                closeConnection();
            }

            manageStatus('connecting');

            if (isVerbose) {
                node.log(RED._("ethip.info.connect") + `: ${config.address} / ${config.slot}`);
            }

            connected = false;

            // Get connection mode from config (default to 'standard')
            // Handle backward compatibility: migrate old properties to new 'connectionMode'
            let connectionMode = config.connectionMode;
            if (!connectionMode) {
                // Migrate old configs to new connectionMode
                if (config.connected === true || config.micro800 === true || config.connectedMessaging === true) {
                    connectionMode = 'connected'; // Old connected mode becomes 'connected' (no routing)
                } else {
                    connectionMode = 'standard';
                }
            }

            // Determine if connected messaging should be used
            const useConnectedMessaging = connectionMode === 'connected' || connectionMode === 'connected-routing';
            const connectedMessaging = useConnectedMessaging;

            node._plc = new Controller(connectedMessaging);

            // Set connection mode on controller instance
            node._plc._connectionMode = connectionMode;
            node._plc._isConnected = useConnectedMessaging; // Store for use in nodes

            if (useConnectedMessaging && isVerbose) {
                node.log(`Connected messaging mode enabled: ${connectionMode}`);
            }

            node._plc.removeListener("close", node._plc._handleCloseEvent);
            node._plc.on("close", onControllerClose);
            node._plc.on("error", onControllerError);
            node._plc.on("end", onControllerEnd);
            node._plc.connect(config.address, Number(config.slot) || 0).then(onConnect).catch(onConnectError);
        }

        node.on('close', onNodeClose);
        connect();

    }
    RED.nodes.registerType("eth-ip endpoint", EthIpEndpoint);

    // ---------- Ethernet-IP In ----------

    function EthIpIn(config) {
        const node = this;
        let statusVal, tag;
        let connectedInterval;
        let isReading = false; // Prevent overlapping reads
        const isVerbose = RED.settings.get('verbose');
        RED.nodes.createNode(this, config);

        node.endpoint = RED.nodes.getNode(config.endpoint);
        if (!node.endpoint) {
            return node.error(RED._("ethip.error.missingconfig"));
        }

        function onChanged(tag, lastValue) {
            let data = tag.controller_value;
            let key = tag.name || '';
            let msg = {
                payload: data,
                topic: key,
                lastValue: lastValue
            };

            node.send(msg);
            node.status(generateStatus(node.endpoint.getStatus(), config.mode === 'single' ? data : null));
        }

        function onChangedAllValues() {
            let msg = {
                payload: node.endpoint.getAllTagValues()
            };

            node.send(msg);
            node.status(generateStatus(node.endpoint.getStatus()));
        }

        function onEndpointStatus(s) {
            node.status(generateStatus(s.status, config.mode === 'single' ? statusVal : null));
        }

        // Connected messaging manual read function with overlap protection (single mode)
        async function connectedReadSingle() {
            // Prevent overlapping reads
            if (isReading) {
                if (isVerbose) node.warn('Skipping read - previous read still in progress');
                return;
            }

            // Check if connected before attempting read
            if (!node.endpoint._plc || !tag || node.endpoint.getStatus() !== 'online') {
                isReading = false;
                return;
            }

            isReading = true;
            try {
                await node.endpoint._plc.readTag(tag);
                let msg = {
                    payload: tag.value,
                    topic: tag.name
                };
                statusVal = tag.value;
                node.send(msg);
                node.status(generateStatus(node.endpoint.getStatus(), tag.value));
            } catch (err) {
                // Only log error if it's not a timeout (to avoid log spam)
                if (!err.message || !err.message.includes('TIMEOUT')) {
                    node.error('Error reading tag: ' + (err.message || String(err)));
                }
            } finally {
                isReading = false;
            }
        }

        // Connected messaging manual read function for all tags (all-split and all modes)
        async function connectedReadAll() {
            // Prevent overlapping reads
            if (isReading) {
                if (isVerbose) node.warn('Skipping read - previous read still in progress');
                return;
            }

            // Check if connected before attempting read
            if (!node.endpoint._plc || node.endpoint.getStatus() !== 'online') {
                isReading = false;
                return;
            }

            isReading = true;
            try {
                const tags = node.endpoint.getTags();

                // Read all tags sequentially
                for (let [tagKey, tagObj] of tags) {
                    try {
                        await node.endpoint._plc.readTag(tagObj);

                        if (config.mode === 'all-split') {
                            // Send separate message for each tag
                            let msg = {
                                payload: tagObj.value,
                                topic: tagObj.name
                            };
                            node.send(msg);
                        }
                    } catch (err) {
                        // Continue reading other tags even if one fails
                        if (!err.message || !err.message.includes('TIMEOUT')) {
                            node.error('Error reading tag ' + tagObj.name + ': ' + (err.message || String(err)));
                        }
                    }
                }

                // For "all" mode, send one message with all values
                if (config.mode === 'all') {
                    let allValues = {};
                    for (let [tagKey, tagObj] of tags) {
                        allValues[tagObj.name] = tagObj.value;
                    }
                    let msg = {
                        payload: allValues
                    };
                    node.send(msg);
                }

                node.status(generateStatus(node.endpoint.getStatus()));
            } catch (err) {
                if (!err.message || !err.message.includes('TIMEOUT')) {
                    node.error('Error reading tags: ' + (err.message || String(err)));
                }
            } finally {
                isReading = false;
            }
        }

        const isConnected = node.endpoint._plc?._isConnected === true;

        if (config.mode === 'single') {
            let tagName = `${config.program}:${config.variable}`;
            tag = node.endpoint.getTag(tagName);

            if (!tag) {
                //shouldn't reach here. But just in case..
                return node.error(RED._("ethip.error.invalidvar", {
                    varname: tagName
                }));
            }

            // In connected messaging mode, use polling instead of events
            if (isConnected) {
                // Wait for connection to be established before starting polling
                setTimeout(() => {
                    // Use longer cycle time (minimum to avoid queue overflow)
                    let cycletime = Math.max(parseInt(node.endpoint.state?.cycletime) || MIN_CYCLE_TIME, MIN_CYCLE_TIME);
                    connectedInterval = setInterval(connectedReadSingle, cycletime);
                }, CONNECTION_WAIT_TIME);
            } else {
                tag.on('Initialized', onChanged);
                tag.on('Changed', onChanged);
            }
        } else if (config.mode === 'all-split') {
            if (isConnected) {
                // Polling for all-split mode
                setTimeout(() => {
                    let cycletime = Math.max(parseInt(node.endpoint.state?.cycletime) || MIN_CYCLE_TIME, MIN_CYCLE_TIME);
                    connectedInterval = setInterval(connectedReadAll, cycletime);
                }, CONNECTION_WAIT_TIME);
            } else {
                node.endpoint.on('__ALL_CHANGED__', onChanged);
            }
        } else {
            // "all" mode
            if (isConnected) {
                // Polling for all mode
                setTimeout(() => {
                    let cycletime = Math.max(parseInt(node.endpoint.state?.cycletime) || MIN_CYCLE_TIME, MIN_CYCLE_TIME);
                    connectedInterval = setInterval(connectedReadAll, cycletime);
                }, CONNECTION_WAIT_TIME);
            } else {
                node.endpoint.on('__ALL_CHANGED__', onChangedAllValues);
            }
        }

        node.status(generateStatus("connecting", ""));

        node.endpoint.on('__STATUS__', onEndpointStatus);

        node.on('close', function (done) {
            if (connectedInterval) {
                clearInterval(connectedInterval);
            }
            node.endpoint.removeListener('__ALL_CHANGED__', onChanged);
            node.endpoint.removeListener('__ALL_CHANGED__', onChangedAllValues);
            node.endpoint.removeListener('__STATUS__', onEndpointStatus);
            if (tag) {
                tag.removeListener('Initialized', onChanged);
                tag.removeListener('Changed', onChanged);
            }
            done();
        });
    }
    RED.nodes.registerType("eth-ip in", EthIpIn);

    // ---------- Ethernet-IP Out ----------

    function EthIpOut(config) {
        const node = this;
        let statusVal = null;
        let tag = null;
        let isWriting = false;
        const writeQueue = []; // Queue for pending writes
        let processingQueue = false;
        RED.nodes.createNode(this, config);

        node.endpoint = RED.nodes.getNode(config.endpoint);
        if (!node.endpoint) {
            return node.error(RED._("ethip.out.error.missingconfig"));
        }

        function onEndpointStatus(s) {
            node.status(generateStatus(s.status, statusVal));
        }

        // Process write queue sequentially
        async function processWriteQueue() {
            if (processingQueue || writeQueue.length === 0) return;

            processingQueue = true;

            while (writeQueue.length > 0) {
                const {value, done} = writeQueue.shift();

                if (!node.endpoint._plc || !tag || node.endpoint.getStatus() !== 'online') {
                    done(new Error('PLC not connected'));
                    continue;
                }

                try {
                    tag.value = value;
                    await node.endpoint._plc.writeTag(tag);
                    done();
                    statusVal = value;
                    node.status(generateStatus(node.endpoint.getStatus(), statusVal));
                } catch (err) {
                    done(err);
                    // Only log non-timeout errors
                    if (!err.message || !err.message.includes('TIMEOUT')) {
                        node.error('Error writing tag: ' + (err.message || String(err)));
                    }
                }
            }

            processingQueue = false;
        }

        async function onNewMsg(msg, send, done) {
            const value = msg.payload;
            const isConnected = node.endpoint._plc?._isConnected === true;

            if (isConnected) {
                // Connected messaging: Queue writes to prevent overlap
                writeQueue.push({value, done});

                // Limit queue size to prevent memory issues
                if (writeQueue.length > 100) {
                    const dropped = writeQueue.shift();
                    dropped.done(new Error('Write queue full - message dropped'));
                    node.warn('Write queue full, dropping oldest message');
                }

                processWriteQueue().catch(err => {
                    node.error('Error processing write queue: ' + err.message);
                });
            } else {
                // Standard mode: write will be performed by scan cycle
                statusVal = value;
                tag.value = value;
                done();
                node.status(generateStatus(node.endpoint.getStatus(), statusVal));
            }
        }

        let tagName = `${config.program}:${config.variable}`;
        tag = node.endpoint.getTag(tagName);

        if (!tag) {
            //shouldn't reach here. But just in case..
            return node.error(RED._("ethip.error.invalidvar", {
                varname: tagName
            }));
        }

        node.status(generateStatus("connecting", ""));

        nrInputShim(node, onNewMsg);
        node.endpoint.on('__STATUS__', onEndpointStatus);

        node.on('close', function (done) {
            node.endpoint.removeListener('__STATUS__', onEndpointStatus);

            // Clear any pending writes in queue
            while (writeQueue.length > 0) {
                const pending = writeQueue.shift();
                pending.done(new Error('Node closing'));
            }

            done();
        });

    }
    RED.nodes.registerType("eth-ip out", EthIpOut);
};
