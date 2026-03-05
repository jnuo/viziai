import { redirect } from "next/navigation";

// Fallback — middleware rewrite handles "/" normally.
// This only runs if middleware is bypassed.
export default function Home() {
  redirect("/tr");
}
