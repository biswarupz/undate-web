import { SideBar } from "../../components/Bars/SideBar";
import { PostProfile } from "../../components/Post/PostProfile";

export const Post = () => {
  return (
    <div className="flex justify-between bg-bgmain">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[50%]">
        <PostProfile />
      </div>
      <div className="w-[22%] max-lg:hidden"></div>
    </div>
  );
};
