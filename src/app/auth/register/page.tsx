import { redirect } from "next/navigation";

// Sign-up happens through the email-code flow on the sign-in page.
export default function Register() {
  redirect("/auth/signin");
}
