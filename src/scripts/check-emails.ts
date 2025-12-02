import { getDataSource } from "@/lib/database";
import { Email } from "@/entities/Email";

async function checkEmails() {
  try {
    const dataSource = await getDataSource();
    const emailRepo = dataSource.getRepository(Email);

    const count = await emailRepo.count();
    console.log(`\nTotal Emails in DB: ${count}`);

    if (count > 0) {
      const emails = await emailRepo.find({
        order: { receivedAt: "DESC" },
        take: 5,
      });

      console.log("\nRecent Emails:");
      emails.forEach((email) => {
        console.log("------------------------------------------------");
        console.log(`ID: ${email.id}`);
        console.log(`From: ${email.from}`);
        console.log(`Subject: ${email.subject}`);
        console.log(`Received: ${email.receivedAt}`);
        console.log(`Folder: ${email.folder}`);
      });
      console.log("------------------------------------------------");
    } else {
      console.log("No emails found yet.");
    }
  } catch (error) {
    console.error("Error checking emails:", error);
  } finally {
    process.exit(0);
  }
}

checkEmails();
