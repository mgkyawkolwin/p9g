# HOW TO DEPLOY
Deployment Procedure for both New and Update deployments.
Assume that all other dependencies and infrastructure are already installed and configured.

## 1 Installation And Configuration
### 1.1 Install Pm2 On Server (If not already installed)
```bash
npm install pm2 -g
```

### 1.2 Init Pm2 (New Deployment Only)
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

### 1.3 Copy Configuration File
- Copy package.json and other required configuration files and put in server web root.
- Update connection string in .env.production
- Run the "npx auth secret" in local machine and it will generate next-auth secret key in .env.local file. Copy the key and paste it in .env.production file on production server.

## 2 Database Preparation
### 2.1 Run Drizzle Migration To Get Schema Change
Run the following command to generate the new schema file or schema changes between previous schema.ts file and current schema.ts file.
```bash
npx drizzle-kit generate
```
This will generate the changed schema in /src/app/drizzle/migrations/ folder. 

### 2.2 Export Data
Export required data from the database.

### 2.3 Save Current Migration Files
Save both schema file (generated in 2.1) and data file (generated in 2.2) under /src/migrations/(versoin_x.x.x) folder.

## 3 App Preparation
### 3.1 Build App
```bash
npm run build
```

## 4 Deployment
Login to server using ssh.

### 4.1 Stop Server (For Upgrade Deployment)
Run this command to see the PM2 process ID.
```bash
pm2 status
```
Then stop the pm2 process using the id generated above.
```bash
pm2 stop x # replace x with actual id number
```
### 4.1 BackUp DB (For Upgrade Deployment)
Export production database and save.

### 4.2 BackUp App (For Upgrade Deployment)
Rename .next folder as x.x.x.next where x.x.x is current version number.
```bash
mv .next 1.0.0.next
```

### 4.3 Deploy App
Copy recently built .next folder and all of its content and put in the server root.

### 4.4 Deploy Database
Run the sql scripts saved previously in /src/migrations/version_x.x.x folder in production db server.

### 4.5 Run App 
For New deployment
```bash
pm2 start ecosystem.config.js 
```

For Update deployment
```bash
pm2 restart x # replace x with actual pm2 app id
```