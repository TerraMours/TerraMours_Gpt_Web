# TerraMours-Gpt-Web

简体中文 | [English](./README-En.md)

TerraMours实战项目，实现用户登陆和基于SK的多语言模型聊天、基于chatgpt和SD的多模型图片生成等功能。管理端实现数据看板、聊天记录管理，图片记录管理、用户管理、系统配置等。

TerraMours-Gpt-Web基于vue3.0+ts+naive UI+vite的ChatGPT项目前端。

官网地址：https://terramours.site/



## 1.目录结构
```
├─ docker-compose（部署）
├─ kubernetes（部署）
├─ public(logo图片)
├─ service(接口)
├─ src(前端代码)
│  ├─ api（接口调用）
│  ├─ components（组件）
│  ├─ hooks（钩子）
│  ├─ plugins（插件）
│  ├─ router（路由）
│  ├─ store（主要记的本地缓存）
│  ├─ views（页面）
│  │  └─ chat
│  │  │  └─ components
│  │  │  └─layout(布局)
│  │  │  │  └─ Layout.vue(布局vue，基础)
│  │  │  │  └─ Permission.vue(免责声明和验证码弹窗，重要，登录框根据这个改)
│  │  │  └─index.vue(聊天页面)
│  └─ README.md
├─ .gitignore
└─ package.json
```

## 2.快速搭建

### 1.基于dockercompose的快速搭建AI聊天和画图系统

#### 1.新建一个空文件命名为docker-compose.yml

新建一个空文件命名为docker-compose.yml，将以下内容粘贴到文件中保存

```dockerfile
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
  server:
    image: raokun88/terramours_gpt_server:latest
    container_name: terramours_gpt_server
    environment:
      - TZ=Asia/Shanghai
      - ENV_DB_CONNECTION=Host=postgres;Port=5432;Userid=postgres;password=terramours1024;Database=TerraMoursGpt;
      - ENV_REDIS_HOST=redis:6379
    volumes:
      # 图片挂载地址，将容器中的图片挂载出来
      - F:\Docker\terra\server\images:/app/images
      # 可挂载自定义的配置文件快速进行系统配置
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
      - VUE_APP_API_BASE_URL=http://127.0.0.1:3116
    ports:
      - "3226:8081"
    restart: always
    networks:
      - server

  web:
    image: raokun88/terramours_gpt_web:latest
    container_name: terramoursgptweb
    environment:
      - VUE_APP_API_BASE_URL=http://127.0.0.1:3116
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

#### 2.上传dockercompose文件到服务器

上传dockercompose文件到服务器，我使用的是XFTP。

#### 3.执行docker命令，构建dockercompose

```shell
docker-compose up
```



### 2.使用docker命令构建前端项目

除了dockercompose以外，我们已经将前端镜像上传dockerhub，还可以采用docker命令快速构建前端项目。在服务器执行docker命令，命令如下

```shell
docker run --name terramoursgptweb -p 3216:8081 -e VUE_APP_API_BASE_URL=http://localhost:3002 --restart always -d raokun88/terramours_gpt_web:latest //VUE_APP_API_BASE_URL为后端API地址，请替换成对应的内容
```

**注意：VUE_APP_API_BASE_URL为后端API地址，请替换成对应的内容**



## 3.项目运行

#### 运行测试
```bash
pnpm dev
```
#### Docker 构建

```bash
docker build -t terramoursgptweb .

# 前台运行
docker run --name TerraMours_Gpt_Web -d -p 3002:4173 --restart always TerraMours_Gpt_Web

# 保存镜像
docker save -o chatweb.tar TerraMours_Gpt_Web

# 运行地址
http://localhost:3002/
```



## 4.项目截图

### 用户端

![image-20231009162945490](./img/image-20231009162945490.png)

![image-20231009163023113](./img/image-20231009163023113.png)

![image-20231009163034502](./img/image-20231009163034502.png)

![image-20230919161649398](./img/image-20230919161649398.png)

![image-20231009163143285](./img/image-20231009163143285.png)

### 管理端

![image-20231009163315039](./img/image-20231009163315039.png)

![image-20231009163357592](./img/image-20231009163357592.png)



## [5.如何贡献](https://github.com/TerraMours/TerraMours_Gpt_Web#如何贡献)

1. Fork & Clone
2. Create Feature/name(your github id)/issuexxx branch
3. Commit with commit message, like `solve issue xxx，add xxx`
4. Create Pull Request

如果你希望参与贡献，欢迎 [Pull Requests](https://github.com/firstsaofan/TerraMours/pulls),或给我们 [Issues](https://github.com/firstsaofan/TerraMours/issues)



## [6.个人博客地址：](https://github.com/TerraMours/TerraMours_Gpt_Web#个人博客地址)

raokun:https://www.raokun.top/

firstsaofan:https://www.firstsaofan.top/



## [7.贡献者](https://github.com/TerraMours/TerraMours_Gpt_Web#贡献者)

[**raokun**](https://github.com/raokun)、[**Mortal**](https://github.com/mortal-nf)、[**firstsaofan**](https://github.com/firstsaofan)

