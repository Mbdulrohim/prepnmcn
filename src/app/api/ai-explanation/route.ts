import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json(
        {
          error: "AI explanation service is not configured",
          details:
            "Please add your OpenAI API key to the environment variables to enable AI explanations.",
        },
        { status: 503 }
      );
    }

    const { question, options, correctAnswer, userAnswer, isCorrect } =
      await request.json();

    // Build the prompt based on whether the user was correct or not
    const prompt = isCorrect
      ? `You are a helpful medical exam tutor. A student answered this question correctly, but wants to deepen their understanding.

Question: ${question}

Options:
${options
  .map((opt: string, idx: number) => `${String.fromCharCode(65 + idx)}. ${opt}`)
  .join("\n")}

Correct Answer: ${String.fromCharCode(65 + correctAnswer)}. ${
          options[correctAnswer]
        }

Please provide a clear, concise explanation that:
1. Confirms why their answer is correct
2. Explains the key concept being tested
3. Provides additional context to reinforce their understanding
4. Is written in a friendly, encouraging tone

IMPORTANT: Keep your explanation under 200 words. Use simple language. Do NOT use markdown formatting (no **, *, #, etc). Write in plain text only.`
      : `You are a helpful medical exam tutor. A student got this question wrong and needs help understanding the correct answer.

Question: ${question}

Options:
${options
  .map((opt: string, idx: number) => `${String.fromCharCode(65 + idx)}. ${opt}`)
  .join("\n")}

Their Answer: ${
          userAnswer !== undefined
            ? `${String.fromCharCode(65 + userAnswer)}. ${options[userAnswer]}`
            : "Not answered"
        }
Correct Answer: ${String.fromCharCode(65 + correctAnswer)}. ${
          options[correctAnswer]
        }

Please provide a clear, helpful explanation that:
1. Explains why their answer was incorrect (if they answered)
2. Clearly explains why the correct answer is right
3. Addresses common misconceptions
4. Helps them understand the underlying concept
5. Is written in a supportive, educational tone

IMPORTANT: Keep your explanation under 200 words. Use simple language. Do NOT use markdown formatting (no **, *, #, etc). Write in plain text only.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert medical educator who provides clear, concise explanations for exam questions. Always be encouraging and focus on helping students learn.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    let explanation =
      completion.choices[0]?.message?.content || "No explanation generated.";

    // Check if explanation is too long and truncate if necessary
    const wordCount = explanation.split(/\s+/).length;
    let truncated = false;

    if (wordCount > 200) {
      const words = explanation.split(/\s+/);
      explanation = words.slice(0, 200).join(" ") + "...";
      truncated = true;
      console.warn(`AI explanation exceeded word limit: ${wordCount} words`);
    }

    return NextResponse.json({
      explanation,
      truncated,
      wordCount: truncated ? 350 : wordCount,
    });
  } catch (error: any) {
    console.error("AI explanation error:", error);

    // Handle specific OpenAI errors
    if (error.code === "insufficient_quota") {
      return NextResponse.json(
        {
          error: "OpenAI quota exceeded",
          details:
            "The AI service has reached its usage limit. Please try again later.",
        },
        { status: 503 }
      );
    }

    if (error.code === "invalid_api_key") {
      return NextResponse.json(
        {
          error: "Invalid API key",
          details:
            "The OpenAI API key is invalid. Please check your configuration.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to generate explanation",
        details: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
