import { SideBar } from "../../../components/Bars/SideBar";
import { MatchesComponent } from "../../../components/Match/MatchesComponent";

export const Matches = () => {
  return (
    <div className="flex justify-between bg-neutral-50">
      <div className="w-[20%] max-lg:hidden">
        <SideBar />
      </div>
      <div className="w-full lg:w-[50%]">
        <MatchesComponent />
      </div>
      <div className="w-[25%] max-lg:hidden"></div>
    </div>
  );
};
