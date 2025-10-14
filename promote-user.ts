import { getDataSource } from "./src/lib/database.js";
import { User } from "./src/entities/User.js";

async function listUsers() {
  try {
    const AppDataSource = await getDataSource();
    const userRepo = AppDataSource.getRepository(User);

    const users = await userRepo.find({
      select: ["id", "email", "name", "role"],
      order: { createdAt: "DESC" },
    });

    console.log("Current users:");
    users.forEach((user) => {
      console.log(`  ${user.email} - ${user.role} (${user.name})`);
    });

    await AppDataSource.destroy();
  } catch (error) {
    console.error("Error listing users:", error);
  }
}

async function promoteUserToSuperAdmin(email: string) {
  try {
    console.log(`Promoting user ${email} to super_admin...`);

    const AppDataSource = await getDataSource();
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      console.log("User not found");
      return;
    }

    console.log(`Current role: ${user.role}`);
    user.role = "super_admin";
    await userRepo.save(user);
    console.log(`✅ User ${email} promoted to super_admin successfully!`);

    await AppDataSource.destroy();
  } catch (error) {
    console.error("Error promoting user:", error);
  }
}

// Check command line arguments
const command = process.argv[2];
const email = process.argv[3];

if (command === "list") {
  listUsers();
} else if (command === "promote" && email) {
  promoteUserToSuperAdmin(email);
} else {
  console.log("Usage:");
  console.log("  npx tsx promote-user.ts list");
  console.log("  npx tsx promote-user.ts promote <email>");
}
