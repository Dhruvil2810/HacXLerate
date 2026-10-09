import { prisma } from '../config/db.js';
import { AppError } from '../utils/response.util.js';
import { CreateConversationInput, SendMessageInput } from '../validators/message.validator.js';

export async function getUserConversations(userId: string) {
  const participations = await prisma.conversationParticipant.findMany({
    where: { userId },
    include: {
      conversation: {
        include: {
          campaign: {
            select: { id: true, title: true },
          },
          participants: {
            include: {
              user: {
                select: { id: true, name: true, avatarUrl: true, email: true },
              },
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
    orderBy: { conversation: { updatedAt: 'desc' } },
  });

  return participations.map((p) => ({
    conversationId: p.conversationId,
    campaign: p.conversation.campaign,
    participants: p.conversation.participants.map((part) => part.user),
    lastMessage: p.conversation.messages[0] || null,
    lastReadAt: p.lastReadAt,
    updatedAt: p.conversation.updatedAt,
  }));
}

export async function getConversationMessages(userId: string, conversationId: string) {
  const isParticipant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });

  if (!isParticipant) {
    throw new AppError('Conversation not found or unauthorized', 404, 'NOT_FOUND');
  }

  // Update last read timestamp
  await prisma.conversationParticipant.update({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
    data: { lastReadAt: new Date() },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return messages;
}

export async function startConversation(userId: string, input: CreateConversationInput) {
  // Check if conversation already exists between these users (optionally for campaign)
  const existing = await prisma.conversation.findFirst({
    where: {
      campaignId: input.campaignId || null,
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: input.recipientUserId } } },
      ],
    },
    include: {
      messages: true,
      participants: true,
    },
  });

  if (existing) {
    // Add new message to existing conversation
    const message = await prisma.message.create({
      data: {
        conversationId: existing.id,
        senderId: userId,
        content: input.initialMessage,
      },
    });

    await prisma.conversation.update({
      where: { id: existing.id },
      data: { updatedAt: new Date() },
    });

    return { conversationId: existing.id, message };
  }

  // Create new conversation with both participants and initial message
  const conversation = await prisma.$transaction(async (tx) => {
    const newConv = await tx.conversation.create({
      data: {
        campaignId: input.campaignId || null,
        participants: {
          create: [
            { userId, lastReadAt: new Date() },
            { userId: input.recipientUserId },
          ],
        },
      },
    });

    const msg = await tx.message.create({
      data: {
        conversationId: newConv.id,
        senderId: userId,
        content: input.initialMessage,
      },
    });

    return { conversationId: newConv.id, message: msg };
  });

  return conversation;
}

export async function sendMessage(userId: string, conversationId: string, input: SendMessageInput) {
  const isParticipant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });

  if (!isParticipant) {
    throw new AppError('Conversation not found or unauthorized', 404, 'NOT_FOUND');
  }

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: input.content,
        attachments: input.attachments || [],
      },
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
    prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: { lastReadAt: new Date() },
    }),
  ]);

  return message;
}
