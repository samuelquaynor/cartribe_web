import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | CarTribe - Car Sharing Platform",
  description: "Create a new CarTribe account to start renting or sharing your vehicles",
};

export default function SignUp() {
  return <SignUpForm />;
}
