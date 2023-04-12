module.exports = {
  TOKEN: process.env.TOKEN,
  LISTEN_PORT: Number(process.env.LISTEN_PORT), // for listen server
  CONFIG_FILE: process.env.CONFIG_FILE || "./config.json",
  SQLITE_DB: process.env.SQLITE_DB  // use sqlite to save config. readonly
};
