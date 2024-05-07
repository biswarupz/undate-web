import { SideBar } from "../components/SideBar/SideBar";
import { Suggestions } from "../components/Communities/Suggestions";
import { ProfileSection } from "../components/ProfileComponents/ProfileSection";
export const Profile = () => {
  return (
    <div className="flex justify-between bg-white">
      <div className="w-[25%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[45%]">
        <ProfileSection />
      </div>

      <div className="w-[30%] max-lg:hidden">
        <Suggestions />
      </div>
    </div>
  );
};
