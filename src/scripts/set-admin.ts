const { AppDataSource } = require('../lib/database');
const { User } = require('../entities/User');

const setEmailAsAdmin = async (email: string) => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });

    if (user) {
      user.role = 'admin';
      await userRepo.save(user);
      console.log(`User with email ${email} has been updated to admin.`);
    } else {
      console.log(`User with email ${email} not found.`);
    }
  } catch (error) {
    console.error('Error setting admin:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
};

const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address.');
  process.exit(1);
}

setEmailAsAdmin(email);
