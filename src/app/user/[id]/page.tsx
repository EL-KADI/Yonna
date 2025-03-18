import { Suspense } from "react";
import UserProfileClient from "./UserProfileClient";
export async function generateStaticParams() {
  return [{ id: "default" }];
}
export default function UserProfile() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserProfileClient />
    </Suspense>
  );
}