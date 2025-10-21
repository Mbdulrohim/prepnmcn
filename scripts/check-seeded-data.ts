// Check seeded exam data
import "dotenv/config";
import { getDataSource } from "../src/lib/database";
import { ExamCategory } from "../src/entities/ExamCategory";
import { ExamPathway } from "../src/entities/ExamPathway";
import { ExamPackage } from "../src/entities/ExamPackage";
import { Exam } from "../src/entities/Exam";

async function checkSeededData() {
  try {
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    const dataSource = await getDataSource();
    console.log("Checking seeded exam data...");

    const categories = await dataSource.getRepository(ExamCategory).find({
      relations: ["pathways"],
    });
    console.log(`Found ${categories.length} exam categories:`);
    categories.forEach((cat) => {
      console.log(
        `- ${cat.name} (${cat.type}): ${cat.pathways?.length || 0} pathways`
      );
    });

    const pathways = await dataSource.getRepository(ExamPathway).find({
      relations: ["packages"],
    });
    console.log(`\nFound ${pathways.length} exam pathways:`);
    pathways.forEach((path) => {
      console.log(
        `- ${path.name} (${path.type}): ${path.packages?.length || 0} packages`
      );
    });

    const packages = await dataSource.getRepository(ExamPackage).find();
    console.log(`\nFound ${packages.length} exam packages:`);
    packages.forEach((pkg: ExamPackage) => {
      console.log(
        `- ${pkg.name} (${pkg.packageType}): ₦${pkg.price} - ${pkg.frequency}`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("Error checking seeded data:", error);
    process.exit(1);
  }
}

checkSeededData();
