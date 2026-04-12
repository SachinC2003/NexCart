 npm install -D typescript ts-node nodemon @types/node @types/express
 npm install typeorm reflect-metadata sqlite3
 npm run typeorm migration:run -- -d src/configs/data-sourse.ts
 npm run typeorm migration:generate src/migrations/InitialCreate -- -d src/configs/data-sourse.ts