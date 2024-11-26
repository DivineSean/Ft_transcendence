import FriendsChat from "./FriendChat";

const ChatFriends = ({uid, friendsData, ws, displayTyping}) => {

	const friends = [];

	// console.log('friendchat -------', friendsData);
	if (friendsData && friendsData.users && friendsData.users.length) {
		friendsData.users.map(friend => {
			// console.log(friend);
			return (friends.push(
				<FriendsChat
					uid={uid}
					ws={ws}
					displayTyping={displayTyping}
					friendInfo={friend}
					messages={3}
					key={friend.conversationId}
				/>
			))
		})
	}
	else {
		friends.push(<div key={0} className="text-stroke-sc text-center">no conversation friends</div>)
	}

	// console.log('friends', friends);
	return (
		<div className="h-14 flex grow flex-col gap-8 overflow-y-scroll no-scrollbar">
			{friends}
		</div>
	)
}

export default ChatFriends;