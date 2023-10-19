# UI-console-implementation-example

This repository contains projects designed to facilitate the integration of a VNC console connected to Metalsoft into any user interface.

The repository consists of two projects: console-implementation-example-ui and console-implementation-example-backend.

- **console-implementation-example-ui**: This is a React.js-based user interface designed to demonstrate the functionalities of a VNC (Virtual Network Computing) console. The project incorporates a Guacamole client, which is responsible for initiating a connection to Metalsoft's Guacamole server. Once this connection is established, the Guacamole server then takes over the role of connecting to a specific Metalsoft server via the VNC console. The primary goal of this project is to serve as a reusable example that can easily be integrated into various user interfaces.
- **console-implementation-example-backend**: This is a NestJS server that enables the retrieval of cookies required by the Guacamole client to establish a connection.

## Requirenments

1. A configured NGINX proxy server.
2. [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/) installed on the proxy server.
3. [Node.js](https://nodejs.org/en) and [npm](https://www.npmjs.com/) installed locally and on the proxy server.
4. [Git](https://git-scm.com/) installed on the local machine.

## How to use

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

# NGINX Configuration

This document provides guidance for configuring the NGINX server for `<ui_domain>` and `<proxy_domain>`.

## Prerequisites

1. NGINX installed on your system.
2. SSL certificates for your domain.
3. Root or sudo access to edit NGINX configuration files.

## Configuration File Structure

### UI Server Block
```
server {
    server_name  <ui_domain>;
    listen       80;
    listen  [::]:80;
    listen 443 ssl;
    ssl_certificate     <path_to_ssl_cert>;
    ssl_certificate_key <path_to_ssl_key>;
    ssl_protocols       TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_dhparam <path_to_dhparam>;

    access_log <path_to_access_log>;
    error_log <path_to_error_log>;

    location / {
        root   <path_to_root>;
        index  <default_indexes>;
        add_header 'Access-Control-Allow-Origin' 'https://<ui_domain>' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
    }
}
```

### Proxy Server Block

```
# Upstream block for load balancing
upstream <upstream_name> {
  server <backend_ip:backend_port>;
}

# Server block
server {
    server_name  <proxy_domain>;
    listen       80;
    listen  [::]:80;
    listen 443 ssl;
    ssl_certificate     <path_to_ssl_cert>;
    ssl_certificate_key <path_to_ssl_key>;
    ssl_protocols       TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_dhparam <path_to_dhparam>;

    access_log <path_to_access_log>;
    error_log <path_to_error_log>;

    location / {
        if ($request_method = 'OPTIONS') {
                add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
                add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, a-metalsoft-datacenter, Guacamole-Status-Code, Guacamole-Tunnel-Token';
                add_header 'Access-Control-Allow-Credentials' 'true';
                add_header 'Access-Control-Allow-Origin' 'https://<ui_domain>' always;
                add_header 'Content-Type' 'text/plain charset=UTF-8';
                add_header 'Content-Length' 0;
                return 204;
        }
        proxy_pass https://<upstream_name>;
        proxy_set_header Host "<proxy_host>";
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, a-metalsoft-datacenter, Guacamole-Status-Code, Guacamole-Tunnel-Token' always;
        add_header 'Access-Control-Allow-Origin' 'https://<ui_domain>' always;
        add_header 'Access-Control-Expose-Headers' 'Guacamole-Tunnel-Token, Guacamole-Status-Code, Guacamole-Error-Message' always;
    }

    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        #add_header 'Access-Control-Allow-Origin' 'https://<ui_domain>' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, a-metalsoft-datacenter, Guacamole-Status-Code, Guacamole-Tunnel-Token' always;
        add_header 'Access-Control-Expose-Headers' 'Guacamole-Tunnel-Token, Guacamole-Status-Code, Guacamole-Error-Message' always;
    }
}
```

## Steps to Apply Configuration

1. Open the NGINX configuration file:

```
sudo nano /etc/nginx/conf.d/default.conf
```

2. Copy and paste the generic configuration structure into the file.

3. Replace **`<upstream_name>`**, **`<backend_ip:backend_port>`**, **`<ui_domain>`**, **`<proxy_domain>`**, **`<path_to_ssl_cert>`**, **`<path_to_ssl_key>`**, **`<path_to_dhparam>`**, **`<path_to_access_log>`**, **`<path_to_error_log>`**, **`<path_to_root>`**, **`<default_indexes>`** and other placeholders with your specific implementation details.

4. Save and close the file.

5. Test the configuration:

```
sudo nginx -t
```

6. If the test is successful, reload NGINX:

```
sudo systemctl reload nginx
```

## NGINX Configuration example

Below is an example of an NGINX configuration file that's been used successfully in a development environment. You can use this as a starting point for your own configuration.

### UI Server Block
```
server {
    server_name  guacamole-app.metalsoft.dev;
    listen       80;
    listen  [::]:80;
    listen 443 ssl;
    ssl_certificate     /etc/letsencrypt/live/metalsoft.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/metalsoft.dev/privkey.pem;
    ssl_protocols       TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_dhparam /etc/ssl/certs/dhparam.pem;
    access_log /var/log/nginx/app_access.log;
    error_log /var/log/nginx/app_error.log;


    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
        add_header 'Access-Control-Allow-Origin' 'https://guacamole-app.metalsoft.dev' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
    }
}
```

### Proxy Server Block

```
upstream evengqa03 {
  server 10.255.146.180:443;
}
server {
    server_name  guacamole-test.metalsoft.dev;
    listen       80;
    listen  [::]:80;
    listen 443 ssl;
    ssl_certificate     /etc/letsencrypt/live/metalsoft.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/metalsoft.dev/privkey.pem;
    ssl_protocols       TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_dhparam /etc/ssl/certs/dhparam.pem;
    access_log /var/log/nginx/proxy_access.log;
    error_log /var/log/nginx/proxy_error.log;



    location / {
        if ($request_method = 'OPTIONS') {
                add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
                add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, a-metalsoft-datacenter, Guacamole-Status-Code, Guacamole-Tunnel-Token';
                add_header 'Access-Control-Allow-Credentials' 'true';
                add_header 'Access-Control-Allow-Origin' 'https://guacamole-app.metalsoft.dev' always;
                add_header 'Content-Type' 'text/plain charset=UTF-8';
                add_header 'Content-Length' 0;
                return 204;
        }
        proxy_pass https://evengqa03;
        proxy_set_header Host "eveng-qa03.metalcloud.io";
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, a-metalsoft-datacenter, Guacamole-Status-Code, Guacamole-Tunnel-Token' always;
        add_header 'Access-Control-Allow-Origin' 'https://guacamole-app.metalsoft.dev' always;
        add_header 'Access-Control-Expose-Headers' 'Guacamole-Tunnel-Token, Guacamole-Status-Code, Guacamole-Error-Message' always;
    }

    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        #add_header 'Access-Control-Allow-Origin' 'https://guacamole-app.metalsoft.dev' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, a-metalsoft-datacenter, Guacamole-Status-Code, Guacamole-Tunnel-Token' always;
        add_header 'Access-Control-Expose-Headers' 'Guacamole-Tunnel-Token, Guacamole-Status-Code, Guacamole-Error-Message' always;
    }
}
```