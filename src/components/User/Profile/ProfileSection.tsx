import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useContext,
} from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { BACKEND_URL } from "../../../config";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import NotesIcon from "@mui/icons-material/Notes";
import { BottomBar } from "../../Bars/BottomBar";
import { NavBar } from "../../Bars/NavBar";
import { UserData } from "./UserData";
import { UserContext } from "../Context/UserContext";
import AddReactionIcon from "@mui/icons-material/AddReaction";
import AddReactionOutlinedIcon from "@mui/icons-material/AddReactionOutlined";
interface Post {
  id: string;
  creator: {
    username: string;
    image: string | null;
  };
  community: {
    name: string;
    image: string | null;
  };
  taggedUser: {
    id: string;
    username: string;
    image: string;
  };
  content: string;
  image: string;
  video: string | null;
  createdAt: string;
  commentsCount: string;
  likesCount: string;
  anonymity: string;
  isLiked: boolean;
}

interface ProfileSectionProps {}

export const ProfileSection: React.FC<ProfileSectionProps> = () => {
  const { username } = useParams();
  const { currentUser } = useContext(UserContext);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [loadingState, setLoadingState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [postDeleteId, setPostDeleteId] = useState("");
  const [deleteState, setDeleteState] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const postsScrollContainerRef = useRef<HTMLDivElement>(null);
  const [postData, setPostData] = useState<{
    posts: Post[];
    nextCursor: string | null;
  }>({
    posts: [],
    nextCursor: null,
  });
  const getAllPosts = useCallback(
    async (cursor: string | null | undefined, truncate: boolean) => {
      try {
        setIsLoading(true);
        const response = await axios.post(`${BACKEND_URL}/api/post/all/posts`, {
          token,
          cursor,
          username,
        });
        if (!response.data.posts) {
          setError(new Error("Sorry, this page isn't available."));
        } else {
          setPostData((prevData) => ({
            posts: truncate
              ? [...response.data.posts]
              : [...prevData.posts, ...response.data.posts],
            nextCursor: response.data.nextCursor,
          }));
        }
        setIsLoading(false);
      } catch (error: any) {
        setError(error as Error);
        setIsLoading(false);
      }
    },
    [token, username]
  );
  useEffect(() => {
    getAllPosts(null, true);
  }, [username]);

  const handleScroll = useCallback(() => {
    const postsScrollContainer = postsScrollContainerRef.current;
    if (
      postsScrollContainer &&
      postsScrollContainer.scrollTop + postsScrollContainer.clientHeight >=
        postsScrollContainer.scrollHeight &&
      postData.nextCursor &&
      !isLoading
    ) {
      getAllPosts(postData.nextCursor, false);
    }
  }, [getAllPosts, isLoading, postData.nextCursor]);

  const deletePost = useCallback(async () => {
    try {
      setLoadingState(true);
      await axios.post(`${BACKEND_URL}/api/post/delete`, {
        token,
        postDeleteId,
      });
      setDeleteState(false);
      setPostDeleteId("");
      window.location.reload();
      setLoadingState(false);
    } catch (error) {
      setError(error as Error);
      setLoadingState(false);
    }
  }, [token, postDeleteId]);

  const handleLike = useCallback(
    async (postId: string) => {
      try {
        setPostData((prevData) => ({
          ...prevData,
          posts: prevData.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: !post.isLiked,
                  likesCount: post.isLiked
                    ? parseInt(post.likesCount) - 1
                    : parseInt(post.likesCount) + 1,
                }
              : post
          ) as Post[],
          nextCursor: prevData.nextCursor,
        }));

        const details = { postId, token };
        await axios.post(`${BACKEND_URL}/api/post/like/like/unlike`, details);
      } catch (error) {
        setError(error as Error);

        setPostData((prevData) => ({
          ...prevData,
          posts: prevData.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: !post.isLiked,
                  likesCount: post.isLiked
                    ? parseInt(post.likesCount) + 1
                    : parseInt(post.likesCount) - 1,
                }
              : post
          ) as Post[],
          nextCursor: prevData.nextCursor,
        }));
      }
    },
    [token]
  );

  const getTimeDifference = useCallback((createdAt: string) => {
    const currentDate = new Date();
    const postDate = new Date(createdAt);
    const timeDifference = currentDate.getTime() - postDate.getTime();
    const hoursDifference = Math.floor(timeDifference / (1000 * 3600));
    const daysDifference = Math.floor(hoursDifference / 24);
    if (daysDifference >= 30) {
      return postDate.toDateString();
    } else if (daysDifference >= 1) {
      return `${daysDifference}d ago`;
    } else if (hoursDifference >= 1) {
      return `${hoursDifference}h ago`;
    } else {
      const minutesDifference = Math.floor(timeDifference / (1000 * 60));
      return `${minutesDifference}m ago`;
    }
  }, []);

  if (error) {
    return (
      <div className="text-center my-10 text-rosemain font-normal">
        {error.message}
      </div>
    );
  }
  if (loadingState) {
    return (
      <div className="w-full my-5 flex justify-center items-center">
        <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
      </div>
    );
  }

  if (deleteState) {
    return (
      <div className="w-full bg-black h-screen flex justify-center items-center">
        <div className="flex text-light text-center flex-col gap-6 text-base items-center font-ubuntu font-normal">
          Do you really want to delete the post ?
          <br />
          Note that you can not get back the deleted post
          <div className="flex gap-5">
            <button
              onClick={deletePost}
              className="text-light bg-red-500 font-normal px-4 py-1 text-sm rounded-lg"
            >
              Delete
            </button>
            <button
              onClick={() => {
                setDeleteState(false);
                setPostDeleteId("");
              }}
              className="text-dark bg-stone-50 font-normal px-4 py-1 text-sm rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="h-screen overflow-y-auto no-scrollbar py-12 "
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <NavBar />
        <UserData />
        <div
          className="overflow-y-auto no-scrollbar touch-action-none"
          ref={postsScrollContainerRef}
        >
          {postData.posts.length > 0 ? (
            postData.posts.map((post, index) => (
              <div
                key={index}
                className="my-2 rounded-lg border border-semidark  bg-dark"
              >
                <div className="p-3 flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    {post.community ? (
                      <div>
                        {post.community && (
                          <div>
                            {post.community && (
                              <img
                                src={post.community.image || "/group.png"}
                                className="w-7 h-7 rounded-lg"
                                alt="Community"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        {post.anonymity ? (
                          <img
                            src="/mask.png"
                            alt="Profile"
                            className="w-7 h-7 rounded-lg"
                          />
                        ) : (
                          <img
                            src={
                              post.creator.image
                                ? post.creator.image
                                : "/user.png"
                            }
                            alt="Profile"
                            className="w-7 h-7 rounded-lg"
                          />
                        )}
                      </div>
                    )}
                    <div className="w-fit flex gap-2 items-center">
                      {post.community ? (
                        <div>
                          <div className="flex gap-2 items-center">
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/community/${post.community.name}`);
                              }}
                            >
                              {post.community && (
                                <div className="text-light text-sm lg:text-base hover:underline underline-offset-2 font-normal">
                                  c/ {post.community.name}
                                </div>
                              )}
                            </div>
                            <div className="text-semilight text-xs lg:text-sm font-ubuntu">
                              · {getTimeDifference(post.createdAt)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-2 items-center">
                            {post.anonymity ? (
                              <div className="text-light text-sm lg:text-base font-normal">
                                {post.creator.username}
                              </div>
                            ) : (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/${post.creator.username}`);
                                }}
                                className="text-light text-sm lg:text-base hover:underline underline-offset-2 font-normal"
                              >
                                {post.creator.username}
                              </div>
                            )}

                            <div className="text-semilight text-xs lg:text-sm font-ubuntu">
                              · {getTimeDifference(post.createdAt)}
                            </div>
                          </div>
                        </>
                      )}
                    </div>{" "}
                  </div>
                  {post.taggedUser && (
                    <div className="">
                      <div
                        onClick={() => {
                          navigate(`/${post.taggedUser.username}`);
                        }}
                        className="text-light bg-semidark w-fit flex items-center gap-2 px-2 py-1 rounded-lg font-ubuntu text-xs"
                      >
                        <img
                          className="h-4 w-4 rounded-lg"
                          src={
                            post.taggedUser.image
                              ? post.taggedUser.image
                              : "/user.png"
                          }
                        />
                        {post.taggedUser.username}
                      </div>
                    </div>
                  )}
                </div>

                {post.video ? (
                  <video controls className="w-[100%]">
                    <source src={post.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : post.image ? (
                  <img src={post.image} className="w-[100%]" />
                ) : null}

                {post.content && (
                  <div className="text-light my-2 px-3 font-ubuntu font-light text-base">
                    {post.content}
                  </div>
                )}

                <div className="p-3 flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <button
                      className="bg-semidark  text-light px-2 rounded-lg flex justify-center items-center gap-2 cursor-pointer"
                      onClick={(e) => {
                        if (token) {
                          e.stopPropagation();
                          handleLike(post.id);
                        } else {
                          navigate("/signup");
                        }
                      }}
                    >
                      {post.isLiked ? (
                        <div>
                          <AddReactionIcon
                            sx={{
                              fontSize: 22,
                            }}
                            className="text-yellow-400"
                          />
                        </div>
                      ) : (
                        <div>
                          <AddReactionOutlinedIcon
                            sx={{
                              fontSize: 22,
                            }}
                            className="text-light hover:text-yellow-400"
                          />
                        </div>
                      )}
                      {post.likesCount}
                    </button>

                    <button
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="bg-semidark text-light px-2   rounded-lg flex justify-center items-center gap-2 cursor-pointer"
                    >
                      <NotesIcon sx={{ fontSize: 24 }} />
                      {post.commentsCount}
                    </button>
                  </div>
                  <div>
                    {currentUser === username && (
                      <button
                        onClick={() => {
                          setPostDeleteId(post.id);
                          setDeleteState(true);
                        }}
                      >
                        <MoreVertIcon
                          className="text-semilight"
                          sx={{ fontSize: 20 }}
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>
              {!isLoading && (
                <div className="text-semilight my-5 font-light text-center text-lg">
                  No posts found
                </div>
              )}
            </div>
          )}
          {isLoading && (
            <div className="w-full my-5 flex justify-center items-center">
              <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
            </div>
          )}
        </div>
        <BottomBar />
      </div>
    </>
  );
};
