'use strict';

const { GacUIClient } = require('./index');

function usage() {
  console.log(`GacUI Node.js binding demo

Usage:
  gacui-nodejs-demo.exe [controls|dom] [--host 127.0.0.1] [--port 8888] [--app RemotingTest_Core]

This executable is a Node.js client for a running GacUI application that exposes
the HTTP automation endpoint. It does not bundle the native GacUI runtime.
`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    usage();
    return;
  }

  let command = 'controls';
  if (args[0] && !args[0].startsWith('--')) command = args.shift();
  if (!['controls', 'dom'].includes(command)) {
    usage();
    process.exitCode = 2;
    return;
  }

  const options = {};
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (!['--host', '--port', '--app'].includes(key) || !args[i + 1]) {
      usage();
      process.exitCode = 2;
      return;
    }
    options[key.slice(2)] = args[++i];
  }

  try {
    const client = new GacUIClient(options);
    const result = command === 'dom'
      ? await client.getDom()
      : await client.getControls();
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`GacUI request failed: ${error.message}`);
    console.error('Make sure a GacUI application with its HTTP automation service is running.');
    process.exitCode = 1;
  }
}

main();
