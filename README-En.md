# TerraMours-Gpt

[简体中文](./README.md) | English

TerraMours practical project, the frontend of ChatGPT project based on vue3.0+ts+naive UI+vite. It realizes functions such as user login, chat based on SK language model, and multi-model image generation based on chatgpt and SD.

Official website: https://terramours.site/

## Developed Features
- **AI Chat**: Supports multiple models: gpt-3.5-turbo, gpt-3.5-turbo-16k, gpt-4, ChatGLM. Supports integration with Semantic Kernel.

- **AI Drawing**: Supports image generation using Stable Diffusion and the dallE model from chatgpt.
- **Data Dashboard**: Displays multiple data statistics that include several data types most important to management personnel. The charts present statistics on chat and drawing counts across multiple dimensions, divided into three dimensions: daily (segmented by hour), daily, and monthly. The following is the data content for daily statistics.
- **System Management**:
	- **Email Service Configuration**: Configures the API service parameters for system emails used for sending verification codes via email.
	- **GPT Settings**: Configures the proxy address, pricing plan, interface parameters, and KEY pool configuration for GPT.
	- **Image Service Address**: Configures the service address for AI image drawing.
- **Chat Records**: Manages chat records and queries user session information. (todo: 1. Export function, 2. Create fine-tuning model)
- **Sensitive Word Management**: Manages sensitive words and customizes word filtering to enhance system security.
- **Key Pool Management**: Manages the Key pool, allowing administrators to add multiple keys to form a Key pool for improved stability by using a round-robin approach when calling the AI interface.
- **System Prompt Words**: Provides system prompt words for various roles, enabling users to use AI conversation more effectively.
- **Drawing Records**: View the generation records of images in the system.
- **Menu Management**: Implements dynamic configuration of menus in the backend management system. The menu management interface allows setting menus, and the backend API includes basic menu options during initialization.
- **Role Management**: Controls roles in the backend management system. The default roles include Super Administrator and Regular User.
- **User Management**: Manages registered users in the system.
- **Product Management - Product Categories**: Sets the type and classification information for products to facilitate product management.
- **Product Management - Product List**: Sets product information.
- **Order List**: View generated orders.

## Update History
2023.12.4 V1.5 NEW!:

1. Refactored backend API services to address concurrent query issues.

2. New additions to the data dashboard functionality:

       1. Sales revenue order statistics table
       2. Token consumption time distribution chart
       3. Online user count time distribution chart
       4. Sales revenue time distribution chart
       5. Statistics and proportional distribution charts of question frequency/image generation frequency/token consumption for each model.

2023.12.4 V1.4 ：
1.Update AllInAI.Sharp.API SDK to version 1.1.6, adding support for retrieving token values from OpenAI's streaming interface.

2023.12.4 V1.3 ：
1. Added support for model  Stable-Diffusion-XL from Wenxin Yiyan。
2. chat and image will all config in key pool configuration。
3. Used the model calling SDK of AllInAI.Sharp.API version 1.15 to uniformly call AI models.

2023.12.4 V1.2:
1. Added support for models such as Wenxin Yiyuan and Tongyi Qianwen.
2. Added  configuration of model key pool for Wenxin Yiyuan and Tongyi Qianwen in the management system.
3. Used the model calling SDK of AllInAI.Sharp.API to uniformly call AI models.

2023.11.16 V1.1.1：
1. Resolve some bugs after updating the key pool

2023.11.15 V1.1:
1. Added support for ChatGLM. Frontend model selection now includes ChatGLM.
2. Refactored the key pool interface. The new key pool allows for specifying a particular model.
3. Fixed an issue where adding a new user with a pricing of 0 still prompted insufficient balance.


## 1. Directory Structure
```
├─ docker-compose (Deployment)
├─ kubernetes (Deployment)
├─ public (Logo Images)
├─ service (API)
├─ src (Front-End Code)
│  ├─ api (API Calls)
│  ├─ components (Components)
│  ├─ hooks (Hooks)
│  ├─ plugins (Plugins)
│  ├─ router (Router)
│  ├─ store (Remembering Local Cache)
│  ├─ views (Pages)
│  │  └─ chat
│  │  │  └─ components
│  │  │  └─ layout (Layout)
│  │  │  │  └─ Layout.vue (Layout Vue, Basic)
│  │  │  │  └─ Permission.vue (Disclaimer and Verification Code Pop-Up Window, Important, Modify Login Box According to This)
│  │  │  └─ index.vue (Chat Page)
│  └─ README.md
├─ .gitignore
└─ package.json
```

## 2.Quick Setup

### 1. Quick setup of AI chat and drawing system based on docker-compose

#### 1. Create a new empty file named docker-compose.yml

Create a new empty file named docker-compose.yml and paste the following contents into the file, then save it.


```yaml
version: "3.9"
services:
  redis:
    image: redis
    container_name: redis_container
    ports:
      - "6379:6379"
    restart: always
    networks:
      - server

  postgres:
    image: postgres
    container_name: postgres_container
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=terramours1024
      - POSTGRES_DB=TerraMoursGpt
    ports:
      - "5432:5432"
    restart: always
    networks:
      - server

  seq:
    image: datalust/seq
    container_name: seq_container
    environment:
      - ACCEPT_EULA=Y
    ports:
      - "5341:80"
    restart: always
    networks:
      - server

  server:
    image: raokun88/terramours_gpt_server:latest
    container_name: terramours_gpt_server
    environment:
      - TZ=Asia/Shanghai
      - ENV_DB_CONNECTION=Host=postgres;Port=5432;Userid=postgres;password=terramours1024;Database=TerraMoursGpt;
      - ENV_REDIS_HOST=redis:6379
      - ENV_SEQ_HOST=http://<YOUR-SERVER-IP>:5341/
    volumes:
      # Image mount address, mount images out of the container
      - /path/terra/images:/app/images
      # You can mount custom configuration files for quick system configuration
      #- F:\Docker\terra\server/appsettings.json:/app/appsettings.json
    ports:
      - "3116:80"
    restart: always
    networks:
      - server
    depends_on:
      - postgres
      - redis
  admin:
    image: raokun88/terramours_gpt_admin:latest
    container_name: terramoursgptadmin
    environment:
      - VUE_APP_API_BASE_URL=http://<YOUR-SERVER-IP>:3116
    ports:
      - "3226:8081"
    restart: always
    networks:
      - server

  web:
    image: raokun88/terramours_gpt_web:latest
    container_name: terramoursgptweb
    environment:
      - VUE_APP_API_BASE_URL=http://<YOUR-SERVER-IP>:3116
    ports:
      - "3216:8081"
    restart: always
    networks:
      - server

networks:
  server:
    driver:
      bridge

```

##### Installation Notes

1. Modify the yml file: Replace `<YOUR-SERVER-IP>` with the IP address of your server.<br/>
2. Default admin account credentials: terramours@163.com terramours@163.com<br/>
3. If there are system errors, use `seq` to view them. Access the following URL: `http://<YOUR-SERVER-IP>:5341/`<br/>
4. In the seq logs, if you see "Initialization of the database successful," it means that the backend service has been successfully initialized. During the initial installation, there may be some error messages. It is recommended to restart the terramours_gpt_server container after the docker-compose installation is complete.<br/>
5. For more service configurations, you can copy the appsettings.json file from the server's GitHub repository to the server and modify the configuration file by mounting it in the container.<br/>
```
# Mount your custom configuration file to perform system configuration quickly
- /path/terra/appsettings.json:/app/appsettings.json
```

#### 2. Upload the docker-compose file to the server

Upload the docker-compose file to the server. I used XFTP for this purpose.

#### 3. Execute the Docker command to build the docker-compose.

```shell
docker-compose up
```

### 2. Building Frontend Project using Docker Command

Apart from docker-compose, we have also uploaded the frontend image to Docker Hub, and we can build the frontend project quickly using the docker command. Run the following command on the server:

```shell
docker run --name terramoursgptweb -p 3216:8081 -e VUE_APP_API_BASE_URL=http://localhost:3002 --restart always -d raokun88/terramours_gpt_web:latest //Replace VUE_APP_API_BASE_URL with the corresponding backend API address
```

**Note: Replace VUE_APP_API_BASE_URL with the corresponding backend API address**



## 3. Running the Project

#### Running Tests
```bash
pnpm dev
```
#### Building with Docker

```bash
docker build -t terramoursgptweb .

# Running in foreground
docker run --name TerraMours_Gpt_Web -d -p 3002:4173 --restart always TerraMours_Gpt_Web

# Saving the image
docker save -o chatweb.tar TerraMours_Gpt_Web

# Running address
http://localhost:3002/
```


## 4.Project screenshot

### client

![image-20231009162945490](./img/image-20231009162945490.png)

![image-20231009163023113](./img/image-20231009163023113.png)

![image-20231009163034502](./img/image-20231009163034502.png)

![image-20230919161649398](./img/image-20230919161649398.png)

![image-20231009163143285](./img/image-20231009163143285.png)

### Management

![image-20231009163315039](./img/image-20231009163315039.png)

![image-20231009163357592](./img/image-20231009163357592.png)



## [5.How to contribute](https://github.com/TerraMours/TerraMours_Gpt_Web#如何贡献)

1. Fork & Clone
2. Create Feature/name(your github id)/issuexxx branch
3. Commit with commit message, like `solve issue xxx，add xxx`
4. Create Pull Request

If you wish to contribute, welcome [Pull Requests](https://github.com/firstsaofan/TerraMours/pulls),Or give us [Issues](https://github.com/firstsaofan/TerraMours/issues)



## [6.Personal blog address：](https://github.com/TerraMours/TerraMours_Gpt_Web#个人博客地址)

raokun:https://www.raokun.top/

firstsaofan:https://www.firstsaofan.top/



## [7.contributor](https://github.com/TerraMours/TerraMours_Gpt_Web#贡献者)

[**raokun**](https://github.com/raokun)、[**Mortal**](https://github.com/mortal-nf)、[**firstsaofan**](https://github.com/firstsaofan)
