## About
- Rest APIs for Todos App
- Authentication with JWT Token
- Postgres Database
- Sequelize ORM
- Fastify Provider for NestJS

## Used version of System Requirements
- git version 2.39.3
- node 16.20.2
- npm 8.19.4
- Docker version 27.2.0
- Docker Compose version 2.24.0

All of these must be available in your `PATH`. To verify things are set up
properly, you can run this:

```shell
git -v
node -v
npm -v
docker -v
docker-compose -v
```
# SETUP ALL APPS(postgres, test-api & test-ui) using Docker
1. clone repo - `git clone https://github.com/vijayliebe/test-api.git`
2. clone repo - `git clone https://github.com/vijayliebe/test-ui.git`
3. enter into test-ui i.e. angular repo folder - `cd test-ui`
4. run docker-compose for angular, nestjs & postgres - `docker-compose up`

    - If there is still any issue while setup, run these command and then above again -
        - a. `docker stop $(docker ps -a -q)`
        - b. `docker rm $(docker ps -a -q)`
        - c. `docker rmi postgres test-api/nestjs:1.0 test-ui/angular:1.0`
        - d. Remove `pgdata` folder in `test-api` - `cd test-api && rm -rf pgdata`
5. Register a user by visiting - http://localhost:4200/auth/register
6. Login using registered user by visiting - http://localhost:4200/auth/login
7. View / Create / Edit / Delete todos by visiting - http://localhost:4200/todos 
8. API Swagger UI - http://localhost:3000/api

## Setup NestJS APP
### Using Docker
1. clone repo - `git clone https://github.com/vijayliebe/test-api.git`
2. enter into repo - `cd test-api`
3. `docker compose -f docker-compose.dev.yml up`
    - If there is any issue, run these commands and then above again -
        - a. `docker stop $(docker ps -a -q)`
        - b. `docker rm $(docker ps -a -q)`
        - c. `docker rmi postgres test-api/nestjs:1.0`
        - d. Remove `pgdata` folder in `test-api` - `cd test-api && rm -rf pgdata`
4. Access nestjs server at port 3000 - http://localhost:3000

### Other way
1. clone repo - `git clone https://github.com/vijayliebe/test-api.git`
2. enter into repo - `cd test-api`
3. Start postgres server using docker & docker-compose - `docker-compose -f docker-compose.db.yml up -d`
4. Install dependencies - `npm i`
5. start nestjs server - `npm run start:dev`
6. Access nestjs server at port 3000 - http://localhost:3000

## Swagger UI
- http://localhost:3000/api

## Running Tests
`npm run test`

## Dockerfile
- `Dockerfile` build image for nestjs i.e. test-api app

## Docker-compose
- `docker-compose.db.yml` - This download postgres image and run postgres in docker container
- `docker-compose.dev.yml` - This start nestjs i.e. test-api app in docker container along with postgres

## Kubernetes deployment and service YAML
- Available in `K8s` folder

