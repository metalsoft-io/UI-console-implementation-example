module.exports = {
    apps: [
      {
        name: "my-nestjs-app",
        script: "./dist/main.js",
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: "1G",
      },
    ],
  };
  