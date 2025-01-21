/**
	=> nadi f serve
	=> kay3sser flwe9t
	=> rimontada
	=> lmlawi la markiti 3lih
 */

import { useContext, useEffect } from "react";
import UserContext from "../../context/UserContext";

const ProfileAchievements = ({ username }) => {
  const contextData = useContext(UserContext);

  useEffect(() => {
    contextData.getProfileAchievements(username);
  }, []);

  return (
    <div className="flex flex-col gap-32 overflow-y-auto no-scrollbar">
      {contextData.profileAchievements && (
        <>
          {contextData.profileAchievements.map((game) => (
            <div className="bg-gray/5 rounded-lg p-16" key={game.id}>
              <div className="flex flex-col gap-16">
                <h1 className="font-semibold tracking-wider text-gray/80 text-txt-lg">
                  {game.name}
                </h1>
                <div className="grid gap-16 grid-cols-1">
                  {game.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex flex-col gap-16 p-8 rounded-lg overflow-hidden hover-secondary border-[0.5px] border-stroke-sc"
                    >
                      <div className="flex justify-between gap-16">
                        <div className="flex gap-16 items-center">
                          <div className="min-h-64 max-h-64 min-w-64 max-w-64 flex rounded-full border-[0.5px] border-stroke-sc bg-black/50">
                            <img
                              src={`/images/achievement/icons/${achievement.name}.png`}
                              alt={`achivement image of ${achievement.name}`}
                              className="grow"
                            />
                          </div>
                          <div className="flex flex-col">
                            <h2 className="font-semibold text-white/90 tracking-wider">
                              {achievement.name}
                            </h2>
                            <p className="text-gray/60 text-txt-sm">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-8">
                        {achievement.user_achievements.map(
                          (userAchievement, index) => (
                            <div
                              className={`bg-black/40 p-16 rounded-lg flex flex-col gap-16`}
                              key={index}
                            >
                              <div
                                className={`flex gap-16 items-center ${!userAchievement.threshold && "grayscale-[100%] contrast-50"}`}
                              >
                                <div className="flex gap-8 items-end">
                                  <div className="h-40 w-40 flex">
                                    <img
                                      src={`/images/achievement/badges/${userAchievement.level}.png`}
                                      alt=""
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-col grow">
                                  <h3>{userAchievement.level}</h3>
                                  <div className="h-[6px] grow rounded-full overflow-hidden border-[0.5px] border-black/60 bg-black/50">
                                    {userAchievement.progress &&
                                      userAchievement.threshold && (
                                        <div
                                          className="bg-green/30 h-full"
                                          style={{
                                            width: `${(userAchievement.progress / userAchievement.threshold) * 100}%`,
                                          }}
                                        ></div>
                                      )}
                                  </div>
                                </div>
                                <p className="text-txt-xs text-gray/70">
                                  {userAchievement.progress}/
                                  {userAchievement.threshold}
                                </p>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
			{!contextData.profileAchievements && <p className="text-center py-32 text-stroke-sc">no achivements.</p>}
    </div>
  );
};

export default ProfileAchievements;
