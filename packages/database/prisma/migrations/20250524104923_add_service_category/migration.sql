/*
  Warnings:

  - You are about to drop the column `category` on the `service` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `service` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "service_category_idx";

-- AlterTable
ALTER TABLE "service" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_name_key" ON "ServiceCategory"("name");

-- CreateIndex
CREATE INDEX "service_categoryId_idx" ON "service"("categoryId");

-- AddForeignKey
ALTER TABLE "service" ADD CONSTRAINT "service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
