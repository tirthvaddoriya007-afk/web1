import { redirect } from "next/navigation";

// The welcome landing was removed from the project — every visitor goes
// straight to the home screen.
export default function RootPage() {
  redirect("/home");
}
