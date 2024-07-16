const app = require('./app');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from config.env file
dotenv.config({ path: path.join(__dirname, 'config/config.env') });

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server listening to the port: ${process.env.PORT} in ${process.env.NODE_ENV}`);
});
