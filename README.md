# UI-console-implementation-example

This repository serves as an example for integrating a Virtual Network Computing (VNC) console into any user interface, leveraging Metalsoft's Guacamole Server. It's structured into two core components:

1. **Frontend** (`console-implementation-example-ui`): A React.js-based demonstration UI designed to assist with the integration of the Guacamole client. This UI initiates a connection to the Metalsoft's Guacamole server via a proxy, enabling VNC functionalities in your application.

2. **Backend** (`console-implementation-example-backend`): A NestJS-based server responsible for retrieving the cookies required for the Guacamole client to establish a secure connection. This is critical for the successful operation of the proxy and ultimately the VNC console.

Both of these components interact through an NGINX proxy server that serves three primary roles:

- Acts as a reverse proxy to Metalsoft's private Guacamole server, making it accessible.
- Hosts the `console-implementation-example-ui` for demonstration or testing purposes.
- Routes requests to the `console-implementation-example-backend`, facilitating cookie retrieval.

## Key Requirements:

- Both the backend and the proxy must be under the same domain to successfully retrieve cookies.

- NGINX server must be configured to route requests appropriately among the `console-implementation-example-ui`, `console-implementation-example-backend`, and Metalsoft's Guacamole Server.

The ultimate goal of this repository is to provide a comprehensive example that can be adapted and integrated into different user interfaces with minimal effort.

## Prerequisites

### Local Development Environment

1. [Git](https://git-scm.com/): Required for cloning the repository and version control.
2. [Node.js](https://nodejs.org/en) and [npm](https://www.npmjs.com/): Node.js package manager for installing dependencies.
3. SCP Tool: Required for securely transferring the built project files to the proxy server. Typically comes pre-installed on Unix-based systems.

### Server Requirements

1. Configured NGINX Proxy Server: An NGINX server must be set up to act as a reverse proxy for routing requests among the UI, backend, and the Metalsoft Guacamole Server.
2. [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/): A process manager for Node.js, needed for managing your backend service.
3. [Node.js](https://nodejs.org/en) and [npm](https://www.npmjs.com/): Required for running the backend service.

# NGINX Configuration Guide

This guide is intended to provide detailed instructions for configuring your NGINX server to act as a vital intermediary between your application's frontend, backend, and Metalsoft's Guacamole Server. The configuration facilitates the following:

1. **Frontend (`<ui_domain>` or `console-implementation-example-ui`)**: This is the user interface developed with React.js that enables VNC functionalities via Metalsoft's Guacamole Server. It receives incoming web requests and routes them to the appropriate server location.

2. **Backend (`<proxy_domain>` or `console-implementation-example-backend`)**: This is the NestJS-based server that retrieves necessary cookies for secure connection establishment. The proxy server routes requests to this backend to facilitate cookie retrieval.

3. **`Metalsoft's Guacamole Server`**: The NGINX server acts as a reverse proxy to this server, making VNC functionalities accessible.

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

#    error_page   500 502 503 504  /50x.html;
#    location = /50x.html {
#        root   /usr/share/nginx/html;
#    }

}
```

**Note:** The server setup is only part of the configuration. To ensure that everything functions as expected, please follow the steps in the **How to Use** section.

## How to Use

### Setup on Local Machine

1. Clone the Project:

```
git clone https://github.com/metalsoft-io/UI-console-implementation-example.git
```

2. Set up Environment Files:

- Navigate to both `console-implementation-example-ui` and `console-implementation-example-backend` directories.
- Create `.env` files in each and populate them with values from the respective `.env.example` files.

Configuration Details:

**For console-implementation-example-ui**

Create an `.env` file and set the following variable:

- **REACT_APP_BACKEND_URL**: This is the URL of the proxy server that facilitates the connection to Metalsoft's Guacamole Server.

**Example**: REACT_APP_BACKEND_URL=https://<proxy_domain>

**For console-implementation-example-backend**

Create an `.env` file and set the following variables:

- **FRONTEND_ORIGIN**: This is the URL where your frontend (`console-implementation-example-ui`) will be deployed.

**Example**: FRONTEND_ORIGIN=https://<ui_domain>
- **COOKIE_DOMAIN**: This is the domain name of the proxy server, which should be the same as the domain you've configured for backend.

**Example**: COOKIE_DOMAIN=<proxy_domain>

**Note**: The placeholders <proxy_domain> and <ui_domain> are meant to be replaced with your specific domain information. These placeholders correspond to the configurations in the NGINX server for proxy and UI, respectively. Ensure that both the backend and the proxy share the same domain (<proxy_domain>) to successfully retrieve cookies. The values mentioned are for demonstration purposes and should be adjusted to fit your specific setup requirements.

3. Install Dependencies:

```
cd console-implementation-example-ui && npm install
cd console-implementation-example-backend && npm install
```

4. Build the Projects:

```
npm run build
```
This will create build folders for both UI and backend.

### Transfer Builds to Proxy Server

1. Transfer Files:
Use SCP or your preferred tool to transfer the built folders to your proxy server.

```
# Transfer UI build
scp -r console-implementation-example-ui/build/* <user>@<proxy_server_IP>:/usr/share/nginx/html

# Transfer backend build
scp -r console-implementation-example-backend/dist .env package.json <user>@<proxy_server_IP>:/usr/share/nginx/server
```

### Setup on Proxy Server

1. SSH into Proxy Server:

```
ssh <user>@<proxy_server_IP>
```

2. Install Backend Dependencies:

```
cd /usr/share/nginx/server && npm install
```

3. Start Backend Server:

```
pm2 start dist/main.js
```

4. Verify Server Status:

```
pm2 ls
```

5. Testing the UI:

Open your web browser and go to the URL specified in your `FRONTEND_ORIGIN` environment variable (e.g., https://<ui_domain>).

### Post-Setup Steps

1. Login:

Once the UI has loaded, log in to your Metalsoft account.

2. Server Information:

Provide server-related information (e.g., `server ID`, `server instance ID`, `datacenter name`). You can either manually enter these details or retrieve them programmatically.

3. VNC Console:

If all steps are followed correctly and no errors occur, the VNC console should now be visible and functional.