import { SideBar } from "../../../components/Bars/SideBar";
import { ProfileSection } from "../../../components/User/Profile/ProfileSection";
export const Profile = () => {
  return (
    <div
      className="flex justify-evenly 
"
    >
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div
        className="w-full lg:w-[40%] 
"
      >
        <ProfileSection />
      </div>
      <div className="w-[18%] max-lg:hidden"></div>
    </div>
  );
};
