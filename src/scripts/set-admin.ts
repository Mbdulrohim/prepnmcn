import { getDataSource } from "../lib/database";
// import { User } from "../entities/User";

const setEmailAsAdmin = async (email: string) => {
  let AppDataSource: any;
  try {
    const { getDataSource } = await import("../lib/database");
    AppDataSource = await getDataSource();
    const { User } = await import("../entities/User");

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });

    if (user) {
      user.role = "admin";
      await userRepo.save(user);
      console.log(`User with email ${email} has been updated to admin.`);
    } else {
      console.log(`User with email ${email} not found.`);
    }
  } catch (error) {
    console.error("Error setting admin:", error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
};

const email = process.argv[2];
if (!email) {
  console.error("Please provide an email address.");
  process.exit(1);
}

setEmailAsAdmin(email);
