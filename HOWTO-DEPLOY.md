# HOW TO DEPLOY

## Stop Server
- Login to server using ssh
- Run PM2 status to check the app
- Run PM2 stop (number) to stop the relevant app with app id


## Database
### Run Drizzle Migration To Get Schema Change
Run the following command to generate the schema different between previous schema.ts file and current schema.ts file.
```bash
npx drizzle-kit generate
```
This will generate the changed schema in /src/app/drizzle/migrations/ folder.

### Export Data
Export required data from the dabase.

### Keep Current Migration Files
Save both schema file and data file under /src/migrations/(versoin_x.x.x) folder.

### Deploy To Production Database
- Backup production database
- Apply schema changes
- Apply data


## App
### Build App
```bash
npm run build
```

### BackUp App

### Copy & Deploy
Copy .next folder and all of its content and put in the server root

### Install Pm2 On Server (If not isstalled)
```bash
npm install pm2 -g
```

### Init Pm2 (Initial Deployment)
Generate ecosystem.config.js
```bash
pm2 init # this will generate ecosystem.config.js
```
```bash
module.exports = {
  apps : [{
    name: 'uat',
    script: 'node_modules/next/dist/bin/next',
    args: "start -p 3001", 
    watch: '.'
  }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
```
Replace args with desired port. args: 'next -p 3000'

### Run (Initial Deployment)
pm2 start ecosystem.config.js 

## Restart Server (Upgrade Deployment)
- Run PM2 status to check the app id
- Run PM2 restart (number) to restart the relevant app with app id


