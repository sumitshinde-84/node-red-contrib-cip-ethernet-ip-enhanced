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

    // ---------- Micro 800 Patch ----------
    // Patch Controller.connect to support Micro 800/850/870 PLCs
    // These PLCs don't use PORT segments in Forward Open connections

    const originalControllerConnect = Controller.prototype.connect;

    Controller.prototype.connect = async function(IP_ADDR, SLOT = 0) {
        const { PORT } = EthernetIP.CIP.EPATH.segments;
        const BACKPLANE = 1;

        // Check if Micro 800 mode is enabled (stored in controller instance)
        const isMicro800 = this._micro800Mode === true;

        if (isMicro800) {
            // Micro 800: Skip PORT segment in connection path
            this.state.controller.slot = SLOT;
            this.state.controller.path = Buffer.alloc(0); // Empty path
        } else if (typeof SLOT === "number") {
            // Standard ControlLogix/CompactLogix path
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

        // For st-ethernet-ip with connected messaging, establish Forward Open for Micro 800
        if (isMicro800 && this.state.connectedMessaging === true) {
            const connid = await this.forwardOpen();
            if (!connid) throw new Error("Failed to Establish Forward Open Connection with Controller");
        }

        // Skip readControllerProps and getControllerTagList for Micro 800 (not needed/supported)
        if (!isMicro800) {
            await this.readControllerProps();
        }
    };

    // ---------- Ethernet-IP Endpoint ----------

    function generateStatus(status, val) {
        var obj;

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
        var node = this;
        var status;
        var isVerbose = RED.settings.get('verbose');
        var connectTimeoutTimer;
        var connected = false;
        var closing = false;
        var tags = new Map();

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

            // For Micro 800, skip auto-scanning (not supported properly)
            // Tags will be read on-demand instead
            const isMicro800 = node._plc._isMicro800 === true;
            if (!isMicro800) {
                for (let t of tags.values()) {
                    node._plc.subscribe(t);
                }

                node._plc.scan_rate = parseInt(config.cycletime) || 500;
                node._plc.scan().catch(onScanError);
            } else if (isVerbose) {
                node.log('Micro 800 mode: Auto-scanning disabled, using on-demand reads');
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
            connectTimeoutTimer = setTimeout(connect, 5000);
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
                
                //TODO remove listeners
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

            // Micro 800 requires connected messaging (Forward Open), ControlLogix uses unconnected
            const isMicro800 = config.micro800 === true;
            const connectedMessaging = isMicro800;

            node._plc = new Controller(connectedMessaging);

            // Set Micro 800 mode flag on controller instance
            node._plc._micro800Mode = isMicro800;
            node._plc._isMicro800 = isMicro800; // Store for use in nodes

            if (isMicro800 && isVerbose) {
                node.log('Micro 800/850 mode enabled with connected messaging');
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
        let micro800Interval;
        let isReading = false; // Prevent overlapping reads
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

        // Micro 800 manual read function with overlap protection (single mode)
        async function micro800ReadSingle() {
            // Prevent overlapping reads
            if (isReading) return;

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
                if (!err.message.includes('TIMEOUT')) {
                    node.error('Error reading tag: ' + err.message);
                }
            } finally {
                isReading = false;
            }
        }

        // Micro 800 manual read function for all tags (all-split and all modes)
        async function micro800ReadAll() {
            // Prevent overlapping reads
            if (isReading) return;

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
                        if (!err.message.includes('TIMEOUT')) {
                            node.error('Error reading tag ' + tagObj.name + ': ' + err.message);
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
                if (!err.message.includes('TIMEOUT')) {
                    node.error('Error reading tags: ' + err.message);
                }
            } finally {
                isReading = false;
            }
        }

        const isMicro800 = node.endpoint._plc?._isMicro800 === true;

        if (config.mode === 'single') {
            let tagName = `${config.program}:${config.variable}`;
            tag = node.endpoint.getTag(tagName);

            if (!tag) {
                //shouldn't reach here. But just in case..
                return node.error(RED._("ethip.error.invalidvar", {
                    varname: tagName
                }));
            }

            // For Micro 800, use polling instead of events
            if (isMicro800) {
                // Wait for connection to be established before starting polling
                setTimeout(() => {
                    // Use longer cycle time for Micro 800 (minimum 2 seconds to avoid queue overflow)
                    let cycletime = Math.max(parseInt(node.endpoint.state?.cycletime) || 2000, 2000);
                    micro800Interval = setInterval(micro800ReadSingle, cycletime);
                }, 3000); // Wait 3 seconds for connection
            } else {
                tag.on('Initialized', onChanged);
                tag.on('Changed', onChanged);
            }
        } else if (config.mode === 'all-split') {
            if (isMicro800) {
                // Polling for all-split mode
                setTimeout(() => {
                    let cycletime = Math.max(parseInt(node.endpoint.state?.cycletime) || 2000, 2000);
                    micro800Interval = setInterval(micro800ReadAll, cycletime);
                }, 3000);
            } else {
                node.endpoint.on('__ALL_CHANGED__', onChanged);
            }
        } else {
            // "all" mode
            if (isMicro800) {
                // Polling for all mode
                setTimeout(() => {
                    let cycletime = Math.max(parseInt(node.endpoint.state?.cycletime) || 2000, 2000);
                    micro800Interval = setInterval(micro800ReadAll, cycletime);
                }, 3000);
            } else {
                node.endpoint.on('__ALL_CHANGED__', onChangedAllValues);
            }
        }

        node.status(generateStatus("connecting", ""));

        node.endpoint.on('__STATUS__', onEndpointStatus);

        node.on('close', function (done) {
            if (micro800Interval) {
                clearInterval(micro800Interval);
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
        var node = this;
        var statusVal, tag;
        var isWriting = false; // Prevent overlapping writes
        RED.nodes.createNode(this, config);

        node.endpoint = RED.nodes.getNode(config.endpoint);
        if (!node.endpoint) {
            return node.error(RED._("ethip.in.error.missingconfig"));
        }

        function onEndpointStatus(s) {
            node.status(generateStatus(s.status, statusVal));
        }

        async function onNewMsg(msg, send, done) {
            statusVal = msg.payload;

            const isMicro800 = node.endpoint._plc?._isMicro800 === true;

            if (isMicro800) {
                // Micro 800: Immediate write with overlap protection
                if (isWriting) {
                    done(new Error('Previous write still in progress'));
                    return;
                }

                if (!node.endpoint._plc || !tag) {
                    done(new Error('PLC not connected'));
                    return;
                }

                isWriting = true;
                try {
                    tag.value = statusVal;
                    await node.endpoint._plc.writeTag(tag);
                    done();
                    node.status(generateStatus(node.endpoint.getStatus(), statusVal));
                } catch (err) {
                    done(err);
                    // Only log non-timeout errors
                    if (!err.message.includes('TIMEOUT')) {
                        node.error('Error writing tag: ' + err.message);
                    }
                } finally {
                    isWriting = false;
                }
            } else {
                // Standard mode: write will be performed by scan cycle
                tag.value = statusVal;
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
            done();
        });

    }
    RED.nodes.registerType("eth-ip out", EthIpOut);
};
