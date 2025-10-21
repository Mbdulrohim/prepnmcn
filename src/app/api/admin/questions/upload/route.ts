import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { Question, QuestionType } from "@/entities/Question";
import { Exam } from "@/entities/Exam";
import { s3Client, BUCKET_NAME } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as pdfParse from "pdf-parse";
import * as mammoth from "mammoth";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const examId = formData.get("examId") as string;

    if (!file || !examId) {
      return NextResponse.json(
        { success: false, error: "File and examId are required" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Only PDF, DOCX, and TXT files are allowed",
        },
        { status: 400 }
      );
    }

    const dataSource = await getDataSource();

    // Verify exam exists
    const exam = await dataSource.getRepository(Exam).findOne({
      where: { id: examId },
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found" },
        { status: 404 }
      );
    }

    // Upload file to S3
    const fileExtension = file.name.split(".").pop();
    const s3Key = `questions/${examId}/${Date.now()}-${file.name}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // Extract text from file
    let extractedText = "";
    try {
      if (file.type === "application/pdf") {
        const pdfData = await (pdfParse as any)(buffer);
        extractedText = pdfData.text;
        console.log("PDF extracted text length:", extractedText.length);
        console.log("First 200 chars:", extractedText.substring(0, 200));
      } else if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
        console.log("DOCX extracted text length:", extractedText.length);
        console.log("First 200 chars:", extractedText.substring(0, 200));
      } else if (file.type === "text/plain") {
        extractedText = buffer.toString("utf-8");
        console.log("TXT extracted text length:", extractedText.length);
        console.log("First 200 chars:", extractedText.substring(0, 200));
      }
      console.log("File type:", file.type);
      console.log(
        "First 200 chars of extracted text:",
        extractedText.substring(0, 200)
      );
    } catch (error) {
      console.error("Error extracting text:", error);
      extractedText = "Error extracting text from file";
    }

    // Parse questions from text (basic implementation)
    const parsedQuestions = parseQuestionsFromText(extractedText, examId);

    // Save questions to database
    const questionRepo = dataSource.getRepository(Question);
    const savedQuestions = await questionRepo.save(parsedQuestions);

    return NextResponse.json({
      success: true,
      data: {
        fileUrl: s3Key,
        extractedText: extractedText.substring(0, 500) + "...", // First 500 chars
        questionsParsed: savedQuestions.length,
        questions: savedQuestions,
      },
    });
  } catch (error) {
    console.error("Error uploading question file:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload and parse question file" },
      { status: 500 }
    );
  }
}

function parseQuestionsFromText(
  text: string,
  examId: string
): Partial<Question>[] {
  const questions: Partial<Question>[] = [];
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  console.log("Extracted text length:", text.length);

  let currentQuestion: Partial<Question> | null = null;
  let questionCounter = 1;
  let expectingQuestionText = false;

  for (const line of lines) {
    // Check for question start: "Question X:" format
    const questionMatch = line.match(/^Question\s+(\d+):?$/i);
    if (questionMatch) {
      // Save previous question if exists
      if (currentQuestion) {
        questions.push(currentQuestion);
      }

      // Start new question
      currentQuestion = {
        examId,
        question: "", // Will be filled by next line(s)
        type: QuestionType.MULTIPLE_CHOICE,
        marks: 1,
        order: questionCounter++,
        isActive: true,
        options: [],
      };
      expectingQuestionText = true;
    } else if (
      expectingQuestionText &&
      line &&
      !line.match(/^[a-d][\)\.\s]/i) &&
      !line.match(/^\([a-d]\)/i)
    ) {
      // This should be part of the question text (could be multi-line)
      if (currentQuestion) {
        if (currentQuestion.question) {
          // Append to existing question text
          currentQuestion.question += " " + line;
        } else {
          // First line of question text
          currentQuestion.question = line;
        }
      }
    } else if (
      currentQuestion &&
      (line.match(/^[a-d][\)\.\s]/i) || line.match(/^\([a-d]\)/i))
    ) {
      // Stop expecting question text since we're now in options
      expectingQuestionText = false;

      // More flexible option matching
      const optionMatch = line.match(
        /^[\(\s]*([a-d])[\)\.\s]+(.+?)(\s*\*\*|\s*\(correct\)|\s*\[correct\])?$/i
      );
      if (optionMatch) {
        const [, optionLetter, optionText, isCorrect] = optionMatch;

        if (!currentQuestion.options) currentQuestion.options = [];
        currentQuestion.options.push(optionText.trim());

        // If this option is marked as correct
        if (isCorrect) {
          currentQuestion.correctAnswer = optionText.trim();
        }
      }
    }
  }

  // Save last question
  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  return questions;
}
