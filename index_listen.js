const config = require('./config');
const http = require('http');
const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({ intents: [ GatewayIntentBits.Guilds ] });

client.on('ready', () => {
  console.info('logged in as ' + client.user.tag);
});

client.on('error', err => {
  console.error(err);
  process.exit(1);
});

function discord_send(channel_id, msg) {
  client.channels.get(channel_id).send(msg).catch(err => { });
}
// client.login(config.TOKEN);

const host = '127.0.0.1'
const port = config.LISTEN_PORT;
if (!(port && port > 0)) {
  console.log("Invalid port " + port);
  process.exit(1);
}

function http_send(res, code, body) {
  res.writeHead(200);
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`)
  if (req.method === 'GET') {
    http_send(res, 200, 'Server running.')
    return;
  } else if (req.method !== 'POST') {
    http_send(res, 404)
    return;
  }

  if (req.url === "/msg/send") {
    let body = '';
    req.on('data', chunk => { body = body + chunk; })
    req.on('end', async () => {
      console.log('recv body ' + body);
      if (body === '') {
        http_send(res, 400, 'Invalid body, Example { "channel_id": "xxx", "msg": "yyy" }');
      } else {
        try {
          let desc = JSON.parse(body);
          if (desc.channel_id && desc.msg) {
            let channel = await client.channels.fetch(desc.channel_id)
            channel.send(desc.msg).catch(err => { });
            http_send(res, 200, 'OK')
          } else {
            http_send(res, 400, 'Invalid body, Example { "channel_id": "xxx", "msg": "yyy" }');
          }
        } catch(err) {
          console.log(err);
          http_send(res, 400, 'Failed to process');
        }
      }
    })
  } else {
    http_send(res, 404);
  }
})

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

