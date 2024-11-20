/*
  Warnings:

  - You are about to drop the column `config` on the `WorkflowTrigger` table. All the data in the column will be lost.
  - Added the required column `description` to the `WorkflowTrigger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `runImmediately` to the `WorkflowTrigger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `triggerName` to the `WorkflowTrigger` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkflowTrigger" DROP COLUMN "config",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "runImmediately" BOOLEAN NOT NULL,
ADD COLUMN     "triggerName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Workflows" ADD COLUMN     "conditionTemplates" JSONB;

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_workflowId_name_key" ON "EmailTemplate"("workflowId", "name");

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
