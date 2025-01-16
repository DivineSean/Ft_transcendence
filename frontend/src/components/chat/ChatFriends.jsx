import FriendsChat from "./FriendChat";

const ChatFriends = ({ uid, friendsData }) => {
  const friends = [];

  console.log(friendsData);

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
        no conversation friends
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
