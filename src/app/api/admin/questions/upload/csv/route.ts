import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { Question, QuestionType } from "@/entities/Question";
import { Exam } from "@/entities/Exam";
import csv from "csv-parser";
import * as XLSX from "xlsx";
import { Readable } from "stream";

interface CSVQuestion {
  question: string;
  type:
    | "multiple_choice"
    | "true_false"
    | "short_answer"
    | "essay"
    | "fill_blanks";
  options?: string;
  correct_answer: string;
  explanation?: string;
  points?: string;
  order?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const examId = formData.get("examId") as string;

    if (!file || !examId) {
      return NextResponse.json(
        { error: "File and examId are required" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only CSV and Excel files are allowed." },
        { status: 400 }
      );
    }

    // Get database connection
    const dataSource = await getDataSource();
    const examRepository = dataSource.getRepository(Exam);
    const questionRepository = dataSource.getRepository(Question);

    // Verify exam exists
    const exam = await examRepository.findOne({ where: { id: examId } });
    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Get current max order for the exam
    const maxOrderResult = await questionRepository
      .createQueryBuilder("question")
      .select("MAX(question.order)", "maxOrder")
      .where("question.examId = :examId", { examId })
      .getRawOne();

    let currentOrder = (maxOrderResult?.maxOrder || 0) + 1;

    const questions: Partial<Question>[] = [];

    if (file.type === "text/csv") {
      // Process CSV file
      const buffer = await file.arrayBuffer();
      const stream = Readable.from(Buffer.from(buffer));

      await new Promise<void>((resolve, reject) => {
        stream
          .pipe(csv())
          .on("data", (row: CSVQuestion) => {
            try {
              const question = parseQuestionRow(row, examId, currentOrder++);
              if (question) questions.push(question);
            } catch (error) {
              console.error("Error parsing CSV row:", error);
            }
          })
          .on("end", () => resolve())
          .on("error", reject);
      });
    } else {
      // Process Excel file
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as CSVQuestion[];

      for (const row of jsonData) {
        try {
          const question = parseQuestionRow(row, examId, currentOrder++);
          if (question) questions.push(question);
        } catch (error) {
          console.error("Error parsing Excel row:", error);
        }
      }
    }

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "No valid questions found in the file" },
        { status: 400 }
      );
    }

    // Save questions to database
    const savedQuestions = await questionRepository.save(questions);

    return NextResponse.json({
      message: `Successfully uploaded ${savedQuestions.length} questions`,
      questions: savedQuestions,
    });
  } catch (error) {
    console.error("Error uploading questions:", error);
    return NextResponse.json(
      { error: "Failed to upload questions" },
      { status: 500 }
    );
  }
}

function parseQuestionRow(
  row: CSVQuestion,
  examId: string,
  order: number
): Partial<Question> | null {
  if (!row.question || !row.type || !row.correct_answer) {
    throw new Error("Missing required fields: question, type, correct_answer");
  }

  // Map string type to QuestionType enum
  const typeMapping: Record<string, QuestionType> = {
    multiple_choice: QuestionType.MULTIPLE_CHOICE,
    true_false: QuestionType.TRUE_FALSE,
    short_answer: QuestionType.SHORT_ANSWER,
    essay: QuestionType.ESSAY,
    fill_blanks: QuestionType.FILL_BLANKS,
  };

  const questionType = typeMapping[row.type];
  if (!questionType) {
    throw new Error(`Invalid question type: ${row.type}`);
  }

  const question: Partial<Question> = {
    examId,
    question: row.question.trim(),
    type: questionType,
    correctAnswer: row.correct_answer.trim(),
    explanation: row.explanation?.trim(),
    marks: row.points ? parseInt(row.points) : 1,
    order: row.order ? parseInt(row.order) : order,
  };

  // Parse options for multiple choice questions
  if (questionType === QuestionType.MULTIPLE_CHOICE && row.options) {
    try {
      question.options = JSON.parse(row.options);
    } catch {
      // If not JSON, treat as comma-separated string
      question.options = row.options.split(",").map((opt) => opt.trim());
    }
  }

  return question;
}
