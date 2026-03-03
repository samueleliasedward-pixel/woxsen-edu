/*
  Warnings:

  - You are about to drop the column `attachments` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `facultyId` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `rubric` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `weightage` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `attendance_records` table. All the data in the column will be lost.
  - You are about to drop the column `markedBy` on the `attendance_records` table. All the data in the column will be lost.
  - You are about to drop the column `remarks` on the `attendance_records` table. All the data in the column will be lost.
  - You are about to drop the column `capacity` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `enrolled` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `materials` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `room` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `schedule` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `syllabus` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `taughtById` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `enrollments` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `enrollments` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `instructions` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `passingMarks` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `room` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `syllabus` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `feedback` on the `grades` table. All the data in the column will be lost.
  - You are about to drop the column `gradedAt` on the `grades` table. All the data in the column will be lost.
  - You are about to drop the column `gradedBy` on the `grades` table. All the data in the column will be lost.
  - You are about to drop the column `letterGrade` on the `grades` table. All the data in the column will be lost.
  - You are about to drop the column `maxScore` on the `grades` table. All the data in the column will be lost.
  - You are about to drop the column `percentage` on the `grades` table. All the data in the column will be lost.
  - You are about to drop the column `submissionId` on the `grades` table. All the data in the column will be lost.
  - You are about to drop the `_FacultyCourses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `activity_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chat_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exam_results` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `refresh_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `submissions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[studentId,courseId,date]` on the table `attendance_records` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `status` on the `attendance_records` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `assignmentId` to the `grades` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_FacultyCourses" DROP CONSTRAINT "_FacultyCourses_A_fkey";

-- DropForeignKey
ALTER TABLE "_FacultyCourses" DROP CONSTRAINT "_FacultyCourses_B_fkey";

-- DropForeignKey
ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_courseId_fkey";

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_facultyId_fkey";

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_studentId_fkey";

-- DropForeignKey
ALTER TABLE "attendance_records" DROP CONSTRAINT "attendance_records_courseId_fkey";

-- DropForeignKey
ALTER TABLE "attendance_records" DROP CONSTRAINT "attendance_records_studentId_fkey";

-- DropForeignKey
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_userId_fkey";

-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_createdById_fkey";

-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_taughtById_fkey";

-- DropForeignKey
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_courseId_fkey";

-- DropForeignKey
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_studentId_fkey";

-- DropForeignKey
ALTER TABLE "exam_results" DROP CONSTRAINT "exam_results_examId_fkey";

-- DropForeignKey
ALTER TABLE "exam_results" DROP CONSTRAINT "exam_results_studentId_fkey";

-- DropForeignKey
ALTER TABLE "exams" DROP CONSTRAINT "exams_courseId_fkey";

-- DropForeignKey
ALTER TABLE "grades" DROP CONSTRAINT "grades_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_userId_fkey";

-- DropForeignKey
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_studentId_fkey";

-- DropIndex
DROP INDEX "attendance_records_courseId_studentId_date_key";

-- DropIndex
DROP INDEX "grades_submissionId_key";

-- AlterTable
ALTER TABLE "admin_profiles" ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "assignments" DROP COLUMN "attachments",
DROP COLUMN "facultyId",
DROP COLUMN "rubric",
DROP COLUMN "status",
DROP COLUMN "studentId",
DROP COLUMN "weightage";

-- AlterTable
ALTER TABLE "attendance_records" DROP COLUMN "createdAt",
DROP COLUMN "markedBy",
DROP COLUMN "remarks",
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "capacity",
DROP COLUMN "createdById",
DROP COLUMN "duration",
DROP COLUMN "endDate",
DROP COLUMN "enrolled",
DROP COLUMN "materials",
DROP COLUMN "room",
DROP COLUMN "schedule",
DROP COLUMN "startDate",
DROP COLUMN "status",
DROP COLUMN "syllabus",
DROP COLUMN "taughtById",
ADD COLUMN     "facultyId" TEXT;

-- AlterTable
ALTER TABLE "enrollments" DROP COLUMN "completedAt",
DROP COLUMN "status";

-- AlterTable
ALTER TABLE "exams" DROP COLUMN "duration",
DROP COLUMN "instructions",
DROP COLUMN "passingMarks",
DROP COLUMN "room",
DROP COLUMN "syllabus",
DROP COLUMN "type";

-- AlterTable
ALTER TABLE "faculty_profiles" ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "grades" DROP COLUMN "feedback",
DROP COLUMN "gradedAt",
DROP COLUMN "gradedBy",
DROP COLUMN "letterGrade",
DROP COLUMN "maxScore",
DROP COLUMN "percentage",
DROP COLUMN "submissionId",
ADD COLUMN     "assignmentId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN     "phone" TEXT;

-- DropTable
DROP TABLE "_FacultyCourses";

-- DropTable
DROP TABLE "activity_logs";

-- DropTable
DROP TABLE "chat_messages";

-- DropTable
DROP TABLE "exam_results";

-- DropTable
DROP TABLE "notifications";

-- DropTable
DROP TABLE "refresh_tokens";

-- DropTable
DROP TABLE "submissions";

-- DropEnum
DROP TYPE "AssignmentStatus";

-- DropEnum
DROP TYPE "AttendanceStatus";

-- DropEnum
DROP TYPE "CourseStatus";

-- DropEnum
DROP TYPE "EnrollmentStatus";

-- DropEnum
DROP TYPE "ExamType";

-- DropEnum
DROP TYPE "NotificationType";

-- DropEnum
DROP TYPE "SubmissionStatus";

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_studentId_courseId_date_key" ON "attendance_records"("studentId", "courseId", "date");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
