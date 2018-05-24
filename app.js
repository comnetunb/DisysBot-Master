/*
 *
 * Copyright (c) 2017 Matheus Medeiros Sarmento
 *
 */

/* eslint global-require: 0 */
/* eslint import/no-dynamic-require: 0 */

global.rootRequire = (name) => {
  return require(`${__dirname}/${name}`);
};

global.protocolRequire = (name) => {
  return require(`${__dirname}/../protocol/${name}`);
};

global.dispatcherRequire = (name) => {
  return require(`${__dirname}/servers/dispatcher/${name}`);
};

global.webServerRequire = (name) => {
  return require(`${__dirname}/servers/web/${name}`);
};

global.databaseRequire = (name) => {
  return require(`${__dirname}/database/${name}`);
};

const webServer = rootRequire('servers/web/service'); // eslint-disable-line
const dbDriver = rootRequire('database/db_driver'); // eslint-disable-line
const dispatcher = rootRequire('servers/dispatcher/dispatcher'); // eslint-disable-line

// Setup Database Driver
dbDriver()
  .then(() => {
    // Initialize dispatcher
    dispatcher();

    // Initialize WEB Server
    webServer();
  })
  .catch((e) => {
    console.log(e); // eslint-disable-line
  });

