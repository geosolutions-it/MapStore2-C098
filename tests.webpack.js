var context = require.context('./js/reducers', true, /-test\.jsx?$/);
context.keys().forEach(context);
module.exports = context;
