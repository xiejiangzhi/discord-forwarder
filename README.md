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
      "prefix": "ping",
      "server_id": null, // check server id if exist
      "channel_id": null, // check channel id if exist
      "webhook": "https://xxx", // must use https
    },
  ]
}
```
