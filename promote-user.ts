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

    await AppDataSource.destroy();
  } catch (error) {
    console.error("Error listing users:", error);
  }
}

async function promoteUserToSuperAdmin(email: string) {
  try {
    const AppDataSource = await getDataSource();
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      return;
    }

    user.role = "super_admin";
    await userRepo.save(user);

    await AppDataSource.destroy();
  } catch (error) {}
}

// Check command line arguments
const command = process.argv[2];
const email = process.argv[3];

if (command === "list") {
  listUsers();
} else if (command === "promote" && email) {
  promoteUserToSuperAdmin(email);
} else {

}
