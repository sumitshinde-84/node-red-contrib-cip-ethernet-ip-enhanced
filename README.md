# node-red-contrib-cip-ethernet-ip-enhanced

An enhanced Node-RED node for Allen Bradley / Rockwell PLCs with full Connected Messaging support.

> **Modified Version Notice**: This package is a modified version of [node-red-contrib-cip-ethernet-ip](https://github.com/st-one-io/node-red-contrib-cip-ethernet-ip) by ST-One Ltda. The enhancements include additional connection modes and improved Connected Messaging Protocol support. This modified version is distributed under the same GPL-3.0-or-later license as the original.

## Features

- **Multiple Connection Modes**: Standard unconnected, Connected Messaging without routing, and Connected Messaging with routing
- **Broad PLC Support**: Compatible with various Allen Bradley / Rockwell automation controllers
- **Variable Monitoring**: Real-time reading and writing of PLC tags
- **Flexible Output Modes**: Single variable, all variables, or one message per variable
- **Change Detection**: Optional "diff" mode to only send messages when values change

## Inspiration & Credits

This node is **inspired by** and **based on** the excellent work of:

- [**node-red-contrib-cip-ethernet-ip**](https://github.com/st-one-io/node-red-contrib-cip-ethernet-ip) - The original package

### What Makes This Enhanced?

This enhanced version adds **full Connected Messaging Protocol support** with three connection modes:

1. **Standard (Unconnected)** - Traditional unconnected messaging for all PLCs
2. **Connected Messaging (No Routing)** - For direct-connect PLCs that don't require backplane routing
3. **Connected Messaging (With Routing)** - For chassis-based PLCs using Forward Open with routing

## Installation

### Via Node-RED Palette Manager

1. Open Node-RED in your browser
2. Click the menu (☰) → Manage palette
3. Go to the "Install" tab
4. Search for `node-red-contrib-cip-ethernet-ip-enhanced`
5. Click "Install"

### Via npm

Run the following command in your Node-RED user directory (typically `~/.node-red` on Linux or `%HOMEPATH%\.nodered` on Windows):

```bash
npm install node-red-contrib-cip-ethernet-ip-enhanced
```

## Usage

### 1. Configure the Endpoint

Each PLC connection is represented by an **ETH-IP Endpoint** configuration node:

- **Address**: IP address of your PLC (e.g., `192.168.1.10`)
- **Slot**: Slot number (default: 0)
- **Connection Mode**: Choose the appropriate mode for your PLC:
  - **Standard (Unconnected)** - Default mode, works with all PLCs
  - **Connected Messaging (No Routing)** - For PLCs that connect directly without backplane routing
  - **Connected Messaging (With Routing)** - For chassis-based PLCs that need routing but benefit from connected sessions
- **Cycle Time**: How often to read variables (in milliseconds, e.g., 500)
- **Variables**: Define your tags with their names and addresses

#### Choosing the Right Connection Mode

| PLC Configuration | Recommended Mode | Why |
|----------|-----------------|-----|
| Direct Ethernet connection | Connected Messaging (No Routing) | No backplane routing needed |
| Chassis-based with slot routing | Standard or Connected Messaging (With Routing) | Requires routing through chassis |
| Legacy controllers | Standard | Traditional unconnected messaging |

## License

Copyright (c) 2016-2020, ST-One Ltda., Guilherme Francescon Cittolin

Copyright (c) 2025, Enhanced version contributors

GNU General Public License v3.0 or later (see [LICENSE](LICENSE) or https://www.gnu.org/licenses/gpl-3.0.txt)

## Disclaimer

The Software is provided "AS IS", without warranty of any kind. The Licensor makes no warranty that the Software is free of defects or is suitable for any particular purpose. In no event shall the Licensor be responsible for loss or damages arising from the installation or use of the Software.

## Contributing

Contributions are welcome! Please feel free to:

- Report bugs by opening an issue
- Suggest enhancements
- Submit pull requests

## Support

Community support is offered on a best-effort basis via GitHub Issues and the Node-RED forum at [https://discourse.nodered.org/](https://discourse.nodered.org/)

## Keywords

`node-red`, `ethernet-ip`, `allen-bradley`, `rockwell`, `plc`, `industrial`, `automation`, `connected-messaging`, `cip`, `ethernetip`, `forward-open`
