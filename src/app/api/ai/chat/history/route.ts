import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { ChatMessage, MessageRole } from "@/entities/ChatMessage";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      console.log("GET /api/ai/chat/history: No authenticated user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("GET /api/ai/chat/history: Loading for user", session.user!.id);

    const dataSource = await getDataSource();
    const chatMessageRepository = dataSource.getRepository(ChatMessage);

    // Get chat history for the user (last 50 messages)
    const messages = await chatMessageRepository.find({
      where: { userId: session.user!.id },
      order: { createdAt: "ASC" },
      take: 50,
    });

    console.log(
      "GET /api/ai/chat/history: Found",
      messages.length,
      "messages for user",
      session.user!.id
    );

    return NextResponse.json({
      messages: messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt,
      })),
    });
  } catch (error) {
    console.error("Chat history fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      console.log("POST /api/ai/chat/history: No authenticated user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      console.log("POST /api/ai/chat/history: Invalid messages format");
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    console.log(
      "POST /api/ai/chat/history: Saving",
      messages.length,
      "messages for user",
      session.user!.id
    );

    const dataSource = await getDataSource();
    const chatMessageRepository = dataSource.getRepository(ChatMessage);

    // Save messages to database
    const messageEntities = messages.map((msg: any) => ({
      userId: session.user!.id,
      role: msg.role,
      content: msg.content,
      metadata: msg.metadata || {},
    }));

    const savedMessages = await chatMessageRepository.save(messageEntities);
    console.log(
      "POST /api/ai/chat/history: Successfully saved",
      savedMessages.length,
      "messages"
    );

    return NextResponse.json({
      success: true,
      message: "Chat history saved",
    });
  } catch (error) {
    console.error("Chat history save error:", error);
    return NextResponse.json(
      { error: "Failed to save chat history" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dataSource = await getDataSource();
    const chatMessageRepository = dataSource.getRepository(ChatMessage);

    // Delete all chat messages for the user
    await chatMessageRepository.delete({ userId: session.user.id });

    return NextResponse.json({
      success: true,
      message: "Chat history cleared",
    });
  } catch (error) {
    console.error("Chat history delete error:", error);
    return NextResponse.json(
      { error: "Failed to clear chat history" },
      { status: 500 }
    );
  }
}
