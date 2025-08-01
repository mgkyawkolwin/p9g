# HOW TO DEPLOY
## Build
```bash
npm run build
```

## Copy & Deploy
Copy .next folder and all of its content and put in the server root

## Install Pm2
npm install pm2 -g

## init pm2
pm2 init # this will generate ecosystem.config.js
replace args with args: 'next -p 3001'

## run 
pm2 start ecosystem.config.js