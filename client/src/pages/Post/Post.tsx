import { SideBar } from "../../components/Bars/SideBar";
import { PostProfile } from "../../components/Post/PostProfile";

export const Post = () => {
  return (
    <div className="flex justify-evenly bg-bgblack">
      <div className="w-[18%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[40%] bg-bgblack">
        <PostProfile />
      </div>
      <div className="w-[18%] max-lg:hidden"></div>
    </div>
  );
};
