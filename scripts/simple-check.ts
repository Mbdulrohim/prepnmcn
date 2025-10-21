// Simple query to check if exam data exists
import "dotenv/config";
import { getDataSource } from "../src/lib/database";

async function checkData() {
  try {
    const dataSource = await getDataSource();
    console.log("Connected to database successfully");

    // Check if tables exist and have data
    const categoryCount = await dataSource.query(
      "SELECT COUNT(*) FROM exam_categories"
    );
    const pathwayCount = await dataSource.query(
      "SELECT COUNT(*) FROM exam_pathways"
    );
    const packageCount = await dataSource.query(
      "SELECT COUNT(*) FROM exam_packages"
    );

    console.log(`Exam Categories: ${categoryCount[0].count}`);
    console.log(`Exam Pathways: ${pathwayCount[0].count}`);
    console.log(`Exam Packages: ${packageCount[0].count}`);

    if (parseInt(categoryCount[0].count) > 0) {
      const categories = await dataSource.query(
        "SELECT name, type FROM exam_categories"
      );
      console.log("Categories:", categories);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkData();
