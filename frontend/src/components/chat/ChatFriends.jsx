import FriendsChat from "./FriendChat";

const ChatFriends = ({ uid, friendsData }) => {
  const friends = [];

  if (friendsData && friendsData.users && friendsData.users.length) {
    friendsData.users.map((friend) => {
      return friends.push(
        <FriendsChat
          uid={uid}
          friendInfo={friend}
          messages={3}
          key={friend.conversationId}
        />,
      );
    });
  } else {
    friends.push(
      <div key={0} className="text-stroke-sc text-center">
        No friends to chat with yet
      </div>,
    );
  }

  return (
    <div className="h-14 flex grow flex-col gap-8 overflow-y-scroll no-scrollbar">
      {friends}
    </div>
  );
};

export default ChatFriends;
