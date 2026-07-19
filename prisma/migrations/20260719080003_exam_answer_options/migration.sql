/*
  Warnings:

  - Added the required column `direction` to the `ExamAnswer` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ExamAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "wordId" TEXT,
    "order" INTEGER NOT NULL,
    "direction" TEXT NOT NULL,
    "termSnapshot" TEXT NOT NULL,
    "meaningSnapshot" TEXT NOT NULL,
    "optionsJson" TEXT,
    "userAnswer" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ExamAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "ExamAttempt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExamAnswer_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ExamAnswer" ("attemptId", "id", "isCorrect", "meaningSnapshot", "order", "termSnapshot", "userAnswer", "wordId") SELECT "attemptId", "id", "isCorrect", "meaningSnapshot", "order", "termSnapshot", "userAnswer", "wordId" FROM "ExamAnswer";
DROP TABLE "ExamAnswer";
ALTER TABLE "new_ExamAnswer" RENAME TO "ExamAnswer";
CREATE INDEX "ExamAnswer_attemptId_idx" ON "ExamAnswer"("attemptId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
