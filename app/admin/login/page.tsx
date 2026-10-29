import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = { title: "Admin sign in" };

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
