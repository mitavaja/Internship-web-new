const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/environment');

let server;

const startServer = async () => {
  // Connect to Database
  await connectDB();

  server = app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`🚀 MAINDOT IMS Backend Server running on port ${config.port}`);
    console.log(`📡 Environment: ${config.env}`);
    console.log(`🔗 Health Check: http://localhost:${config.port}/health`);
    console.log(`📚 API Base URL: http://localhost:${config.port}/api/v1`);
    console.log(`====================================================`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down gracefully...', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
  process.exit(1);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  if (server) {
    server.close(() => {
      console.log('💥 Process terminated!');
    });
  }
});

startServer();
