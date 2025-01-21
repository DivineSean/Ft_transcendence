import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FetchWrapper from "../utils/fetchWrapper";
import AuthContext from "./AuthContext";
import NotifContext from "./NotifContext";
import UpcomingTournament from "@/components/home/UpcomingTournament";

const UserContext = createContext();

export default UserContext;

export const UserProvider = ({ children }) => {
  const notifContextData = useContext(NotifContext);
  const authContextData = useContext(AuthContext);
  const FetchData = new FetchWrapper();
  const navigate = useNavigate();
  const [generalLoading, setGeneralLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [profileInfo, setProfileInfo] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [userFriends, setUserFriends] = useState(null);
  const [userFriendRequest, setUserFriendRequest] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState(null);
  const [onlineMatches, setOnlineMatches] = useState(null);
  const [upcomingTournament, setUpcomingTournament] = useState(null);
  const [status, setStatus] = useState(null);
  const [profileAchievements, setProfileAchievements] = useState(null);

  const getUserInfo = async () => {
    try {
      const res = await FetchData.get(`api/profile/`);
      if (res.ok) {
        const data = await res.json();
        setUserInfo(data);
        setProfileImage(data.profile_image);
        authContextData.setIsUserLoggedIn(true);
        setGeneralLoading(false);
      } else {
        if (res.status === 401) {
          authContextData.setGlobalMessage({
            message: "Unauthorized user. Access denied.",
            isError: true,
          });
          navigate("/login");
        }
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  const getProfile = async (username) => {
    // i did this to make the username None (not undefined)
    // cause the backend trigger it as invalid username
    let url;
    if (username) url = `api/profile/${username}`;
    else url = `api/profile/`;

    try {
      const res = await FetchData.get(url);
      if (res.ok) {
        const data = await res.json();
        if (!data.found) {
          authContextData.setGlobalMessage({
            message: "User not found.",
            isError: true,
          });
          navigate("/profile/overview");
        }
        setProfileInfo(data);
      } else if (res.status === 400) {
        const data = await res.json();
        authContextData.setGlobalMessage({
          message: data.error,
          isError: true,
        });
        navigate("/profile/overview");
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  const updateProfileImage = (newImageUrl) => {
    setProfileImage(newImageUrl);
    setUserInfo((prevUserInfo) => ({
      ...prevUserInfo,
      profile_image: newImageUrl,
    }));
  };

  const getFriends = async (username) => {
    const url = username ? `api/friends/${username}` : `api/friends/`;
    try {
      const res = await FetchData.get(url);
      if (res.ok) {
        const data = await res.json();
        setUserFriends(data);
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  const getFriendRequest = async () => {
    try {
      const res = await FetchData.get("api/friendrequests/");
      if (res.ok) {
        const data = await res.json();
        setUserFriendRequest(data);
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  const sendFriendRequest = async (id) => {
    try {
      const res = await FetchData.post("api/friendrequest/send/", {
        userId: id,
      });
      if (res.ok) {
        const data = await res.json();
        setRefresh(true);
        notifContextData.setFriendRequest(true);

        authContextData.setGlobalMessage({
          message: data.message,
          isError: false,
        });
      } else if (res.status === 400) {
        const data = await res.json();
        setRefresh(true);
        notifContextData.setFriendRequest(true);

        authContextData.setGlobalMessage({
          message: data.error,
          isError: true,
        });
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  const cancelFriendRequest = async () => {
    try {
      const res = await FetchData.post("api/friendrequest/cancel/", {
        userId: profileInfo.id,
      });
      if (res.ok) {
        const data = await res.json();
        setRefresh(true);
        authContextData.setGlobalMessage({
          message: data.message,
          isError: false,
        });
      } else if (res.status === 400) {
        const data = await res.json();
        setRefresh(true);
        authContextData.setGlobalMessage({
          message: data.error,
          isError: true,
        });
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  const acceptFriendRequest = async (userId) => {
    try {
      const res = await FetchData.post("api/friendrequest/accept/", {
        userId: userId,
      });
      if (res.ok) {
        const data = await res.json();
        setRefresh(true);

        authContextData.setGlobalMessage({
          message: data.message,
          isError: false,
        });
      } else if (res.status === 400) {
        const data = await res.json();
        setRefresh(true);

        authContextData.setGlobalMessage({
          message: data.error,
          isError: true,
        });
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  const declineRequest = async (userId) => {
    try {
      const res = await FetchData.post("api/friendrequest/decline/", {
        userId: userId,
      });
      if (res.ok) {
        const data = await res.json();
        setRefresh(true);
        authContextData.setGlobalMessage({
          message: data.message,
          isError: false,
        });
      } else if (res.status === 400) {
        const data = await res.json();
        setRefresh(true);
        authContextData.setGlobalMessage({
          message: data.error,
          isError: true,
        });
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  const unfriend = async () => {
    try {
      const res = await FetchData.post("api/friend/unfriend/", {
        userId: profileInfo.id,
      });
      if (res.ok) {
        const data = await res.json();
        setRefresh(true);
        authContextData.setGlobalMessage({
          message: data.message,
          isError: false,
        });
      } else if (res.status === 400) {
        const data = await res.json();
        setRefresh(true);
        authContextData.setGlobalMessage({
          message: data.error,
          isError: true,
        });
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  const blockFriend = async () => {
    try {
      const res = await FetchData.post("api/friend/block/", {
        userId: profileInfo.id,
      });
      if (res.ok) {
        const data = await res.json();
        setRefresh(true);
        authContextData.setGlobalMessage({
          message: data.message,
          isError: false,
        });
      } else if (res.status === 400) {
        const data = await res.json();
        setRefresh(true);
        authContextData.setGlobalMessage({
          message: data.error,
          isError: true,
        });
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  const unblockUser = async (userId) => {
    try {
      const res = await FetchData.post("api/user/unblock/", {
        userId: userId,
      });
      if (res.ok) {
        const data = await res.json();
        setRefresh(true);
        authContextData.setGlobalMessage({
          message: data.message,
          isError: false,
        });
      } else if (res.status === 400) {
        const data = await res.json();
        setRefresh(true);
        authContextData.setGlobalMessage({
          message: data.error,
          isError: true,
        });
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  const createConversation = async () => {
    try {
      const res = await FetchData.post("api/chat/conversations/", {
        userId: profileInfo.id,
      });
      if (res.ok) {
        const data = await res.json();
        navigate(`/chat/${data.conversationId}`);
      } else if (res.status === 400) {
        const data = await res.json();
        setRefresh(true);
        authContextData.setGlobalMessage({
          message: data.error,
          isError: true,
        });
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  const getBlockedUsers = async () => {
    try {
      const res = await FetchData.get("api/users/blocked/");
      if (res.ok) {
        const data = await res.json();
        setBlockedUsers(data);
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  const getProfileAchievements = async (username) => {
    const url = username
      ? `api/user/achievements/${username}`
      : `api/user/achievements/`;
    try {
      const res = await FetchData.get(url);
      if (res.ok) {
        const data = await res.json();
        setProfileAchievements(data.games);
      } else if (res.status === 400) {
        const data = await res.json();
        authContextData.setGlobalMessage({
          message: data.error,
          isError: true,
        });
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  const getOnlineMatches = async () => {
    try {
      const res = await FetchData.get("api/matches/");
      if (res.ok) {
        const data = await res.json();
        setOnlineMatches(data);
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  const getUpcomingTournament = async () => {
    try {
      const res = await FetchData.get("api/tournaments/upcoming/");
      if (res.ok) {
        const data = await res.json();
        setUpcomingTournament(data);
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  const get_rankings = async (game, setRankings, offset) => {
    try {
      const res = await FetchData.get(`api/rankings/${game}/${offset}/`);
      if (res.ok) {
        const data = await res.json();
        setRankings(data);
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  const getStats = async (game, username) => {
    const url = username
      ? `api/profile/stats/${game}/${username}`
      : `api/profile/stats/${game}`;
    try {
      const res = await FetchData.get(url);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (error) {
      authContextData.setGlobalMessage({
        message: error.message,
        isError: true,
      });
    }
  };

  const contextData = {
    status,
    onlineMatches,
	upcomingTournament,
    profileAchievements,
    blockedUsers,
    refresh,
    userFriendRequest,
    userFriends,
    userInfo,
    profileInfo,
    generalLoading,
    getUserInfo,
    getProfile,
    setProfileInfo,
    setProfileImage,
    setUserInfo,
    updateProfileImage,
    getFriends,
    getFriendRequest,
    setUserFriends,
    setRefresh,

    sendFriendRequest,
    cancelFriendRequest,
    acceptFriendRequest,
    declineRequest,
    blockFriend,
    unfriend,
    unblockUser,
    createConversation,
    getBlockedUsers,

    getOnlineMatches,
    get_rankings,
    getStats,
    getProfileAchievements,
	
	getUpcomingTournament,
  };

  return (
    <UserContext.Provider value={contextData}>{children}</UserContext.Provider>
  );
};
