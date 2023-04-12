const config = require('./config');
const sqlite = require('sqlite3');
const PrefixMaxLen = 64;

const user_config = require(config.CONFIG_FILE);
const Rules = user_config.rules;

console.log("Start discord forwarder");
console.log(Rules);

let db;
if (config.SQLITE_DB) {
  console.log('Use Sqlite db ' + config.SQLITE_DB)
  db = new sqlite.Database(config.SQLITE_DB);
}

function check_rule_conds(rule, msg) {
  return (
    (!rule.server_id || (message.guild && rule.server_id == message.guild.id))
    && (!rule.channel_id || rule.channel_id == message.channel.id)
    && (!rule.user_id || rule.user_id == message.author.id)
    && (!rule.channel_type || rule.channel_type == message.channel.type)
  );
}

function find_rule_from_config(prefix, msg, prefix_end_idx, cb) {
  for (var i = 0; i < Rules.length; i++) {
    let rule = Rules[i];
    if (rule.prefix === prefix && check_rule_conds(rule, msg)) {
      cb(rule, msg.content.slice(prefix_end_idx + 1));
    }
  }
}

// asdf.asdf alkj asdad -> asdf.asdf
// asdf -> asdf
// cb: function(rule, prefix_end_idx) {}
function find_rule(msg, cb) {
  let content = msg.content;
  if (!content) {  return } 
  let prefix_end_idx = content.indexOf(' ');
  let prefix;
  if (prefix_end_idx > 0) {
    prefix = content.slice(0, prefix_end_idx);
  } else {
    prefix = content.slice(0, PrefixMaxLen);
  }
  if (prefix === '') { return; }

  let rule;
  if (db) {
    db.all('select * from rules where prefix = ?', prefix, function(err, rows) {
      if (err) {
        console.error('db error!!', err);
        find_rule_from_config(prefix, msg, prefix_end_idx, cb);
        return;
      } else {
        for (var i = 0; i < rows.length; i++) {
          let rule = rows[i];
          if (check_rule_conds(rule, msg)) {
            cb(rule, content.slice(prefix_end_idx + 1));
            return;
          }
        }
        find_rule_from_config(prefix, msg, prefix_end_idx, cb);
      }
    });
  } else {
    find_rule_from_config(prefix, msg, prefix_end_idx, cb);
  }
}

exports.find_rule = find_rule;

