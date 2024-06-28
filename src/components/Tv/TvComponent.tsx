import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../config";
import NotesIcon from "@mui/icons-material/Notes";
import { BottomBar } from "../Bars/BottomBar";
import { NavBar } from "../Bars/NavBar";
import AddIcon from "@mui/icons-material/Add";
import { CircularProgress } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Swiper, SwiperSlide } from "swiper/react";
import { Virtual, Mousewheel } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";

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
  video: string | null;
  createdAt: string;
  commentsCount: string;
  likesCount: string;
  anonymity: string;
  isLiked: boolean;
}

interface VideoPostProps {
  post: Post;
  handleLike: (postId: string) => Promise<void>;
  getTimeDifference: (createdAt: string) => string;
  navigate: (path: string) => void;
}

const VideoPost: React.FC<VideoPostProps & { isActive: boolean }> = ({
  post,
  handleLike,
  getTimeDifference,
  navigate,
  isActive,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive]);
  const togglePause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className="relative h-full w-full">
      <video
        ref={videoRef}
        id={`video-${post.id}`}
        className="h-full w-full object-cover"
        loop
        playsInline
        preload="metadata"
        autoPlay
      >
        <source src={post.video ? post.video : ""} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center mb-2 gap-2">
            {post.anonymity ? (
              <img
                src="/mask.png"
                alt="Profile"
                className="w-7 h-7 rounded-lg"
              />
            ) : (
              <img
                src={post.creator.image ? post.creator.image : "/user.png"}
                alt="Profile"
                className="w-7 h-7 rounded-lg"
              />
            )}

            <div>
              <div className="text-light text-sm lg:text-base font-normal">
                {post.creator.username}
              </div>
              <div className="text-gray-300 text-sm">
                {getTimeDifference(post.createdAt)}
              </div>
            </div>
          </div>
          <div className="text-light my-2  font-ubuntu font-light text-base">
            {post.content}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => handleLike(post.id)}
              className="flex items-center text-white"
            >
              {post.isLiked ? (
                <div>
                  <FavoriteIcon
                    sx={{
                      fontSize: 22,
                    }}
                    className="text-rosemain"
                  />
                </div>
              ) : (
                <div>
                  <FavoriteBorderIcon
                    sx={{
                      fontSize: 22,
                    }}
                    className="text-light hover:text-rosemain"
                  />
                </div>
              )}
              <span className="ml-1">{post.likesCount}</span>
            </button>
            <button
              onClick={() => navigate(`/post/${post.id}`)}
              className="flex items-center text-white"
            >
              <NotesIcon />
              <span className="ml-1">{post.commentsCount}</span>
            </button>
          </div>
        </div>
        <button
          onClick={togglePause}
          className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full"
        >
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </button>
      </div>
    </div>
  );
};

export const TvComponent = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [postData, setPostData] = useState<{
    posts: Post[];
    nextCursor: string | null;
  }>({
    posts: [],
    nextCursor: null,
  });

  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp" && swiperRef.current) {
      swiperRef.current.slidePrev();
    } else if (e.key === "ArrowDown" && swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function getFeedPosts(cursor?: string) {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/user/feed/posts/tv`,
        {
          token,
          cursor,
        }
      );
      setPostData({
        posts: [...postData.posts, ...response.data.data],
        nextCursor: response.data.nextCursor,
      });
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getFeedPosts();
  }, []);

  const handleLike = async (postId: string) => {
    try {
      setPostData((prevData) => ({
        ...prevData,
        posts: prevData.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likesCount: post.isLiked
                  ? (parseInt(post.likesCount) - 1).toString()
                  : (parseInt(post.likesCount) + 1).toString(),
              }
            : post
        ),
      }));
      const details = { postId, token };
      await axios.post(`${BACKEND_URL}/api/post/like/like/unlike`, details);
    } catch (error) {
      console.log(error);
      setPostData((prevData) => ({
        ...prevData,
        posts: prevData.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likesCount: post.isLiked
                  ? (parseInt(post.likesCount) + 1).toString()
                  : (parseInt(post.likesCount) - 1).toString(),
              }
            : post
        ),
      }));
    }
  };

  const getTimeDifference = (createdAt: string) => {
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
  };

  return (
    <div className="h-screen overflow-hidden">
      <NavBar />
      <Swiper
        modules={[Virtual, Mousewheel]}
        direction="vertical"
        slidesPerView={1}
        virtual
        mousewheel={{
          sensitivity: 1,
          thresholdDelta: 50,
          thresholdTime: 100,
        }}
        speed={300}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.activeIndex);
        }}
        onReachEnd={() => {
          if (postData.nextCursor && !isLoading) {
            getFeedPosts(postData.nextCursor);
          }
        }}
        className="h-full"
      >
        {postData.posts.map((post, index) => (
          <SwiperSlide key={index}>
            <VideoPost
              post={post}
              handleLike={handleLike}
              getTimeDifference={getTimeDifference}
              navigate={navigate}
              isActive={index === activeIndex}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      {postData.posts.length === 0 && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-semilight font-light text-center text-lg">
            No posts found
          </div>
        </div>
      )}
      {isLoading && (
        <div className="absolute bottom-20 left-0 right-0 flex justify-center">
          <CircularProgress sx={{ color: "rgb(50 50 50);" }} />
        </div>
      )}
      <div
        onClick={() => navigate("/create/post")}
        className="absolute bg-indigomain bottom-20 right-4 flex justify-center items-center w-11 h-11 rounded-full"
      >
        <AddIcon className="text-light" sx={{ fontSize: 28 }} />
      </div>
      <BottomBar />
    </div>
  );
};
