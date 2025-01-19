import ProfileAchievements from "../components/profile/ProfileAchievements";
import ProfileStatistics from "../components/profile/ProfileStatistics";
import ProfileOverview from "../components/profile/ProfileOverview";
import ProfileFriends from "../components/profile/ProfileFriends";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import "react-circular-progressbar/dist/styles.css";
import { BACKENDURL } from "../utils/fetchWrapper";
import LoadingPage from "./LoadingPage";
import UserContext from "../context/UserContext";
import { FiEdit3 } from "react-icons/fi";
import UpdateProfile from "../components/profile/UpdateProfile";
import Toast from "../components/Toast";
import FriendManagementButtons from "../components/profile/FriendManagementButtons";
import Approval from "../components/profile/Approval";
import UserLevel from "../components/profile/UserLevel";

const profileMenu = ["overview", "statistics", "achievements", "friends"];

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
  useEffect(() => {
    if (!profileMenu.includes(section)) {
      navigate("/profile/overview");
      setSelectedMenu("overview");
    }
    return () => {
      authContextData.setGlobalMessage({ message: "", isError: true });
    };
  }, []);

  useEffect(() => {
    if (section !== selectedMenu) {
      setSelectedMenu(section);
      authContextData.setDisplayMenuGl(false);
    }
  });

  useEffect(() => {
    if (username) {
      contextData.getProfile(username);
      contextData.getStats("pong", username);
      contextData.setProfileInfo(null);
      contextData.setUserFriends(null);
    } else {
      contextData.getStats("pong", username);
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
      navigate("/profile/overview");
    }
  }, [contextData.profileInfo && contextData.profileInfo.found]);

  useEffect(() => {
    // update the profile info after hit any profile button
    if (contextData.refresh) {
      if (username) {
        contextData.getProfile(username);
        contextData.getStats("pong", username);
        contextData.setRefresh(false);
      } else {
        contextData.getProfile();
        contextData.getStats("pong", username);
        contextData.setRefresh(false);
      }
    }
  }, [contextData.refresh]);

  return (
    <div className="flex flex-col w-full grow lg:gap-32 gap-16 relative">
      <Header link="profile" />
      {authContextData.globalMessage &&
        authContextData.globalMessage.message && <Toast position="topCenter" />}
      {(!contextData.profileInfo || !contextData.status.stats) && <LoadingPage />}
      {!authContextData.displayMenuGl && contextData.profileInfo !== null && (
        <div className="container">
          {udpateProfile && (
            <UpdateProfile setUpdateProfile={setUpdateProfile} />
          )}
          <div className="flex primary-glass overflow-hidden p-16 w-full gap-16 relative get-height">
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
            <div className="lg:flex hidden flex-col w-full secondary-glass p-16 gap-16 min-w-[320px] max-w-[320px] relative">
              <div className="flex flex-col gap-8 items-center justify-center p-8">
                <div className="w-[104px] h-[104px] flex justify-center rounded-full overflow-hidden border-[0.5px] border-stroke-sc">
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
                <h1 className="text-h-lg-md font-bold max-w-[200px] truncate">{`${contextData.profileInfo.first_name} ${contextData.profileInfo.last_name}`}</h1>
                <h2 className="text-txt-md normal-case max-w-[120px] truncate">
                  @{contextData.profileInfo.username}
                </h2>
              </div>
              <div className="flex flex-col gap-16">
                {!contextData.profileInfo.me && (
                  <div className="flex gap-8 flex-wrap text-txt-md py-4">
                    <FriendManagementButtons
                      approval={approval}
                      setApproval={setApproval}
                    />
                  </div>
                )}
                {contextData.profileInfo && (
                  <UserLevel
                    exp={contextData.profileInfo.exp}
                    level={contextData.profileInfo.level}
                    percentage={contextData.profileInfo.percentage}
                  />
                )}
              </div>

              <div className="flex flex-col grow justify-between mt-16 overflow-y-auto no-scrollbar">
                {!contextData.profileInfo.isUserBlocked ? (
                  <>
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
              <div className="flex flex-col gap-32 md:items-start w-full items-center lg:min-h-[216px] relative lg:justify-end lg:p-16">
                {contextData.profileInfo.me && (
                  <button
                    onClick={() => setUpdateProfile(true)}
                    className="absolute items-center text-gray tracking-wide top-0 right-0
												secondary-glass p-8 px-12 transition-all flex gap-8
												justify-center items-center hover:bg-green/60 lg:text-txt-md text-txt-sm
												hover:text-black rounded-md text-green font-semibold tracking-wide
											"
                  >
                    <FiEdit3 className="text-green" />
                    <p className="text-txt-xs md:text-txt-md">edit profile</p>
                  </button>
                )}
                <div className="w-full flex gap-16 flex-col items-center lg:hidden">
                  <div className="flex h-[184px] flex-col gap-8 py-16 items-center">
                    <div className="min-w-[98px] max-w-[98px] min-h-[98px] max-h-[98px] flex justify-center rounded-full overflow-hidden border-[0.5px] border-stroke-sc">
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
                    <h1 className="text-h-sm-sm font-bold max-w-[160px] truncate">{`${contextData.profileInfo.first_name} ${contextData.profileInfo.last_name}`}</h1>
                    <h2 className="text-txt-xs normal-case max-w-[120px] truncate">
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
                {contextData.profileInfo && (
                  <UserLevel
                    exp={contextData.profileInfo.exp}
                    level={contextData.profileInfo.level}
                    percentage={contextData.profileInfo.percentage}
                    isMobile={true}
                  />
                )}
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
                  {selectedMenu === "overview" && contextData.status.stats && <ProfileOverview />}
                  {selectedMenu === "statistics" && contextData.status.stats && <ProfileStatistics />}
                  {selectedMenu === "achievements" && contextData.status.stats && (
                    <ProfileAchievements username={username} />
                  )}
                  {selectedMenu === "friends" && contextData.status.stats && (
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
    </div>
  );
};

export default Profile;
