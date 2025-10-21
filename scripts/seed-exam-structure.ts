// Exam seeding script for initial data
import "dotenv/config";
import { getDataSource } from "../src/lib/database";
import { ExamCategory, ExamCategoryType } from "../src/entities/ExamCategory";
import { ExamPathway, ExamPathwayType } from "../src/entities/ExamPathway";
import {
  ExamPackage,
  ExamPackageType,
  ExamFrequency,
} from "../src/entities/ExamPackage";

export async function seedExamStructure() {
  const dataSource = await getDataSource();
  const categoryRepo = dataSource.getRepository(ExamCategory);
  const pathwayRepo = dataSource.getRepository(ExamPathway);
  const packageRepo = dataSource.getRepository(ExamPackage);

  // 1. Create Categories
  const pathwaysCategory = await categoryRepo.save({
    name: "Nursing Pathways",
    type: ExamCategoryType.PATHWAYS,
    description: "Professional nursing certification pathways",
    isActive: true,
  });

  const researchCategory = await categoryRepo.save({
    name: "Research Services",
    type: ExamCategoryType.RESEARCH,
    description: "Research assistance and consultation",
    isActive: true,
  });

  const olevelJambCategory = await categoryRepo.save({
    name: "O'Level & JAMB",
    type: ExamCategoryType.OLEVEL_JAMB,
    description: "Secondary education examinations",
    isActive: true,
  });

  // 2. Create Pathways
  const rnPathway = await pathwayRepo.save({
    name: "RN Pathway",
    type: ExamPathwayType.RN,
    description: "Registered Nurse certification pathway",
    categoryId: pathwaysCategory.id,
    isActive: true,
  });

  const undergraduatePathway = await pathwayRepo.save({
    name: "Undergraduate Section",
    type: ExamPathwayType.UNDERGRADUATE,
    description: "University undergraduate nursing programs",
    categoryId: pathwaysCategory.id,
    isActive: true,
  });

  // 3. Create Packages
  await packageRepo.save({
    name: "RN Monthly Subscription",
    description: "Monthly access to RN pathway assessments",
    pathwayId: rnPathway.id,
    packageType: ExamPackageType.MONTHLY_SUBSCRIPTION,
    frequency: ExamFrequency.MONTHLY,
    price: 1500,
    currency: "NGN",
    isActive: true,
  });

  await packageRepo.save({
    name: "Undergraduate 100L Monthly",
    description: "100 Level undergraduate monthly subscription",
    pathwayId: undergraduatePathway.id,
    packageType: ExamPackageType.MONTHLY_SUBSCRIPTION,
    frequency: ExamFrequency.MONTHLY,
    price: 1000,
    currency: "NGN",
    isActive: true,
  });

  console.log("Exam structure seeded successfully!");
}

seedExamStructure().catch(console.error);
