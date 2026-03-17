import { redirect } from "next/navigation";

// When someone visits the root URL, send them to the status training
export default function Home() {
  redirect("/training/training-status.html");
}
