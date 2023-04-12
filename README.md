# discord-forwarder

Forward Discord message to webhook.

## Environment variables
- `TOKEN`: a bot/user token
- `CONFIG_FILE`: use other config file, default is ./config.json

## config.json

```json
{
  "rules": [
    {
      // conditions
      "prefix": "ping",
      "server_id": null, // check server id if exist
      "channel_id": null, // check channel id if exist
      "channel_type": 1, // check channel type if exist. null don't check, 1 is direct message
      "user_id": null, //  check user id

      // call webhook if all conditions match & skip check other rules
      "webhook": "https://xxx", // must use https
    },
  ]
}
```
