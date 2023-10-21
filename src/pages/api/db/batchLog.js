import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async (req, res) => {
    console.log("Received body:", req.body);
    const sessionId = req.body.sessionId;
    const logMessages = req.body.logs; // Assuming logs is an array of log messages
  
    // Prepare data for batch insertion first
    const batchData = logMessages.map(log => ({
      content: log.logMessage,
      role: 'log',
      time: new Date(log.logAt),
      SessionId: sessionId
    }));
  
    if (req.method === 'POST') {
      try {
        // Upsert ChatSession - update if exists, create if not
        await prisma.Session.upsert({
          where: { id: sessionId },
          update: {},  // No updates, just a create-or-noop operation
          create: { id: sessionId },
        });
  
        // Create all messages in a batch
        await prisma.message.createMany({
          data: batchData
        });
  
        res.status(200).json({ success: true });
      } catch (error) {
        console.error("DB Error:", error);
        res.status(500).json({ error: 'Database Operation Failed', details: error.message });
      } finally {
        await prisma.$disconnect();
      }
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  };
  