import { AppDataSource } from "@/lib/database";
import { User } from "@/entities/User";
import { sendEmail } from "@/lib/email";

interface AutomationRule {
  id: string;
  name: string;
  trigger:
    | "user_registration"
    | "feedback_submitted"
    | "study_plan_created"
    | "custom";
  conditions: Record<string, unknown>;
  template: {
    subject: string;
    body: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for automation rules (in production, use database)
let automationRules: AutomationRule[] = [];

export class NotificationAutomation {
  static addRule(rule: AutomationRule) {
    automationRules.push(rule);
  }

  static removeRule(ruleId: string) {
    automationRules = automationRules.filter((r) => r.id !== ruleId);
  }

  static getRules(): AutomationRule[] {
    return automationRules;
  }

  static updateRule(ruleId: string, updates: Partial<AutomationRule>) {
    const index = automationRules.findIndex((r) => r.id === ruleId);
    if (index !== -1) {
      automationRules[index] = {
        ...automationRules[index],
        ...updates,
        updatedAt: new Date(),
      };
    }
  }

  // Trigger automation based on events
  static async triggerAutomation(
    trigger: string,
    data: Record<string, unknown>
  ) {
    const relevantRules = automationRules.filter(
      (rule) => rule.isActive && rule.trigger === trigger
    );

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
export { automationRules };
