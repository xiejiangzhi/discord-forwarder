const config = require('./config');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const https = require('https');
const url = require('url');

const user_config = require(config.CONFIG_FILE);
console.log("Start discord forwarder");
console.log(user_config);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [ Partials.Channel ],
});

client.on('ready', () => {
  console.info('logged in as ' + client.user.tag);
});

client.on('error', err => {
  console.error(err);
  process.exit(1);
});

client.on('warn', message => {
  console.warn(message);
});

client.on('reconnecting', message => {
  console.info('reconnecting...');
});

client.on('resume', message => {
  console.info('connected');
});

client.on('disconnect', message => {
  console.info('disconnected');
  process.exit(1);
});

function process_msg(message) {
  let content = message.content;
  for (var i = 0; i< user_config.rules.length; i++) {
    let rule = user_config.rules[i];
    if (
      (rule.server_id && (!message.guild || rule.server_id != message.guild.id))
      || (rule.channel_id && rule.channel_id != message.channel.id)
      || (rule.user_id && rule.user_id != message.author.id)
      || (rule.channel_type && rule.channel_type != message.channel.type)
      || !content.startsWith(rule.prefix)
    ) {
      continue;
    }

    console.log('call webhook ' + rule.webhook);
    let opts = url.parse(rule.webhook);
    opts.method = 'POST'
    opts.headers = {
      'Content-Type': 'application/json'
    }
    let req = https.request(opts, (res) => {
      console.log('recv webhook ' + res.statusCode);
      let body = '';
      res.on('data', chunk => { body = body + chunk });
      res.on('end', () => {
        if (res.statusCode != 200) { return; }
        console.log('recv webhook body ' + body);
        let reply = JSON.parse(body);
        message.channel.send(reply.content).catch(err => { })
      })
    });
    req.on('error', err => {
      console.error(err);
    });
    req.write(JSON.stringify({ "content": content }));
    req.end();
    return;
  }
}

client.on('messageCreate', msg => {
  if (msg.author.bot) { return; }
  if (user_config.rules.length <= 0) { return; }

  console.log(
    `recv msg[user:${msg.author.id},`
    + `server:${msg.guild ? msg.guild.id : ''},`
    + `channel:${msg.channel.type}#${msg.channel.id}]: `
    + msg.content
  );

  process_msg(msg);
});

client.login(config.TOKEN);

