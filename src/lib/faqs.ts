export const CONTACT_EMAIL = "oprep.nmcn@gmail.com";

export interface Faq {
  question: string;
  answer: string[];
  list?: string[];
  footnote?: string;
}

export const faqs: Faq[] = [
  {
    question: "What is OPREP all about?",
    answer: [
      "OPREP (Online Professional Readiness and Exam Preparation) is a structured learning platform that helps nursing and midwifery students prepare for their professional licensing examinations. We provide curriculum-based study plans, lecture notes, CBT practice questions, assessments, brainstorming sessions, and mock examinations to support consistent preparation.",
    ],
  },
  {
    question:
      "Is OPREP affiliated with the Nursing and Midwifery Council of Nigeria (NMCN)?",
    answer: [
      "No. OPREP is an independent educational platform and is not affiliated with, endorsed by, or a partner of the Nursing and Midwifery Council of Nigeria (NMCN). Our study resources are developed using the approved NMCN curriculum to help students prepare effectively for their professional examinations.",
    ],
  },
  {
    question: "Who can join OPREP?",
    answer: ["Our programs are designed for:"],
    list: [
      "Nursing students preparing for the RN examination",
      "Midwifery students preparing for the RM examination",
      "Public Health Nursing students preparing for the RPHN examination",
    ],
    footnote:
      "We also develop programs for internship preparation and other healthcare career readiness initiatives.",
  },
  {
    question: "What do I get when I register?",
    answer: ["A one-time OPREP payment grants you access to:"],
    list: [
      "A structured study guide",
      "Curriculum-aligned lecture notes",
      "CBT practice questions",
      "Weekly assessments",
      "Daily brainstorming sessions",
      "Mock examinations",
      "Academic support",
      "Access to our learning platform and study community",
    ],
  },
  {
    question: "How are the classes delivered?",
    answer: [
      "OPREP is delivered online, with WhatsApp being our primary medium. Learning materials, announcements, and activities are shared through our digital platforms, allowing students from different institutions across Nigeria to participate regardless of location.",
    ],
  },
  {
    question: "Do you guarantee that I will pass my professional examination?",
    answer: [
      "No. Success depends on your commitment, consistency, and participation. OPREP, however, provides the structure, learning resources, and support to help you prepare effectively and pass excellently.",
    ],
  },
  {
    question: "Are your lecture notes enough for the examination?",
    answer: [
      "Our lecture notes are developed from the approved curriculum and are designed to guide your preparation. However, we encourage students to actively participate in discussions, complete assessments, practice CBT questions, and make use of other recommended learning resources where necessary.",
    ],
  },
  {
    question: "Can I share my OPREP materials with others?",
    answer: [
      "No. Your registration gives you alone personal access to OPREP resources. Sharing, reproducing, or distributing our lecture notes, assessments, or other learning materials is wrong and prohibited.",
      "Protecting these materials allows us to continue developing quality resources for our students, and prevents plagiarism and the malicious use or destruction of study materials.",
    ],
  },
  {
    question: "How long do I have access to my cohort?",
    answer: [
      "Access is available for the duration of your registered cohort. Any extension beyond the stated access period may require a new registration or an approved extension, depending on the program.",
    ],
  },
  {
    question: "Why should I choose OPREP?",
    answer: [
      "Preparing for professional examinations can be overwhelming when you're balancing lectures, clinical postings, assignments, and semester examinations. OPREP helps you stay organised by turning the curriculum into a structured study system, so you know what to study, when to study, and how to prepare consistently instead of relying on last-minute reading.",
    ],
  },
  {
    question: "How do I register to join OPREP?",
    answer: [
      "Registration is completed online, first through our initiative representative on WhatsApp and then on the OPREP website. Once your registration is confirmed, you will receive further instructions on accessing your cohort and learning resources.",
    ],
  },
];
