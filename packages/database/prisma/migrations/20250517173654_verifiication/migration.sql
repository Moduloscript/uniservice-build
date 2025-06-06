-- AlterTable
ALTER TABLE "user" ADD COLUMN     "isStudentVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "studentIdCardUrl" TEXT;
