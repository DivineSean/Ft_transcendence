import { useNavigate } from "react-router-dom";

const RankedUsers = ({
  rank,
  username,
  demote,
  rating,
  promote,
  lvl,
  ranked,
	isSelf,
}) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate(`/profile/overview/${username}`);
  };


  return (
    <div className={`${isSelf ? 'bg-green/10' : 'bg-gray/5'} grid lg:grid-cols-5 grid-cols-4 gap-32 text-center items-center hover:bg-white/10 rounded-lg py-8 transition-all duration-200`}>
      <p>{rank}</p>
      <p
        className="cursor-pointer hover:text-green transition-colors duration-200"
        onClick={handleProfileClick}
      >
        {username.length > 10 ? `${username.substring(0, 10)}...` : username}
      </p>
      <p
        className="hidden lg:block cursor-pointer hover:text-green transition-colors duration-200"
        onClick={handleProfileClick}
      >
        {lvl}
      </p>
      <p
        className="lg:block hidden cursor-pointer hover:text-green transition-colors duration-200"
        onClick={handleProfileClick}
      >
        {demote}/{rating}/{promote}
      </p>
      <p className="lg:hidden block">{rating}</p>
      <p
        className="cursor-pointer hover:text-green transition-colors duration-200"
        onClick={handleProfileClick}
      >
        {ranked}
      </p>
    </div>
  );
};
export default RankedUsers;