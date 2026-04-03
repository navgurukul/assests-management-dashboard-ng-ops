import { MyAssetsTab, UserProfileTab } from "@/features/userprofile/tabs";

export default function MyAssetsPage() {
  return <div className="p-8">
  <UserProfileTab />
    <MyAssetsTab />
  </div>;
}
