const config = config('config');
module.exports = {
  url: config.get('db')
};