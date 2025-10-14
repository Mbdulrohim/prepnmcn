import { getDataSource } from "@/lib/database";
import { User } from "@/entities/User";
import { AutomationRule } from "@/entities/AutomationRule";
import { sendEmail } from "@/lib/email";

export class NotificationAutomation {
  static async addRule(
    rule: Omit<AutomationRule, "id" | "createdAt" | "updatedAt">
  ) {
    const AppDataSource = await getDataSource();
    const ruleRepository = AppDataSource.getRepository(AutomationRule);
    const newRule = ruleRepository.create(rule);
    await ruleRepository.save(newRule);
    return newRule;
  }

  static async removeRule(ruleId: string) {
    const AppDataSource = await getDataSource();
    const ruleRepository = AppDataSource.getRepository(AutomationRule);
    await ruleRepository.delete(ruleId);
  }

  static async getRules(): Promise<AutomationRule[]> {
    const AppDataSource = await getDataSource();
    const ruleRepository = AppDataSource.getRepository(AutomationRule);
    return await ruleRepository.find({ order: { createdAt: "DESC" } });
  }

  static async updateRule(
    id: string,
    updates: Partial<AutomationRule>
  ): Promise<AutomationRule | null> {
    const AppDataSource = await getDataSource();
    const ruleRepository = AppDataSource.getRepository(AutomationRule);
    await ruleRepository.update(id, updates as any);
    return await ruleRepository.findOneBy({ id });
  }

  static async getRuleById(id: string): Promise<AutomationRule | null> {
    const AppDataSource = await getDataSource();
    const ruleRepository = AppDataSource.getRepository(AutomationRule);
    return await ruleRepository.findOneBy({ id });
  }

  // Trigger automation based on events
  static async triggerAutomation(
    trigger: string,
    data: Record<string, unknown>
  ) {
    const AppDataSource = await getDataSource();
    const ruleRepository = AppDataSource.getRepository(AutomationRule);
    const relevantRules = await ruleRepository.find({
      where: { isActive: true, trigger: trigger as any },
    });

    for (const rule of relevantRules) {
      try {
        await this.executeRule(rule, data);
      } catch (error) {
        console.error(`Failed to execute automation rule ${rule.id}:`, error);
      }
    }
  }

  private static async executeRule(
    rule: AutomationRule,
    data: Record<string, unknown>
  ) {
    // Check conditions
    if (!this.checkConditions(rule.conditions, data)) {
      return;
    }

    // Get recipients based on rule
    const recipients = await this.getRecipients(rule, data);

    // Send emails
    for (const recipient of recipients) {
      try {
        const personalizedSubject = this.personalizeTemplate(
          rule.template.subject,
          data
        );
        const personalizedBody = this.personalizeTemplate(
          rule.template.body,
          data
        );

        await sendEmail({
          to: recipient.email,
          subject: personalizedSubject,
          html: personalizedBody,
        });

        console.log(
          `Automation email sent to ${recipient.email} for rule: ${rule.name}`
        );
      } catch (error) {
        console.error(
          `Failed to send automation email to ${recipient.email}:`,
          error
        );
      }
    }
  }

  private static checkConditions(
    conditions: Record<string, unknown>,
    data: Record<string, unknown>
  ): boolean {
    // Simple condition checking - can be extended for complex logic
    for (const [key, value] of Object.entries(conditions)) {
      if (data[key] !== value) {
        return false;
      }
    }
    return true;
  }

  private static async getRecipients(
    rule: AutomationRule,
    data: Record<string, unknown>
  ): Promise<{ email: string }[]> {
    const AppDataSource = await getDataSource();
    const userRepository = AppDataSource.getRepository(User);

    switch (rule.trigger) {
      case "user_registration":
        // Send to admins when a new user registers
        const admins = await userRepository.find({
          where: { role: "admin" },
          select: ["email"],
        });
        return admins;

      case "feedback_submitted":
        // Send to admins when feedback is submitted
        const superAdmins = await userRepository.find({
          where: { role: "super_admin" },
          select: ["email"],
        });
        return superAdmins;

      case "study_plan_created":
        // Send to the user who created the study plan
        if (data.userId) {
          const user = await userRepository.findOne({
            where: { id: data.userId as string },
            select: ["email"],
          });
          return user ? [user] : [];
        }
        return [];

      case "custom":
        // Custom logic based on conditions
        if (rule.conditions.recipientRole) {
          const users = await userRepository.find({
            where: { role: rule.conditions.recipientRole as string },
            select: ["email"],
          });
          return users;
        }
        return [];

      default:
        return [];
    }
  }

  private static personalizeTemplate(
    template: string,
    data: Record<string, unknown>
  ): string {
    let result = template;

    // Replace placeholders like {{userName}}, {{email}}, etc.
    for (const [key, value] of Object.entries(data)) {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), String(value));
    }

    return result;
  }
}

// Export functions to be used in API routes
// Note: automationRules is no longer exported as it's now stored in database
