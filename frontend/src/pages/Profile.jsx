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
import { useNavigate } from 'react-router-dom';
import "react-circular-progressbar/dist/styles.css";
import { BACKENDURL } from "../utils/fetchWrapper";
import LoadingPage from "./LoadingPage";
import UserContext from "../context/UserContext";
import { FiEdit3 } from "react-icons/fi";
import UpdateProfile from "../components/profile/UpdateProfile";

const profileMenu = ["overview", "statistics", "achievements", "friends"];

const Profile = () => {
  const { displayMenuGl } = useContext(AuthContext);
  const { section, username } = useParams();
	const [udpateProfile, setUpdateProfile] = useState(false);
	const navigate = useNavigate();
	const userUsername = username ? username : 0;
	const [selectedMenu, setSelectedMenu] = useState(section ? section : 'overview');
	const contextData = useContext(UserContext);
	

	if (!section)
		navigate('/profile/overview');
	useEffect(() => {
		if (!profileMenu.includes(section)) {
			navigate('/profile/overview');
			setSelectedMenu('overview');
		}
	}, []);

	useEffect(() => {
		if (userUsername)
			contextData.getProfile(userUsername);
	}, [username]);

	return (
    <div className="flex flex-col grow lg:gap-32 gap-16 relative">
      <Header link="profile" />
			{!contextData.profileInfo && <LoadingPage />}
      {!displayMenuGl && contextData.profileInfo && (
        <div className="container">
					{udpateProfile && <UpdateProfile setUpdateProfile={setUpdateProfile}/>}
          <div className="flex primary-glass p-16 lg:gap-32 gap-16 relative overflow-hidden get-height">
            <div className="absolute top-0 left-0 w-full lg:h-[232px] h-[216px]">
              <div className="w-full h-full absolute cover-gradient"></div>
              <img
                className="object-cover w-full h-full object-center"
                src="/images/profile-cover.webp"
                alt="Profile Cover image"
              />
            </div>
            <div className="lg:flex hidden flex-col secondary-glass p-16 gap-16 min-w-[320px] max-w-[320px]">
              <div
								className="flex flex-col gap-8 items-center justify-center"
								
							>
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
												contextData.userInfo && contextData.userInfo.profile_image
												? `${BACKENDURL}${contextData.userInfo.profile_image}?t=${new Date().getTime()}`
												: "/images/default.jpeg"
											}
											alt="profile pic"
											className="object-cover w-full"
										/>
									</div>
                </CircularProgressbarWithChildren>
                <h1 className="text-h-lg-md font-bold">{`${contextData.profileInfo.first_name} ${contextData.profileInfo.last_name}`}</h1>
                <h2 className="text-txt-md lowercase">@{contextData.profileInfo.username}</h2>
              </div>
              <div className="flex flex-col gap-16 overflow-y-scroll no-scrollbar">
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
              </div>
            </div>
            <div className="flex flex-col grow z-[1] gap-16">
              <div className="flex flex-col gap-32 md:items-start items-center lg:min-h-[216px] relative">
							<div
								onClick={() => setUpdateProfile(true)}
								className="absolute flex gap-8 items-center font-light text-gray top-0 right-0 text-md secondary-glass p-8 cursor-pointer"
							>
								<FiEdit3 className="text-green"/>
								<p className="md:block hidden">edit profile</p>
							</div>
							<div className="flex h-[184px] flex-col gap-8 py-16 items-center lg:hidden">
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
													contextData.userInfo && contextData.userInfo.profile_image
													? `${BACKENDURL}${contextData.userInfo.profile_image}?t=${new Date().getTime()}` 
													: "/images/default.jpeg"
												}
												alt="profile pic"
												className="object-cover w-full"
											/>
										</div>
                  </CircularProgressbarWithChildren>
                  <h1 className="text-h-sm-sm font-bold">{`${contextData.profileInfo.first_name} ${contextData.profileInfo.last_name}`}</h1>
                  <h2 className="text-txt-xs">@{contextData.profileInfo.username}</h2>
                </div>
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
              </div>
              <div className="flex">
                {profileMenu.map((menu) => (
                  <Link
                    to={`/profile/${menu}/${username !== undefined ? username : ''}`}
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
              {selectedMenu === "friends" && <ProfileFriends />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
