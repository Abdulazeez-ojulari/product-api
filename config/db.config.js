const config = require('config');
module.exports = {
  url: config.get('db')
};