# HOW TO RUN

## Setup Secret Key For Next's Auth.js
This will generate AUTH_SECRET key in .env.local file
```bash
npx auth secret
```

## Setup DB
- create new mysql database
- update connection string .env

## Apply Migrations
```bash
npx drizzle-kit migrate
```

## Run The App
```bash
npm run dev
```

# How To Migrations
To create new migrations
```bash
npx drizzle-kit generate --name initial
```

To apply latest migrations
```bash
npx drizzle-kit migrate
```

## How to start mysql db service
Run mysql service 
```bash
sudo systemctl start mysql
# check status
sudo systemctl status mysql
```

## How to view mysql db admin
You can download single page admin panel from https://www.adminer.org
Then run the admin panel page
```bash
php -S localhost:8000 adminer-5.3.0.php
```

## How to output log to console
You can set env variables CONSOLE_LOG_LEVEL
1 - info, 2 - warning, 3 - error, 4 - debug