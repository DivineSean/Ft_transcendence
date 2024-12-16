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

const FriendManagementButtons = () => {
	const contextData = useContext(UserContext);

	return (
		<>
			{	!contextData.profileInfo.isBlockedByUser &&
				!contextData.profileInfo.isUserBlocked &&
				contextData.profileInfo.isFriend &&
				<button className="secondary-glass grow lg:w-full p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-green/60 hover:text-black rounded-md text-green font-semibold tracking-wide">
					<IoChatbubbleEllipsesOutline />
					<p>message</p>
				</button>
			}

			{	!contextData.profileInfo.isBlockedByUser &&
				!contextData.profileInfo.isUserBlocked &&
				!contextData.profileInfo.isFriend &&
				!contextData.profileInfo.isSentRequest &&
				<button className="secondary-glass grow p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-green/60 hover:text-black rounded-md text-green font-semibold tracking-wide">
					<IoMdPersonAdd />
					<p>add</p>
				</button>
			}

			{	!contextData.profileInfo.isBlockedByUser &&
				!contextData.profileInfo.isUserBlocked &&
				!contextData.profileInfo.isFriend &&
				contextData.profileInfo.isSentRequest &&
				<>
					<button className="secondary-glass grow p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-green/60 hover:text-black rounded-md text-green font-semibold tracking-wide">
						<ImUserPlus />
						<p>confirm</p>
					</button>
					<button className="secondary-glass grow p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-red/60 hover:text-white rounded-md text-red font-semibold tracking-wide">
						<ImUserMinus />
						<p>delete</p>
					</button>
				</>
			}

			{	!contextData.profileInfo.isBlockedByUser &&
				contextData.profileInfo.isUserBlocked &&
				<>
					<button className="secondary-glass grow p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-green/60 hover:text-black rounded-md text-green font-semibold tracking-wide">
						<ImUserMinus />
						<p>unblock</p>
					</button>
					{/* <p className="text-center normal-case text-txt-xs text-red">this user have been blocked by you click to unblock</p> */}
				</>
			}

			{	!contextData.profileInfo.isBlockedByUser &&
				!contextData.profileInfo.isUserBlocked &&
				contextData.profileInfo.isFriend &&
				<button className="secondary-glass grow p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-red/60 hover:text-white rounded-md text-red font-semibold tracking-wide">
					<ImUserMinus />
					<p>unfriend</p>
				</button>
			}

			{	!contextData.profileInfo.isBlockedByUser && 
				!contextData.profileInfo.isUserBlocked &&
				contextData.profileInfo.isFriend &&
				<button className="secondary-glass text-txt-sm p-8 px-16 transition-all flex gap-4 justify-center items-center hover:bg-red/60 hover:text-white rounded-md text-red font-semibold tracking-wide">
					<MdOutlineBlock />
					<p>block</p>
				</button>
			}
		</>
	)
}

const Profile = () => {
  const authContextData = useContext(AuthContext);
  const { section, username } = useParams();
  const [udpateProfile, setUpdateProfile] = useState(false);
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState(
    section ? section : "overview",
  );
  const contextData = useContext(UserContext);

  if (!section) navigate("/profile/overview");
  useEffect(() => {
    if (!profileMenu.includes(section)) {
      navigate("/profile/overview");
      setSelectedMenu("overview");
    }
  }, []);

	useEffect(() => {
		navigate(`/profile/${section}/${username ? username : ''}`);
		authContextData.setDisplayMenuGl(false);
		setSelectedMenu(section);
	}, [section]);

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
	
	useEffect(() => {
		if (contextData.profileInfo && contextData.profileInfo.found === 'no') {
			navigate("/profile/overview");
		}
	}, [contextData.profileInfo])

	// this is to know if the visited profile is the current user profile or not
	const me = (contextData.userInfo
		&& contextData.profileInfo
		&& contextData.userInfo.username === contextData.profileInfo.username );

  return (
    <div className="flex flex-col w-full grow lg:gap-32 gap-16 relative">
      <Header link="profile" />
			{authContextData.globalMessage.message && (
        <Toast
          message={authContextData.globalMessage.message}
          error={authContextData.globalMessage.isError}
          onClose={authContextData.setGlobalMessage}
					position='bottomRight'
        />
      )}
      {!contextData.profileInfo && <LoadingPage />}
      {!authContextData.displayMenuGl && contextData.profileInfo !== null && (
        <div className="container">
          {udpateProfile && (
            <UpdateProfile setUpdateProfile={setUpdateProfile} />
          )}
          <div className="flex primary-glass overflow-hidden p-16 w-full lg:gap-32 gap-16 relative  get-height">
            <div className={`absolute top-0 left-0 w-full lg:h-[232px] ${me ? 'h-[216px]' : 'h-[260px]'}`}>
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
                <h2 className="text-txt-md lowercase">
                  @{contextData.profileInfo.username}
                </h2>
              </div>
              <div className="flex flex-col gap-16 overflow-y-scroll no-scrollbar grow justify-between">
								{ !me &&
									<div className="flex gap-8 flex-wrap text-txt-md py-4">
										<FriendManagementButtons />
									</div>
								}
                { !me && <div className="bg-stroke-sc min-h-[1px] w-full"></div> }
								{!contextData.profileInfo.isUserBlocked ?
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
											<p className="text-txt-xs leading-16 text-gray">
												{contextData.profileInfo.about}
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
									</> :
									<p className="text-center text-txt-xs treacking-wide text-red normal-case grow flex items-center">you can't see the content of this user while you are blocking him</p>
								}
              </div>
            </div>
            <div className="flex flex-col w-full overflow-hidden grow z-[1] gap-16">
              <div className="flex flex-col gap-32 md:items-start w-full items-center lg:min-h-[216px] relative">
                {me &&
									<div
										onClick={() => setUpdateProfile(true)}
										className="absolute flex gap-8 items-center font-light text-gray top-0 right-0 text-md secondary-glass p-8 cursor-pointer"
									>
										<FiEdit3 className="text-green" />
										<p className="text-txt-xs md:text-txt-md">edit profile</p>
									</div>
								}
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
										<h2 className="text-txt-xs">
											@{contextData.profileInfo.username}
										</h2>
									</div>
									{ !me &&
										<div className="flex gap-8 items-end text-txt-xs">
											<FriendManagementButtons />
										</div>
									}
								</div>
								{!contextData.profileInfo.isUserBlocked &&
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
											<p className="text-txt-xs leading-16 text-gray">
												{contextData.profileInfo.about}
											</p>
										</div>
									</div>
								}
              </div>
							{!contextData.profileInfo.isUserBlocked ?
								<>
									<div className="flex w-full">
										{profileMenu.map((menu) => (
											<Link
												to={`/profile/${menu}/${username !== undefined ? username : ""}`}
												key={menu}
												className={`grow flex flex-col gap-8 items-center cursor-pointer md:text-h-lg-sm text-txt-xs font-bold`}
												onClick={() => setSelectedMenu(menu)}
											>
												<span>{menu}</span>
												{selectedMenu === menu && (
													<div className="bg-green h-[2px] w-full"></div>
												)}
											</Link>
										))}
									</div>
										{selectedMenu === "overview" && <ProfileOverview />}
										{selectedMenu === "statistics" && <ProfileStatistics />}
										{selectedMenu === "achievements" && <ProfileAchievements />}
										{selectedMenu === "friends" && <ProfileFriends username={username} />}
								</>
								:
								<p className="h-full flex flex-col text-center text-txt-xs text-red justify-center normal-case">
									you can't see the content of this user while you are blocking him
								</p>
							}
						</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
