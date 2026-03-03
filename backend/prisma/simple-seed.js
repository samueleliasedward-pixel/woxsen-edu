import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with test users...");

  // Hash passwords
  const adminPassword = await bcrypt.hash("admin123", 10);
  const studentPassword = await bcrypt.hash("student123", 10);
  const facultyPassword = await bcrypt.hash("faculty123", 10);

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@woxsen.edu",
      password: adminPassword,
      name: "System Administrator",
      role: "ADMIN",
      isActive: true,
      emailVerified: true,
      adminProfile: {
        create: {
          employeeId: "ADM001",
          department: "Administration",
          role: "Super Admin"
        }
      }
    }
  });
  console.log("✅ Admin created:", admin.email);

  // Create Faculty
  const faculty = await prisma.user.create({
    data: {
      email: "faculty@woxsen.edu",
      password: facultyPassword,
      name: "Dr. Sanjay Reddy",
      role: "FACULTY",
      isActive: true,
      emailVerified: true,
      facultyProfile: {
        create: {
          employeeId: "FAC001",
          designation: "Professor",
          department: "Computer Science",
          qualification: "Ph.D. in Machine Learning",
          specialization: ["Machine Learning", "Deep Learning"],
          joinDate: new Date(),
          officeHours: {
            Monday: "10:00-12:00",
            Wednesday: "14:00-16:00"
          },
          cabin: "CS-405"
        }
      }
    }
  });
  console.log("✅ Faculty created:", faculty.email);

  // Create Student
  const student = await prisma.user.create({
    data: {
      email: "student@woxsen.edu",
      password: studentPassword,
      name: "Rajesh Kumar",
      role: "STUDENT",
      isActive: true,
      emailVerified: true,
      studentProfile: {
        create: {
          studentId: "WXU2026001",
          program: "B.Tech CSE",
          department: "Computer Science",
          year: 3,
          semester: 6,
          batch: "2023-2027",
          cgpa: 8.7,
          totalCredits: 120,
          attendance: 92.5,
          dateOfBirth: new Date("2004-05-15"),
          address: "Hyderabad, Telangana",
          emergencyContact: {
            name: "Suresh Kumar",
            relation: "Father",
            phone: "+91 9876543210"
          }
        }
      }
    }
  });
  console.log("✅ Student created:", student.email);

  console.log("\n📊 Login Credentials:");
  console.log("====================");
  console.log("Admin:   admin@woxsen.edu / admin123");
  console.log("Faculty: faculty@woxsen.edu / faculty123");
  console.log("Student: student@woxsen.edu / student123");
  console.log("\n✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
