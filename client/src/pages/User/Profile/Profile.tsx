import { SideBar } from "../../../components/Bars/SideBar";
import { ProfileSection } from "../../../components/User/Profile/ProfileSection";
export const Profile = () => {
  return (
    <div className="flex justify-evenly bg-bgblack">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[40%] bg-bgblack">
        <ProfileSection />
      </div>
      <div className="w-[18%] max-lg:hidden"></div>
    </div>
  );
};
