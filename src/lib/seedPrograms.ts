import { DataSource } from "typeorm";
import { Program, ProgramCode } from "../entities/Program";

const DEFAULT_PROGRAMS = [
  {
    code: ProgramCode.RM,
    name: "Registered Midwife (RM)",
    description:
      "Professional certification program for Registered Midwives. Access exam preparation materials, practice tests, and resources.",
    price: 15000,
    durationMonths: 12,
    metadata: {
      features: [
        "Practice Exams",
        "Downloadable Resources",
        "Shareable Assessments",
        "Progress Tracking",
      ],
      icon: "Baby",
      color: "#E91E63",
      displayOrder: 1,
    },
  },
  {
    code: ProgramCode.RN,
    name: "Registered Nurse (RN)",
    description:
      "Professional certification program for Registered Nurses. Access exam preparation materials, practice tests, and resources.",
    price: 15000,
    durationMonths: 12,
    metadata: {
      features: [
        "Practice Exams",
        "Downloadable Resources",
        "Shareable Assessments",
        "Progress Tracking",
      ],
      icon: "Stethoscope",
      color: "#2196F3",
      displayOrder: 2,
    },
  },
  {
    code: ProgramCode.RPHN,
    name: "Registered Public Health Nurse (RPHN)",
    description:
      "Professional certification program for Registered Public Health Nurses. Access exam preparation materials, practice tests, and resources.",
    price: 15000,
    durationMonths: 12,
    metadata: {
      features: [
        "Practice Exams",
        "Downloadable Resources",
        "Shareable Assessments",
        "Progress Tracking",
      ],
      icon: "HeartPulse",
      color: "#4CAF50",
      displayOrder: 3,
    },
  },
  {
    code: ProgramCode.SPECIALTY,
    name: "Specialty Program",
    description:
      "Specialty Program for medical students. Includes premium resources, shareable exams, and comprehensive exam preparation for specialty certifications.",
    price: 20000,
    durationMonths: 12,
    metadata: {
      features: [
        "Practice Exams",
        "Downloadable Resources",
        "Shareable Assessments",
        "Progress Tracking",
        "Specialty Certifications",
      ],
      icon: "GraduationCap",
      color: "#9C27B0",
      displayOrder: 4,
    },
  },
];

/**
 * Seeds the default programs (RM, RN, RPHN, SPECIALTY) into the database.
 * Skips programs that already exist. Safe to run multiple times.
 */
export async function seedDefaultPrograms(
  dataSource: DataSource,
): Promise<void> {
  const programRepo = dataSource.getRepository(Program);

  for (const programData of DEFAULT_PROGRAMS) {
    const existing = await programRepo.findOne({
      where: { code: programData.code },
    });

    if (!existing) {
      const program = programRepo.create(programData);
      await programRepo.save(program);
      console.log(`[seedPrograms] Created program: ${programData.name}`);
    }
  }
}
