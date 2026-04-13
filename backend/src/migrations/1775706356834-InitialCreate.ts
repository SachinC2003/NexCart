import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialCreate1775706356834 implements MigrationInterface {
    name = 'InitialCreate1775706356834'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "refresh_token" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "sessionId" varchar NOT NULL, "token" varchar NOT NULL, "deviceName" varchar, "browser" varchar, "os" varchar, "userAgent" varchar, "ipAddress" varchar, "lastUsedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "expiresAt" datetime NOT NULL, "revokedAt" datetime, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "userId" integer, CONSTRAINT "UQ_4f310b2b1f45ec02710a7193611" UNIQUE ("sessionId"), CONSTRAINT "UQ_c31d0a2f38e6e99110df62ab0af" UNIQUE ("token"))`);
        await queryRunner.query(`CREATE TABLE "cart" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer, CONSTRAINT "UQ_756f53ab9466eb52a52619ee019" UNIQUE ("userId"), CONSTRAINT "REL_756f53ab9466eb52a52619ee01" UNIQUE ("userId"))`);
        await queryRunner.query(`CREATE TABLE "cart_item" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "cartId" integer, "productId" integer, CONSTRAINT "UQ_86ecfe066ef04fcf69bdbae722b" UNIQUE ("cartId", "productId"))`);
        await queryRunner.query(`CREATE TABLE "review" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "rating" integer NOT NULL, "comment" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "productId" integer, CONSTRAINT "UQ_711cb665a4d4f8421265d921319" UNIQUE ("userId", "productId"))`);
        await queryRunner.query(`CREATE TABLE "sub_category" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "categoryId" integer NOT NULL, CONSTRAINT "UQ_bb5ff711af320abd47e76579c00" UNIQUE ("name", "categoryId"))`);
        await queryRunner.query(`CREATE TABLE "type" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, CONSTRAINT "UQ_e23bfe7255ada131861292923fe" UNIQUE ("name"))`);
        await queryRunner.query(`CREATE TABLE "category" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "typeId" integer NOT NULL, CONSTRAINT "UQ_7a153c7f24a4d3862bfc274bc50" UNIQUE ("name", "typeId"))`);
        await queryRunner.query(`CREATE TABLE "product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" varchar NOT NULL, "image" varchar NOT NULL, "brandName" varchar NOT NULL, "purchaseCount" integer DEFAULT (0), "price" integer NOT NULL, "originalPrice" integer, "stock" integer NOT NULL, "avgRating" decimal NOT NULL DEFAULT (0), "offer" integer, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "deleteAt" datetime, "isActive" boolean NOT NULL DEFAULT (1), "categoryId" integer NOT NULL, "subCategoryId" integer NOT NULL, "typeId" integer NOT NULL, "userId" integer)`);
        await queryRunner.query(`CREATE TABLE "order_item" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "subTotal" decimal NOT NULL, "orderId" integer, "productId" integer, CONSTRAINT "UQ_7e383dc486afc7800bf87d1c11a" UNIQUE ("orderId", "productId"))`);
        await queryRunner.query(`CREATE TABLE "order" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "totalAmount" float NOT NULL, "status" varchar NOT NULL DEFAULT ('PLACED'), "paymentMethod" varchar NOT NULL, "location" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer)`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "email" varchar NOT NULL, "password" varchar NOT NULL, "role" varchar NOT NULL DEFAULT ('user'), "phoneNumber" varchar, "isActive" boolean NOT NULL DEFAULT (1), "location" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "temporary_refresh_token" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "sessionId" varchar NOT NULL, "token" varchar NOT NULL, "deviceName" varchar, "browser" varchar, "os" varchar, "userAgent" varchar, "ipAddress" varchar, "lastUsedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "expiresAt" datetime NOT NULL, "revokedAt" datetime, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "userId" integer, CONSTRAINT "UQ_4f310b2b1f45ec02710a7193611" UNIQUE ("sessionId"), CONSTRAINT "UQ_c31d0a2f38e6e99110df62ab0af" UNIQUE ("token"), CONSTRAINT "FK_8e913e288156c133999341156ad" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_refresh_token"("id", "sessionId", "token", "deviceName", "browser", "os", "userAgent", "ipAddress", "lastUsedAt", "expiresAt", "revokedAt", "createdAt", "userId") SELECT "id", "sessionId", "token", "deviceName", "browser", "os", "userAgent", "ipAddress", "lastUsedAt", "expiresAt", "revokedAt", "createdAt", "userId" FROM "refresh_token"`);
        await queryRunner.query(`DROP TABLE "refresh_token"`);
        await queryRunner.query(`ALTER TABLE "temporary_refresh_token" RENAME TO "refresh_token"`);
        await queryRunner.query(`CREATE TABLE "temporary_cart" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer, CONSTRAINT "UQ_756f53ab9466eb52a52619ee019" UNIQUE ("userId"), CONSTRAINT "REL_756f53ab9466eb52a52619ee01" UNIQUE ("userId"), CONSTRAINT "FK_756f53ab9466eb52a52619ee019" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_cart"("id", "userId") SELECT "id", "userId" FROM "cart"`);
        await queryRunner.query(`DROP TABLE "cart"`);
        await queryRunner.query(`ALTER TABLE "temporary_cart" RENAME TO "cart"`);
        await queryRunner.query(`CREATE TABLE "temporary_cart_item" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "cartId" integer, "productId" integer, CONSTRAINT "UQ_86ecfe066ef04fcf69bdbae722b" UNIQUE ("cartId", "productId"), CONSTRAINT "FK_29e590514f9941296f3a2440d39" FOREIGN KEY ("cartId") REFERENCES "cart" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_75db0de134fe0f9fe9e4591b7bf" FOREIGN KEY ("productId") REFERENCES "product" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_cart_item"("id", "quantity", "cartId", "productId") SELECT "id", "quantity", "cartId", "productId" FROM "cart_item"`);
        await queryRunner.query(`DROP TABLE "cart_item"`);
        await queryRunner.query(`ALTER TABLE "temporary_cart_item" RENAME TO "cart_item"`);
        await queryRunner.query(`CREATE TABLE "temporary_review" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "rating" integer NOT NULL, "comment" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "productId" integer, CONSTRAINT "UQ_711cb665a4d4f8421265d921319" UNIQUE ("userId", "productId"), CONSTRAINT "FK_1337f93918c70837d3cea105d39" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_2a11d3c0ea1b2b5b1790f762b9a" FOREIGN KEY ("productId") REFERENCES "product" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_review"("id", "rating", "comment", "createdAt", "userId", "productId") SELECT "id", "rating", "comment", "createdAt", "userId", "productId" FROM "review"`);
        await queryRunner.query(`DROP TABLE "review"`);
        await queryRunner.query(`ALTER TABLE "temporary_review" RENAME TO "review"`);
        await queryRunner.query(`CREATE TABLE "temporary_sub_category" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "categoryId" integer NOT NULL, CONSTRAINT "UQ_bb5ff711af320abd47e76579c00" UNIQUE ("name", "categoryId"), CONSTRAINT "FK_51b8c0b349725210c4bd8b9b7a7" FOREIGN KEY ("categoryId") REFERENCES "category" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_sub_category"("id", "name", "categoryId") SELECT "id", "name", "categoryId" FROM "sub_category"`);
        await queryRunner.query(`DROP TABLE "sub_category"`);
        await queryRunner.query(`ALTER TABLE "temporary_sub_category" RENAME TO "sub_category"`);
        await queryRunner.query(`CREATE TABLE "temporary_category" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "typeId" integer NOT NULL, CONSTRAINT "UQ_7a153c7f24a4d3862bfc274bc50" UNIQUE ("name", "typeId"), CONSTRAINT "FK_7aff6c4a31d9a2ec09e31d98f6f" FOREIGN KEY ("typeId") REFERENCES "type" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_category"("id", "name", "typeId") SELECT "id", "name", "typeId" FROM "category"`);
        await queryRunner.query(`DROP TABLE "category"`);
        await queryRunner.query(`ALTER TABLE "temporary_category" RENAME TO "category"`);
        await queryRunner.query(`CREATE TABLE "temporary_product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" varchar NOT NULL, "image" varchar NOT NULL, "brandName" varchar NOT NULL, "purchaseCount" integer DEFAULT (0), "price" integer NOT NULL, "originalPrice" integer, "stock" integer NOT NULL, "avgRating" decimal NOT NULL DEFAULT (0), "offer" integer, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "deleteAt" datetime, "isActive" boolean NOT NULL DEFAULT (1), "categoryId" integer NOT NULL, "subCategoryId" integer NOT NULL, "typeId" integer NOT NULL, "userId" integer, CONSTRAINT "FK_ff0c0301a95e517153df97f6812" FOREIGN KEY ("categoryId") REFERENCES "category" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_463d24f6d4905c488bd509164e6" FOREIGN KEY ("subCategoryId") REFERENCES "sub_category" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_53bafe3ecc25867776c07c9e666" FOREIGN KEY ("typeId") REFERENCES "type" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_329b8ae12068b23da547d3b4798" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_product"("id", "name", "description", "image", "brandName", "purchaseCount", "price", "originalPrice", "stock", "avgRating", "offer", "createdAt", "updatedAt", "deleteAt", "isActive", "categoryId", "subCategoryId", "typeId", "userId") SELECT "id", "name", "description", "image", "brandName", "purchaseCount", "price", "originalPrice", "stock", "avgRating", "offer", "createdAt", "updatedAt", "deleteAt", "isActive", "categoryId", "subCategoryId", "typeId", "userId" FROM "product"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`ALTER TABLE "temporary_product" RENAME TO "product"`);
        await queryRunner.query(`CREATE TABLE "temporary_order_item" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "subTotal" decimal NOT NULL, "orderId" integer, "productId" integer, CONSTRAINT "UQ_7e383dc486afc7800bf87d1c11a" UNIQUE ("orderId", "productId"), CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0" FOREIGN KEY ("orderId") REFERENCES "order" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_904370c093ceea4369659a3c810" FOREIGN KEY ("productId") REFERENCES "product" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_order_item"("id", "quantity", "subTotal", "orderId", "productId") SELECT "id", "quantity", "subTotal", "orderId", "productId" FROM "order_item"`);
        await queryRunner.query(`DROP TABLE "order_item"`);
        await queryRunner.query(`ALTER TABLE "temporary_order_item" RENAME TO "order_item"`);
        await queryRunner.query(`CREATE TABLE "temporary_order" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "totalAmount" float NOT NULL, "status" varchar NOT NULL DEFAULT ('PLACED'), "paymentMethod" varchar NOT NULL, "location" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_order"("id", "totalAmount", "status", "paymentMethod", "location", "createdAt", "updatedAt", "userId") SELECT "id", "totalAmount", "status", "paymentMethod", "location", "createdAt", "updatedAt", "userId" FROM "order"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`ALTER TABLE "temporary_order" RENAME TO "order"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" RENAME TO "temporary_order"`);
        await queryRunner.query(`CREATE TABLE "order" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "totalAmount" float NOT NULL, "status" varchar NOT NULL DEFAULT ('PLACED'), "paymentMethod" varchar NOT NULL, "location" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer)`);
        await queryRunner.query(`INSERT INTO "order"("id", "totalAmount", "status", "paymentMethod", "location", "createdAt", "updatedAt", "userId") SELECT "id", "totalAmount", "status", "paymentMethod", "location", "createdAt", "updatedAt", "userId" FROM "temporary_order"`);
        await queryRunner.query(`DROP TABLE "temporary_order"`);
        await queryRunner.query(`ALTER TABLE "order_item" RENAME TO "temporary_order_item"`);
        await queryRunner.query(`CREATE TABLE "order_item" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "subTotal" decimal NOT NULL, "orderId" integer, "productId" integer, CONSTRAINT "UQ_7e383dc486afc7800bf87d1c11a" UNIQUE ("orderId", "productId"))`);
        await queryRunner.query(`INSERT INTO "order_item"("id", "quantity", "subTotal", "orderId", "productId") SELECT "id", "quantity", "subTotal", "orderId", "productId" FROM "temporary_order_item"`);
        await queryRunner.query(`DROP TABLE "temporary_order_item"`);
        await queryRunner.query(`ALTER TABLE "product" RENAME TO "temporary_product"`);
        await queryRunner.query(`CREATE TABLE "product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" varchar NOT NULL, "image" varchar NOT NULL, "brandName" varchar NOT NULL, "purchaseCount" integer DEFAULT (0), "price" integer NOT NULL, "originalPrice" integer, "stock" integer NOT NULL, "avgRating" decimal NOT NULL DEFAULT (0), "offer" integer, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "deleteAt" datetime, "isActive" boolean NOT NULL DEFAULT (1), "categoryId" integer NOT NULL, "subCategoryId" integer NOT NULL, "typeId" integer NOT NULL, "userId" integer)`);
        await queryRunner.query(`INSERT INTO "product"("id", "name", "description", "image", "brandName", "purchaseCount", "price", "originalPrice", "stock", "avgRating", "offer", "createdAt", "updatedAt", "deleteAt", "isActive", "categoryId", "subCategoryId", "typeId", "userId") SELECT "id", "name", "description", "image", "brandName", "purchaseCount", "price", "originalPrice", "stock", "avgRating", "offer", "createdAt", "updatedAt", "deleteAt", "isActive", "categoryId", "subCategoryId", "typeId", "userId" FROM "temporary_product"`);
        await queryRunner.query(`DROP TABLE "temporary_product"`);
        await queryRunner.query(`ALTER TABLE "category" RENAME TO "temporary_category"`);
        await queryRunner.query(`CREATE TABLE "category" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "typeId" integer NOT NULL, CONSTRAINT "UQ_7a153c7f24a4d3862bfc274bc50" UNIQUE ("name", "typeId"))`);
        await queryRunner.query(`INSERT INTO "category"("id", "name", "typeId") SELECT "id", "name", "typeId" FROM "temporary_category"`);
        await queryRunner.query(`DROP TABLE "temporary_category"`);
        await queryRunner.query(`ALTER TABLE "sub_category" RENAME TO "temporary_sub_category"`);
        await queryRunner.query(`CREATE TABLE "sub_category" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "categoryId" integer NOT NULL, CONSTRAINT "UQ_bb5ff711af320abd47e76579c00" UNIQUE ("name", "categoryId"))`);
        await queryRunner.query(`INSERT INTO "sub_category"("id", "name", "categoryId") SELECT "id", "name", "categoryId" FROM "temporary_sub_category"`);
        await queryRunner.query(`DROP TABLE "temporary_sub_category"`);
        await queryRunner.query(`ALTER TABLE "review" RENAME TO "temporary_review"`);
        await queryRunner.query(`CREATE TABLE "review" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "rating" integer NOT NULL, "comment" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "productId" integer, CONSTRAINT "UQ_711cb665a4d4f8421265d921319" UNIQUE ("userId", "productId"))`);
        await queryRunner.query(`INSERT INTO "review"("id", "rating", "comment", "createdAt", "userId", "productId") SELECT "id", "rating", "comment", "createdAt", "userId", "productId" FROM "temporary_review"`);
        await queryRunner.query(`DROP TABLE "temporary_review"`);
        await queryRunner.query(`ALTER TABLE "cart_item" RENAME TO "temporary_cart_item"`);
        await queryRunner.query(`CREATE TABLE "cart_item" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL, "cartId" integer, "productId" integer, CONSTRAINT "UQ_86ecfe066ef04fcf69bdbae722b" UNIQUE ("cartId", "productId"))`);
        await queryRunner.query(`INSERT INTO "cart_item"("id", "quantity", "cartId", "productId") SELECT "id", "quantity", "cartId", "productId" FROM "temporary_cart_item"`);
        await queryRunner.query(`DROP TABLE "temporary_cart_item"`);
        await queryRunner.query(`ALTER TABLE "cart" RENAME TO "temporary_cart"`);
        await queryRunner.query(`CREATE TABLE "cart" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer, CONSTRAINT "UQ_756f53ab9466eb52a52619ee019" UNIQUE ("userId"), CONSTRAINT "REL_756f53ab9466eb52a52619ee01" UNIQUE ("userId"))`);
        await queryRunner.query(`INSERT INTO "cart"("id", "userId") SELECT "id", "userId" FROM "temporary_cart"`);
        await queryRunner.query(`DROP TABLE "temporary_cart"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" RENAME TO "temporary_refresh_token"`);
        await queryRunner.query(`CREATE TABLE "refresh_token" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "sessionId" varchar NOT NULL, "token" varchar NOT NULL, "deviceName" varchar, "browser" varchar, "os" varchar, "userAgent" varchar, "ipAddress" varchar, "lastUsedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "expiresAt" datetime NOT NULL, "revokedAt" datetime, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "userId" integer, CONSTRAINT "UQ_4f310b2b1f45ec02710a7193611" UNIQUE ("sessionId"), CONSTRAINT "UQ_c31d0a2f38e6e99110df62ab0af" UNIQUE ("token"))`);
        await queryRunner.query(`INSERT INTO "refresh_token"("id", "sessionId", "token", "deviceName", "browser", "os", "userAgent", "ipAddress", "lastUsedAt", "expiresAt", "revokedAt", "createdAt", "userId") SELECT "id", "sessionId", "token", "deviceName", "browser", "os", "userAgent", "ipAddress", "lastUsedAt", "expiresAt", "revokedAt", "createdAt", "userId" FROM "temporary_refresh_token"`);
        await queryRunner.query(`DROP TABLE "temporary_refresh_token"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TABLE "order_item"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "category"`);
        await queryRunner.query(`DROP TABLE "type"`);
        await queryRunner.query(`DROP TABLE "sub_category"`);
        await queryRunner.query(`DROP TABLE "review"`);
        await queryRunner.query(`DROP TABLE "cart_item"`);
        await queryRunner.query(`DROP TABLE "cart"`);
        await queryRunner.query(`DROP TABLE "refresh_token"`);
    }

}
