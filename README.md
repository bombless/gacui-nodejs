# gacui-nodejs

Windows x64 Node.js client binding for the GacUI HTTP automation interface.

GacUI is a native C++ UI library. This repository provides a small Node.js API for
connecting to a GacUI application that has explicitly enabled its HTTP automation
service. It can read the Controls tree, read a renderer DOM tree, and forward IO
commands. This is a remote automation binding, **not** a native Node-API addon and
it does not create GacUI controls inside the Node.js process.

## Build

Requirements: Node.js 20 or newer.

```powershell
npm run demo -- controls --host 127.0.0.1 --port 8888 --app RemotingTest_Core
```

## API

```js
const { GacUIClient } = require('./src');

const client = new GacUIClient({
  host: '127.0.0.1',
  port: 8888,
  app: 'RemotingTest_Core',
});

const controls = await client.getControls();
// For a remote-protocol renderer endpoint:
const dom = await client.getDom();
// IO command structure depends on the GacUI automation operation:
await client.sendIO({ /* command fields defined by GacUI */ });
```

- `getControls()`: GET `/Automation/<app>/Controls`
- `getDom()`: GET `/Automation/<app>/Dom`
- `sendIO(command, windowId?)`: POST `/Automation/<app>/IO` or `IO/<windowId>`

The IO request uses the required `Content-Type: application/json; charset=utf8` header.
The JSON command schema is owned by the target GacUI application; this client passes
it through rather than guessing operation names or fields.

## Demo executable artifact

Every push to `main`, pull request, or manual workflow run packages a standalone
Windows x64 executable and uploads it as the GitHub Actions artifact
`gacui-nodejs-demo-windows-x64`.

1. Open the repository's **Actions** tab.
2. Select **Windows x64 demo** and open a successful workflow run.
3. Download **gacui-nodejs-demo-windows-x64** from Artifacts.
4. Run `gacui-nodejs-demo.exe --help` or `gacui-nodejs-demo.exe controls`.

The executable is a packaged Node.js client. It connects to an already-running GacUI
application; it does not include the GacUI native runtime or start a GUI application
by itself.

## GacUI HTTP endpoint

The target application must enable GacUI's automation service. For example, the
upstream `RemotingTest_Core` test application can expose
`http://localhost:8888/Automation/RemotingTest_Core/Controls` when built and started
with the appropriate Windows HTTP automation configuration. See the upstream
[Running a GacUI Application Project guide](https://github.com/vczh-libraries/Release/blob/master/.github/Guidelines/Running-GacUI.md).

GacUI upstream sources and licensing:
- [GacUI](https://github.com/vczh-libraries/GacUI)
- [Release](https://github.com/vczh-libraries/Release)

Review the upstream licenses before distributing GacUI itself.
