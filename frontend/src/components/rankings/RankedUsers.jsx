import { useNavigate } from "react-router-dom";

const RankedUsers = ({ rank, username, rating, lvl, ranked, isSelf }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate(`/profile/overview/${username}`);
  };

  return (
    <div
      onClick={handleProfileClick}
      className={`${isSelf ? "bg-green/10 hover:bg-green/20 border border-green/50" : "bg-gray/5"} text-gray cursor-pointer grid lg:grid-cols-5 grid-cols-4 gap-32  text-center items-center hover:bg-white/10 rounded-lg py-8 transition-all`}
    >
      <p className="font-bold">{rank}</p>
      <p className="lowercase">
        @
        {username && username.length > 10
          ? `${username.substring(0, 10)}...`
          : username}
      </p>
      <p className="hidden lg:block">{lvl}</p>
      <p className="">{rating}</p>
      <div className="flex justify-center">
        <img
          src={`/images/rating/${ranked}.png`}
          className="w-24 md:w-32 pointer-events-none"
          alt="Rating level"
        />
      </div>
    </div>
  );
};
export default RankedUsers;
