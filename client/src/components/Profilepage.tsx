import React, { useEffect, useState } from "react";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import { BACKEND_URL } from "../config";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { ButtonsSidebar } from "./ButtonsSidebar";
import { LoadinPage } from "./LoadinPage";
export const Profilepage: React.FC = () => {
  const [loadingState, setLoadingState] = useState(false);

  const [userData, setUserData] = useState<{
    id: string;
    name: string;
    username: string;
    gender: string;
    bio: string;
    image: string;
    followers: {
      followerId: string;
      followingId: string;
    }[];
    following: {
      followerId: string;
      followingId: string;
    }[];
    posts: {
      id: string;
      content: string;
      image: string;
    }[];
  }>({
    id: "",
    name: "",
    username: "",
    gender: "",
    bio: "",
    image: "",
    followers: [],
    following: [],
    posts: [],
  });

  const [bio, setBio] = useState("");
  const [imageUpdateState, setImageUpdateState] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [postDeletionState, setPostDeletionState] = useState(false);
  const [deletingPost, setDeletingPost] = useState("");
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [isBioEditing, setIsBioEditing] = useState(false);
  const token = localStorage.getItem("token");

  async function getData() {
    setLoadingState(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/userdata`,
        { token }
      );
      setUserData(response.data.message);
      setLoadingState(false);
    } catch (error) {
      console.log(error);
    }
  }

  async function bioUpdate() {
    if (bio.length == 0) {
      alert("enter a valid bio");
      return;
    }
    setLoadingState(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/bioupdate`,
        { token, bio }
      );

      if (response.data.status == 200) {
        setIsBioEditing(false);
        getData();
        alert("Bio updated successfully");
      }
      setLoadingState(false);
    } catch (error) {
      console.log(error);
    }
  }
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) {
      return;
    }

    const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxFileSize) {
      alert("File size exceeds 10MB limit");
      return;
    }
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only PNG, JPG, and JPEG files are allowed");
      return;
    }

    setProfileImg(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  const savePhoto = async () => {
    const file = profileImg;
    const formdata = new FormData();
    formdata.append("image", file ? file : "");
    formdata.append("token", token ? token : "");
    setLoadingState(true);
    const response = await axios.post(
      `${BACKEND_URL}/api/server/v1/user/profile-picture-update`,
      formdata
    );
    setLoadingState(false);

    if (response.data.status === 200) {
      setPreviewImage("");
      setProfileImg(null);
      getData();
      return alert("Image updated");
    } else {
      return alert("Server error, try again later");
    }
  };
  const cancelSave = () => {
    setProfileImg(null);
    setPreviewImage("");
  };

  async function deletePost() {
    const postId = deletingPost;
    setLoadingState(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/post/delete-post`,
        { token, postId }
      );
      setLoadingState(false);
      setPostDeletionState(false);
      setDeletingPost("");
      if (response.data.status == 200) {
        alert("post deleted succesfull");
        getData();
      } else {
        alert("post deletion failed, try again later");
      }
    } catch (e) {
      console.log(e);
    }
  }

  async function removeDp() {
    try {
      setLoadingState(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/server/v1/user/remove-dp`,
        {
          token,
        }
      );
      setImageUpdateState(false);
      setLoadingState(false);
      if (response.data.status == 200) {
        alert("profile photo deleted successfuly");
        getData();
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    try {
      getData();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);
  useEffect(() => {}, [userData.posts, userData.bio]);

  return (
    <>
      {loadingState ? (
        <LoadinPage />
      ) : (
        <>
          {postDeletionState ? (
            <div className="bg-neutral-950 w-full h-screen flex items-center justify-center">
              <div className="text-white text-lg font-ubuntu">
                Do you really want to delete this post?
                <div className="flex justify-evenly my-5">
                  <button
                    onClick={deletePost}
                    className="text-neutral-300 px-4 py-1 border border-neutral-300 rounded-lg font-thin"
                  >
                    YES
                  </button>
                  <button
                    onClick={() => {
                      setPostDeletionState(false);
                    }}
                    className="text-neutral-300 px-5 py-1 border border-neutral-300 rounded-lg font-thin"
                  >
                    NO
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="h-14 lg:hidden top-0 fixed w-full flex items-center justify-center bg-black  border-b border-r border-l border-bordercolor text-2xl text-white font-ubuntu">
                kribble
              </div>
              <div className="lg:h-screen max-lg:my-14 border-l border-r border-bordercolor overflow-y-auto no-scrollbar">
                <div className="p-4 lg:p-10 border-b border-bordercolor">
                  <div className="flex justify-between items-center">
                    <div className=" flex w-[25%]">
                      {profileImg ? (
                        <div>
                          <img
                            src={previewImage}
                            alt="Profile"
                            className="w-16 h-16 lg:w-20 lg:h-20 rounded-full"
                          />
                        </div>
                      ) : (
                        <div className="flex items-start">
                          <img
                            src={userData.image ? userData.image : "/user.png"}
                            alt="Profile"
                            className="w-16 h-16 lg:w-20 lg:h-20 rounded-full"
                          />
                          <button
                            onClick={() => {
                              setImageUpdateState(true);
                            }}
                          >
                            <EditIcon
                              sx={{ fontSize: 25 }}
                              className="text-neutral-400"
                            />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-white flex w-[75%] justify-evenly">
                      <div className="flex flex-col items-center">
                        <div>{userData.posts.length}</div>
                        <div>Posts</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div>{userData.followers.length}</div>
                        <div>Followers</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div>{userData.following.length}</div>
                        <div>Following</div>
                      </div>
                    </div>
                  </div>
                  <div className="my-2 px-2">
                    <div className="flex justify-between">
                      <div>
                        <h2 className="text-lg text-white">{userData.name}</h2>
                        <h2 className="text-base text-neutral-400 font-light">
                          @{userData.username}
                        </h2>
                      </div>
                      <div>
                        {previewImage ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={savePhoto}
                              className="bg-blue-800 text-neutral-300 px-4 py-1 rounded-lg font-ubuntu"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelSave}
                              className="bg-black border border-bordercolor hover:bg-neutral-900 text-white px-4 py-1 rounded-lg font-light"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div>
                            {imageUpdateState ? (
                              <div>
                                <div className="flex items-center gap-2 ">
                                  <button onClick={removeDp}>
                                    <DeleteIcon
                                      sx={{ fontSize: 25 }}
                                      className="text-neutral-600"
                                    />
                                  </button>

                                  <div>
                                    <button className="bg-blue-800 text-neutral-300 px-4 py-1 rounded-lg font-ubuntu">
                                      <label
                                        htmlFor="image-upload"
                                        className="cursor-pointer "
                                      >
                                        update
                                      </label>
                                      <input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                      />
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setImageUpdateState(false);
                                    }}
                                    className="text-neutral-400"
                                  >
                                    <CloseIcon sx={{ fontSize: 30 }} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center gap-2">
                                  {isBioEditing && (
                                    <button
                                      onClick={bioUpdate}
                                      className="bg-blue-800 text-neutral-300 px-4 py-1 rounded-lg font-ubuntu"
                                    >
                                      update
                                    </button>
                                  )}
                                  <button
                                    onClick={() =>
                                      setIsBioEditing(!isBioEditing)
                                    }
                                  >
                                    {isBioEditing ? (
                                      <CloseIcon
                                        className="text-neutral-400"
                                        sx={{ fontSize: 30 }}
                                      />
                                    ) : (
                                      <div className="bg-blue-800 text-neutral-300 px-4 py-1 rounded-lg font-ubuntu">
                                        edit bio
                                      </div>
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {isBioEditing && (
                      <div className="flex items-center w-full gap-4 my-2">
                        <input
                          maxLength={120}
                          defaultValue={userData.bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Enter your bio"
                          className="w-full p-2  rounded-lg"
                        />
                      </div>
                    )}
                    {!isBioEditing && (
                      <div className="text-white my-2 font-light">
                        {userData.bio ? (
                          <div>{userData.bio}</div>
                        ) : (
                          <div>Write your bio</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  {userData.posts.length > 0 ? (
                    userData.posts
                      .slice()
                      .reverse()
                      .map((post, index) => (
                        <div
                          key={index}
                          className="py-4 p-10  border-b border-bordercolor"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img
                                src={
                                  userData.image ? userData.image : "user.png"
                                }
                                alt="Profile"
                                className="w-10 h-10 rounded-full"
                              />

                              <div className="flex gap-2 items-center">
                                <div className="text-white">
                                  {userData.name}
                                </div>
                                <div className="text-neutral-400 text-sm">
                                  @{userData.username}
                                </div>
                              </div>
                            </div>
                            <div>
                              <button
                                onClick={() => {
                                  setPostDeletionState(true);
                                  setDeletingPost(post.id);
                                }}
                              >
                                <DeleteIcon
                                  sx={{ fontSize: 20 }}
                                  className="text-neutral-600"
                                />
                              </button>
                            </div>
                          </div>
                          <div className="w-ful py-4 flex flex-col items-start justify-center">
                            <img
                              src={post.image}
                              className="h-auto w-[70%] rounded-lg"
                            />
                            <div className="text-white my-2 font-light">
                              {post.content}
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center font-ubuntu my-5 text-white">
                      No posts found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="lg:hidden bg-neutral-950 bottom-0 fixed w-full border-l border-r border-t border-bordercolor">
            <div className="h-14">
              <ButtonsSidebar />
            </div>
          </div>
        </>
      )}
    </>
  );
};
