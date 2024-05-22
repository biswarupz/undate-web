import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { BottomBar } from "../Bars/BottomBar";
import LinearProgress from "@mui/material/LinearProgress";

interface User {
  username: string;
  image: string;
}

interface Community {
  name: string;
  image: string;
}

export const SearchComponent = () => {
  const token = localStorage.getItem("token");
  const [search, setSearch] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);

  const fetchSearchResults = useCallback(async () => {
    setIsSearching(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/search/data`, {
        token,
        search,
      });
      setUsers(response.data.users);
      setCommunities(response.data.communities);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setIsSearching(false);
    }
  }, [token, search]);

  function debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): T {
    let timeoutId: ReturnType<typeof setTimeout>;
    return ((...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    }) as T;
  }

  const debouncedSearch = useCallback(debounce(fetchSearchResults, 1000), [
    fetchSearchResults,
  ]);

  useEffect(() => {
    if (search.length !== 0) {
      debouncedSearch();
    } else {
      setUsers([]);
      setCommunities([]);
    }
  }, [search, debouncedSearch]);

  return (
    <>
      <div className="top-0 fixed w-full lg:w-[50%]">
        {isSearching && <LinearProgress sx={{ backgroundColor: "black" }} />}

        <div className="w-full px-4 h-14 flex justify-between items-center">
          <div className="h-10 bg-bordermain mx-auto w-[75%] hover:bg-bgtwo flex px-4 justify-between items-center border border-bordermain rounded-lg">
            <input
              type="text"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full h-full bg-bordermain hover:bg-bgtwo text-texttwo focus:outline-none"
            />
            <SearchIcon className="text-texttwo" />
          </div>
        </div>

        <div>
          {users.length !== 0 || communities.length !== 0 ? (
            <div>
              <div>
                {users.map((user) => (
                  <Link to={`/${user.username}`} key={user.username}>
                    <div className="flex border my-2 bg-bgmain rounded-lg border-bordermain py-2 gap-2 items-center px-4 hover:bg-bgtwo">
                      <div className="text-sm font-normal text-textmain">
                        u/
                      </div>
                      <div>
                        <img
                          src={user.image ? user.image : "/user.png"}
                          alt="Profile"
                          className="h-9 w-9 rounded-lg"
                        />
                      </div>
                      <div className="text-textmain text-lg">
                        {user.username}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div>
                {communities.map((community) => (
                  <Link
                    to={`/community/${community.name}`}
                    key={community.name}
                  >
                    <div className="flex border my-2 bg-bgmain rounded-lg border-bordermain py-2 gap-2 items-center px-4 hover:bg-bgtwo">
                      <div className="text-sm font-normal text-textmain">
                        c/
                      </div>
                      <div>
                        <img
                          src={community.image ? community.image : "/group.png"}
                          alt="Profile"
                          className="h-9 w-9 rounded-lg"
                        />
                      </div>
                      <div className="items-center">
                        <div className="text-textmain text-lg">
                          {community.name}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {isSearching ? (
                ""
              ) : (
                <div className="text-texttwo my-5 font-light text-center text-sm">
                  Search result not found
                </div>
              )}
            </div>
          )}
        </div>
        <BottomBar />
      </div>
    </>
  );
};
