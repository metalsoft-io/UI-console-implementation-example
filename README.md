# UI-console-implementation-example

This repository contains projects designed to facilitate the integration of a VNC console connected to Metalsoft into any user interface.

The repository consists of two projects: console-implementation-example-ui and console-implementation-example-backend.

- **console-implementation-example-ui**: This is a React.js-based user interface designed to demonstrate the functionalities of a VNC (Virtual Network Computing) console. The project incorporates a Guacamole client, which is responsible for initiating a connection to Metalsoft's Guacamole server. Once this connection is established, the Guacamole server then takes over the role of connecting to a specific Metalsoft server via the VNC console. The primary goal of this project is to serve as a reusable example that can easily be integrated into various user interfaces.
- **console-implementation-example-backend**: This is a NestJS server that enables the retrieval of cookies required by the Guacamole client to establish a connection.

# Requirenments

1. A configured NGINX proxy server.
2. [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/) installed on the proxy server.
3. [Node.js](https://nodejs.org/en) and [npm](https://www.npmjs.com/) installed locally and on the proxy server.
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

For the **FRONTEND_ORIGIN** environment variable, specify the URL where the example project, named `console-implementation-example-ui`, will be deployed.

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

6. Run 

```
npm run build
```

from the `UI-console-implementation-example` folder. This command will create builds for both the UI and the backend.

7. On the server where the proxy is located and where NGINX is configured, create two directories if they do not already exist:

```
mkdir /usr/share/nginx/html
mkdir /usr/share/nginx/server
```

8. Use `scp` or a similar tool to transfer all built folders to your proxy server.

- **console-implementation-example-ui**

To copy the contents of the **console-implementation-example-ui** build folder to the proxy server, run the following command from the `console-implementation-example-ui` directory:

```
scp -r ./build/* <user>@<proxy_server_IP>:/usr/share/nginx/html
```

Here, `<user>` is the username on the proxy server, and `<proxy_server_IP>` is the IP address of the proxy server.

- **console-implementation-example-backend**

To copy the dist folder, `.env` file, and package.json from the **console-implementation-example-backend** project to the proxy server, run the following command from the `console-implementation-example-backend` directory:

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

10. At this point, you should be able to access the `console-implementation-example-ui` project by navigating to the URL specified in the **FRONTEND_ORIGIN** environment variable, which in this case is https://guacamole-app.metalsoft.dev.
11. Once the example project has loaded in your browser, log in to your Metalsoft account.
12. Supply server-related information such as the `server ID`, `server instance ID`, and `datacenter name`. In this demonstration, these details are entered manually, but you are welcome to obtain them programmatically through any method you're familiar with.
13. If no errors occur, the VNC console should become visible shortly.