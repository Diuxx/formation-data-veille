module.exports = {
  apps: [
    {
      name: "verly_api",
      cwd: "/home/ubuntu/verly_api",

      // Démarrage via npm (compatible Nest/Express/Fastify)
      script: "npm",
      args: "run start",

      env: {
        NODE_ENV: "production",
        PORT: 3000
      },

      // Logs
      out_file: "/home/ubuntu/logs/verly_api.out.log",
      error_file: "/home/ubuntu/logs/verly_api.err.log",
      merge_logs: true,
      time: true,

      // Robustesse
      min_uptime: "20000",
      max_restarts: 10,
      restart_delay: 2000,

      stop_exit_code: [0],

      autorestart: true,

      // Garde-fou mémoire
      max_memory_restart: "300M",

      // Prod = pas de watch
      watch: false,

      // Option scale (active seulement si stateless)
      // instances: "max",
      // exec_mode: "cluster",
      instances: 1,
      exec_mode: "fork"
    }
  ]
};