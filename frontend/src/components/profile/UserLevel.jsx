const UserLevel = ({ exp, level, percentage, isMobile }) => {
  return (
    <div
      className={`bg-black/20 p-8 rounded-lg border-[0.5px] border-stroke-sc flex w-full ${isMobile && "w-full lg:hidden secondary-glass"}`}
    >
      <div className="flex gap-8 grow">
        <div
          className={`w-[80px] flex justify-center items-end overflow-hidden pointer-events-none`}
        >
          <img
            className={` object-cover grow h-full w-full`}
            src={`/images/badges/lvl${level}.png`}
            alt={`lvl1`}
          />
        </div>
        <div className="flex flex-col grow gap-8 justify-center">
          <div className="flex justify-between items-end">
            <p className="font-bold tracking-wider">level {level}</p>
            <p className="tracking-wide text-gray text-txt-xs flex gap-4">
              {exp}
              <span className="font-semibold uppercase text-green">xp</span>
            </p>
          </div>
          <div className="h-8 w-full bg-black/50 rounded-full overflow-hidden border-[0.5px] border-black/50">
            <div
              className="h-full bg-green/90 transition-all"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLevel;
