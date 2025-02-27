const config = require('./config');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const https = require('https');
const url = require('url');
const Rule = require('./rule');

console.log("Start discord forwarder");

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

async function process_msg(message) {
  Rule.find_rule(message, (rule, content) => {
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
        message.channel.send(reply).catch(err => { })
      })
    });
    req.on('error', err => {
      console.error(err);
    });
    req.write(JSON.stringify({
      id: message.id,
      user_id: message.author.id,
      channel_id: message.channel.id,
      channel_type: message.channel.type,
      server_id: message.guild ? message.guild.id : null,
      content: content
    }));
    req.end();
    return;
  });
}

client.on('messageCreate', msg => {
  if (msg.author.bot) { return; }

  console.log(
    `recv msg[user:${msg.author.id},`
    + `server:${msg.guild ? msg.guild.id : ''},`
    + `channel:${msg.channel.type}#${msg.channel.id}]: `
    + msg.content
  );

  process_msg(msg);
});

client.login(config.TOKEN);

