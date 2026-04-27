import { Suspense } from "react";
import LoginClient from "../../components/LoginClient";
// import LoginClient from "./LoginClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginClient />
    </Suspense>
  );
}