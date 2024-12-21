import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import ProfileAchievements from "../components/profile/ProfileAchievements";
import ProfileStatistics from "../components/profile/ProfileStatistics";
import ProfileOverview from "../components/profile/ProfileOverview";
import ProfileFriends from "../components/profile/ProfileFriends";
import React, { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { GiCrossedSwords } from "react-icons/gi";
import AuthContext from "../context/AuthContext";
import { LiaMedalSolid } from "react-icons/lia";
import { GiFlamedLeaf } from "react-icons/gi";
import { FaClover } from "react-icons/fa6";
import Header from "../components/Header";
import NotFound from "./NotFound";
import { useNavigate } from "react-router-dom";
import "react-circular-progressbar/dist/styles.css";
import { BACKENDURL } from "../utils/fetchWrapper";
import LoadingPage from "./LoadingPage";
import UserContext from "../context/UserContext";
import { FiEdit3 } from "react-icons/fi";
import UpdateProfile from "../components/profile/UpdateProfile";
import { MdOutlineBlock } from "react-icons/md";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { IoMdPersonAdd } from "react-icons/io";
import { ImUserPlus, ImUserMinus } from "react-icons/im";
import { CgUnblock } from "react-icons/cg";
import Toast from "../components/Toast";

const profileMenu = ["overview", "statistics", "achievements", "friends"];

const FriendManagementButtons = ({ approval, setApproval }) => {
  const contextData = useContext(UserContext);

  const handleApprovedAction = (type) => {
    setApproval({
      visible: true,
      message: "are you sure!",
      type: type,
    });
  };
  return (
    <>
      {!contextData.profileInfo.isBlockedByUser &&
        !contextData.profileInfo.isUserBlocked &&
        contextData.profileInfo.isFriend && (
          <button
            onClick={contextData.sendMessage}
            className="secondary-glass grow lg:w-full p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-green/60 hover:text-black rounded-md text-green font-semibold tracking-wide"
          >
            <IoChatbubbleEllipsesOutline />
            <p>message</p>
          </button>
        )}

      {!contextData.profileInfo.isBlockedByUser &&
        !contextData.profileInfo.isUserBlocked &&
        !contextData.profileInfo.isFriend &&
        !contextData.profileInfo.isSentRequest &&
        !contextData.profileInfo.isReceiveRequest && (
          <button
            onClick={() =>
              contextData.sendFriendRequest(contextData.profileInfo.id)
            }
            className="secondary-glass grow p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-green/60 hover:text-black rounded-md text-green font-semibold tracking-wide"
          >
            <IoMdPersonAdd />
            <p>add friend</p>
          </button>
        )}

      {!contextData.profileInfo.isBlockedByUser &&
        !contextData.profileInfo.isUserBlocked &&
        !contextData.profileInfo.isFriend &&
        contextData.profileInfo.isReceiveRequest && (
          <button
            onClick={contextData.cancelFriendRequest}
            className="secondary-glass grow p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-red/60 hover:text-white rounded-md text-red font-semibold tracking-wide"
          >
            <ImUserMinus />
            <p>cancel request</p>
          </button>
        )}

      {!contextData.profileInfo.isBlockedByUser &&
        !contextData.profileInfo.isUserBlocked &&
        !contextData.profileInfo.isFriend &&
        contextData.profileInfo.isSentRequest && (
          <>
            <button
              onClick={() =>
                contextData.acceptFriendRequest(contextData.profileInfo.id)
              }
              className="secondary-glass grow p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-green/60 hover:text-black rounded-md text-green font-semibold tracking-wide"
            >
              <ImUserPlus />
              <p>confirm</p>
            </button>
            <button
              onClick={() =>
                contextData.declineRequest(contextData.profileInfo.id)
              }
              className="secondary-glass grow p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-red/60 hover:text-white rounded-md text-red font-semibold tracking-wide"
            >
              <ImUserMinus />
              <p>delete</p>
            </button>
          </>
        )}

      {!contextData.profileInfo.isBlockedByUser &&
        contextData.profileInfo.isUserBlocked && (
          <>
            <button
              onClick={contextData.unblockUser}
              className="secondary-glass grow p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-green/60 hover:text-black rounded-md text-green font-semibold tracking-wide"
            >
              <ImUserMinus />
              <p>unblock</p>
            </button>
            {/* <p className="text-center normal-case text-txt-xs text-red">this user have been blocked by you click to unblock</p> */}
          </>
        )}

      {!contextData.profileInfo.isBlockedByUser &&
        !contextData.profileInfo.isUserBlocked &&
        contextData.profileInfo.isFriend && (
          <button
            onClick={() => handleApprovedAction("unfriend")}
            className="secondary-glass grow p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-red/60 hover:text-white rounded-md text-red font-semibold tracking-wide"
          >
            <ImUserMinus />
            <p>unfriend</p>
          </button>
        )}

      {!contextData.profileInfo.isBlockedByUser &&
        !contextData.profileInfo.isUserBlocked &&
        contextData.profileInfo.isFriend && (
          <button
            onClick={() => handleApprovedAction("block")}
            className="secondary-glass text-txt-sm p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-red/60 hover:text-white rounded-md text-red font-semibold tracking-wide"
          >
            <MdOutlineBlock />
            <p>block</p>
          </button>
        )}
    </>
  );
};

const Profile = () => {
  const authContextData = useContext(AuthContext);
  const { section, username } = useParams();
  const [udpateProfile, setUpdateProfile] = useState(false);
  const navigate = useNavigate();
  const [approval, setApproval] = useState({
    visible: false,
    message: null,
    type: null,
  });
  const [selectedMenu, setSelectedMenu] = useState(
    section ? section : "overview",
  );
  const contextData = useContext(UserContext);

  if (!section) {
    // console.log('lwla');
    navigate("/profile/overview");
  }
  useEffect(() => {
    if (!profileMenu.includes(section)) {
      // console.log('tania');
      navigate("/profile/overview");
      setSelectedMenu("overview");
    }
    return () => {
      console.log('hehhehehehehehehee');
      authContextData.setGlobalMessage({message: '', isError: true});
    }
  }, []);

  useEffect(() => {
    if (section !== selectedMenu) {
      // console.log('khouna rah section tbadlat');
      setSelectedMenu(section);
      authContextData.setDisplayMenuGl(false);
    }
    // console.log('section updated');
  });

  // useEffect(() => {
  // 	console.log('talta');
  // 	if (username)
  // 		navigate(`/profile/${section}/${username ? username : ''}`);
  // 	else
  // 		navigate(`/profile/${section}/`);
  // 	authContextData.setDisplayMenuGl(false);
  // 	setSelectedMenu(section);
  // }, [section]);

  // useEffect(() => {
  // 	console.log('selected: ', selectedMenu);
  // })

  // useEffect(() => {
  // 	console.log('selected dependencies: ', selectedMenu);
  // }, [selectedMenu])

  useEffect(() => {
    if (username) {
      contextData.getProfile(username);
      contextData.setProfileInfo(null);
      contextData.setUserFriends(null);
    } else {
      contextData.getProfile();
      contextData.setProfileInfo(null);
    }
  }, [username]);

  const handleNavigation = (menu) => {
    if (username) navigate(`/profile/${menu}/${username}`);
    else navigate(`/profile/${menu}`);
    contextData.setRefresh(true);
    setSelectedMenu(menu);
  };

  useEffect(() => {
    if (contextData.profileInfo && contextData.profileInfo.found === "no") {
      // console.log('rab3a');
      navigate("/profile/overview");
    }
  }, [contextData.profileInfo && contextData.profileInfo.found]);

  useEffect(() => {
    // update the profile info after hit any profile button
    if (contextData.refresh) {
      // console.log(contextData.profileInfo.username);
      contextData.getProfile(contextData.profileInfo.username);
      contextData.setRefresh(false);
    }
  }, [contextData.refresh]);

  return (
    <div className="flex flex-col w-full grow lg:gap-32 gap-16 relative">
      <Header link="profile" />
      {!contextData.profileInfo && <LoadingPage />}
      {!authContextData.displayMenuGl && contextData.profileInfo !== null && (
        <div className="container">
          {udpateProfile && (
            <UpdateProfile setUpdateProfile={setUpdateProfile} />
          )}
          <div className="flex primary-glass overflow-hidden p-16 w-full lg:gap-32 gap-16 relative  get-height">
            <div
              className={`absolute top-0 left-0 w-full lg:h-[232px] ${contextData.profileInfo.me ? "h-[216px]" : "h-[260px]"}`}
            >
              <div className="w-full h-full absolute cover-gradient"></div>
              <img
                className="object-cover w-full h-full object-center"
                src="/images/profile-cover.webp"
                alt="Profile Cover image"
              />
            </div>
            <div className="lg:flex hidden flex-col w-full secondary-glass p-16 gap-16 min-w-[320px] max-w-[320px]">
              <div className="flex flex-col gap-8 items-center justify-center">
                <CircularProgressbarWithChildren
                  value={50}
                  className="w-[120px] h-[120px] bg-black bg-opacity-40 rounded-full"
                  strokeWidth={6}
                  styles={buildStyles({
                    strokeLinecap: "round",
                    pathColor: "#31E78B",
                    trailColor: "rgba(80,80,80,0.2)",
                  })}
                >
                  <div className="w-[104px] h-[104px] flex justify-center rounded-full overflow-hidden">
                    <img
                      src={
                        contextData.profileInfo &&
                        contextData.profileInfo.profile_image
                          ? `${BACKENDURL}${contextData.profileInfo.profile_image}?t=${new Date().getTime()}`
                          : "/images/default.jpeg"
                      }
                      alt="profile pic"
                      className="object-cover w-full"
                    />
                  </div>
                </CircularProgressbarWithChildren>
                <h1 className="text-h-lg-md font-bold">{`${contextData.profileInfo.first_name} ${contextData.profileInfo.last_name}`}</h1>
                <h2 className="text-txt-md normal-case">
                  @{contextData.profileInfo.username}
                </h2>
              </div>
              <div className="flex flex-col gap-16 overflow-y-scroll no-scrollbar grow justify-between">
                {!contextData.profileInfo.me && (
                  <div className="flex gap-8 flex-wrap text-txt-md py-4">
                    <FriendManagementButtons
                      approval={approval}
                      setApproval={setApproval}
                    />
                  </div>
                )}
                {!contextData.profileInfo.me && (
                  <div className="bg-stroke-sc min-h-[1px] w-full"></div>
                )}
                {!contextData.profileInfo.isUserBlocked ? (
                  <>
                    <div className="flex flex-col gap-16 text-gray mt-8">
                      <div className="flex justify-center gap-16">
                        <div className="flex items-center border rounded-lg border-stroke-sc p-8 gap-8">
                          <GiCrossedSwords className="text-green text-txt-2xl" />
                          <p>34</p>
                        </div>
                        <div className="flex items-center border rounded-lg border-stroke-sc p-8 gap-8">
                          <FaClover className="text-green text-txt-2xl" />
                          <p>72</p>
                        </div>
                      </div>
                      <div className="flex justify-center gap-16">
                        <div className="flex items-center border rounded-lg border-stroke-sc p-8 gap-8">
                          <GiFlamedLeaf className="text-green text-txt-2xl" />
                          <p>16</p>
                        </div>
                        <div className="flex items-center border rounded-lg border-stroke-sc p-8 gap-8">
                          <LiaMedalSolid className="text-green text-txt-2xl" />
                          <p>442</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-stroke-sc min-h-[1px] w-full"></div>
                    <div className="flex flex-col gap-8">
                      <h1 className="text-h-lg-md font-bold">about</h1>
                      <p
                        className={`text-txt-xs leading-16 ${contextData.profileInfo.about ? "text-gray" : "text-stroke-sc"}`}
                      >
                        {contextData.profileInfo.about
                          ? contextData.profileInfo.about
                          : "no about provided"}
                      </p>
                    </div>
                    <div className="bg-stroke-sc min-h-[1px] w-full"></div>
                    <div>
                      <img
                        className="w-[241px] h-[288px]"
                        src="/images/bmo.png"
                        alt="Player Character"
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-center text-txt-xs treacking-wide text-red normal-case grow flex items-center">
                    you can't see the content of this user while you are
                    blocking him
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col w-full overflow-hidden grow z-[1] gap-16">
              <div className="flex flex-col gap-32 md:items-start w-full items-center lg:min-h-[216px] relative">
                {contextData.profileInfo.me && (
                  <div
                    onClick={() => setUpdateProfile(true)}
                    className="absolute flex gap-8 items-center font-light text-gray top-0 right-0 text-md secondary-glass p-8 cursor-pointer"
                  >
                    <FiEdit3 className="text-green" />
                    <p className="text-txt-xs md:text-txt-md">edit profile</p>
                  </div>
                )}
                <div className="w-full flex gap-16 flex-col items-center lg:hidden">
                  <div className="flex h-[184px] flex-col gap-8 py-16 items-center">
                    <CircularProgressbarWithChildren
                      value={75}
                      className="w-[112px] h-[112px] bg-black bg-opacity-40 rounded-full flex"
                      strokeWidth={6}
                      styles={buildStyles({
                        strokeLinecap: "round",
                        pathColor: "#31E78B",
                        trailColor: "rgba(80,80,80,0.2)",
                      })}
                    >
                      <div className="w-[98px] h-[98px] flex justify-center rounded-full overflow-hidden">
                        <img
                          src={
                            contextData.profileInfo &&
                            contextData.profileInfo.profile_image
                              ? `${BACKENDURL}${contextData.profileInfo.profile_image}?t=${new Date().getTime()}`
                              : "/images/default.jpeg"
                          }
                          alt="profile pic"
                          className="object-cover w-full"
                        />
                      </div>
                    </CircularProgressbarWithChildren>
                    <h1 className="text-h-sm-sm font-bold">{`${contextData.profileInfo.first_name} ${contextData.profileInfo.last_name}`}</h1>
                    <h2 className="text-txt-xs normal-case">
                      @{contextData.profileInfo.username}
                    </h2>
                  </div>
                  {!contextData.profileInfo.me && (
                    <div className="flex gap-8 items-end text-txt-xs">
                      <FriendManagementButtons
                        approval={approval}
                        setApproval={setApproval}
                      />
                    </div>
                  )}
                </div>
                {!contextData.profileInfo.isUserBlocked && (
                  <div className="flex md:flex-row flex-col-reverse gap-16 grow lg:hidden w-full items-center">
                    <div className="flex w-[213px] items-center justify-center">
                      <img
                        className="flex w-[140px] h-[166px]"
                        src="/images/bmo.png"
                        alt="Player Caractere"
                      />
                    </div>
                    <div className="flex flex-col gap-16 max-w-[432px] md:items-start items-center md:text-left text-center">
                      <h1 className="text-h-sm-sm font-bold">about</h1>
                      <p
                        className={`text-txt-xs leading-16 ${contextData.profileInfo.about ? "text-gray" : "text-stroke-sc"}`}
                      >
                        {contextData.profileInfo.about
                          ? contextData.profileInfo.about
                          : "no about provided"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {!contextData.profileInfo.isUserBlocked ? (
                <>
                  <div className="flex w-full">
                    {profileMenu.map((menu) => (
                      <div
                        key={menu}
                        className={`grow flex flex-col gap-8 items-center cursor-pointer md:text-h-lg-sm text-txt-xs font-bold`}
                        onClick={() => handleNavigation(menu)}
                        // onClick={() => setSelectedMenu(menu)}
                      >
                        <span>{menu}</span>
                        {selectedMenu === menu && (
                          <div className="bg-green h-[2px] w-full"></div>
                        )}
                      </div>
                    ))}
                  </div>
                  {selectedMenu === "overview" && <ProfileOverview />}
                  {selectedMenu === "statistics" && <ProfileStatistics />}
                  {selectedMenu === "achievements" && <ProfileAchievements />}
                  {selectedMenu === "friends" && (
                    <ProfileFriends username={username} />
                  )}
                </>
              ) : (
                <p className="h-full flex flex-col text-center text-txt-xs text-red justify-center normal-case">
                  you can't see the content of this user while you are blocking
                  him
                </p>
              )}
            </div>
          </div>
          {approval.visible && (
            <Approval approval={approval} setApproval={setApproval} />
          )}
        </div>
      )}
      {authContextData.globalMessage.message && (
        <Toast
          message={authContextData.globalMessage.message}
          error={authContextData.globalMessage.isError}
          onClose={authContextData.setGlobalMessage}
          position="topCenter"
        />
      )}
    </div>
  );
};

const Approval = ({ approval, setApproval }) => {
  const contextData = useContext(UserContext);

  const handleApproval = () => {
    if (approval.type === "block") contextData.blockFriend();
    else if (approval.type === "unfriend") contextData.unfriend();
    setApproval({ visible: false, message: null, type: null });
  };

  return (
    <>
      <div
        onClick={() =>
          setApproval({ visible: false, message: null, type: null })
        }
        className="bg-black/50 h-full w-full absolute top-0 left-0 flex justify-center items-center"
      ></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="secondary-glass p-16 px-32 flex flex-col items-center gap-32 z-[10]">
          <div className="flex flex-col gap-8 w-full items-center">
            <h2 className="font-bold text-txt-lg text-red">{approval.type}?</h2>
            <p className="text-txt-md lowercase">{approval.message}</p>
          </div>
          <div className="flex gap-16">
            <button
              onClick={() =>
                setApproval({ visible: false, message: null, type: null })
              }
              className="
								px-16 py-8 bg-red rounded-md hover-secondary text-green font-semibold hover:bg-green hover:text-black
								transition-all
							"
            >
              cancel
            </button>
            <button
              onClick={handleApproval}
              className="
								px-16 py-8 bg-red rounded-md hover-secondary text-red font-semibold hover:bg-red hover:text-white
								transition-all
							"
            >
              confirm
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
