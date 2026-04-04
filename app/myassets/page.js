import { MyAssetsTab, UserProfileTab } from "@/features/userprofile/tabs";

export default function MyAssetsPage() {
  return <div className="p-8">
  <UserProfileTab />
   <div className="mt-8" >
     <MyAssetsTab />
   </div>
  </div>;
}
