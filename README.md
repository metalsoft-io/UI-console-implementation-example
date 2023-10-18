# UI-console-implementation-example

This repository contains projects designed to facilitate the integration of a VNC console connected to Metalsoft into any user interface.

The repository consists of two projects: console-implementation-example-ui and console-implementation-example-backend.

- **console-implementation-example-ui**: This is a React.js project that serves as the UI component. It includes a Guacamole client that connects to Metalsoft's Guacamole server. The Guacamole server is responsible for establishing a connection to a Metalsoft server via the VNC console. The project serves as an example which can be used in any UI.
- **console-implementation-example-backend**: This is a NestJS server that enables the retrieval of cookies required by the Guacamole client to establish a connection.

# Requirenments

1. A configured NGINX proxy server.
2. [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/) installed on the proxy server.
3. [Node.js](https://nodejs.org/en) and [npm](https://www.npmjs.com/) installed locally.
4. [Git](https://git-scm.com/) installed on the local machine.

# How to use
1. Clone the [project](https://github.com/metalsoft-io/UI-console-implementation-example/tree/main) to your local machine.
2. Create `.env` files in both `console-implementation-example-ui` and `console-implementation-example-backend` directories.
3. Copy and paste the content from `.env.example` into the appropriate `.env` files.

**`console-implementation-example-ui` `.env`**

- REACT_APP_BACKEND_URL=https://guacamole-test.metalsoft.dev

For **REACT_APP_BACKEND_URL**, provide the URL of the proxy server.

**`console-implementation-example-backend` `.env`**

Configure the following variables:

- FRONTEND_ORIGIN=https://guacamole-app.metalsoft.dev

For **FRONTEND_ORIGIN**, provide the URL where the VNC console will be used.

- COOKIE_DOMAIN=guacamole-test.metalsoft.dev

For **COOKIE_DOMAIN**, provide the domain name of the proxy server.

4. Go to **console-implementation-example-ui**, run

```
npm install
```

5. Go to **console-implementation-example-backend**, run

```
npm install
```

6. Run `npm run build`. This command will create builds for both the UI and the backend.

7. On the server where the proxy is located and where NGINX is configured, create two directories if they do not already exist:

```
mkdir /usr/share/nginx/html
mkdir /usr/share/nginx/server
```

8. Use `scp` or a similar tool to transfer all built folders to your proxy server.

- **console-implementation-example-ui**

To copy the contents of the **console-implementation-example-ui** build folder to the proxy server, run the following command from the project's root directory:

```
scp -r ./build/* <user>@<proxy_server_IP>:/usr/share/nginx/html
```

Here, `<user>` is the username on the proxy server, and `<proxy_server_IP>` is the IP address of the proxy server.

- **console-implementation-example-backend**

To copy the dist folder, `.env` file, and package.json from the **console-implementation-example-backend** project to the proxy server, run the following command from the project's root directory:

```
scp -r ./dist ./.env ./package.json <user>@<proxy_server_IP>:/usr/share/nginx/server
```

Here, `<user>` is the username on the proxy server, and `<proxy_server_IP>` is the IP address of the proxy server.

9. Navigate to the `/usr/share/nginx/server` folder on your proxy server.

Execute the following command to install the necessary packages:

```
npm install
```

Start the server by running the following command from the same folder:

```
pm2 start dist/main.js
```

To verify that the server has started, execute the following command:

```
pm2 ls
```

The output should resemble the following:

```
┌────┬─────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name    │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼─────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ main    │ default     │ 0.0.1   │ fork    │ 55734    │ 4h     │ 0    │ online    │ 0%       │ 72.2mb   │ root     │ disabled │
└────┴─────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```