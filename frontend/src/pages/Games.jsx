import GameManager from "../games/GameManager";
import Match from "../games/Matchmaking";
import Header from "../components/Header"
import { useState, useRef, useEffect } from "react"

const GameCard = ({ image, name, description }) => {

    useEffect(() => console.log(name, description), [])
    return (
        <div
            className="flex-shrink-0 p-32 w-full h-full rounded-lg bg-green flex gap-32 flex-col justify-end bg-gradient-to-t from-black/[0.8] to-transparent"
            style={{
                backgroundImage: "linear-gradient(to top, black, transparent), url('https://mir-s3-cdn-cf.behance.net/project_modules/fs/05daa256209423.59a540cb340e6.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <span className="text-h-lg-3xl font-bold">{name}</span>
            <div className="flex justify-between items-end min-h-[6rem]">
                <span className="h-full text-txt-2xl">{description}</span>
                <span className="flex gap-8">
                    <button>Play Now</button>
                    <span>---</span>
                </span>
            </div>
        </div>
    )
}

const Games = () => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const sliderRef = useRef(null)
    const intervalRef = useRef(null)
    const games = [
        {
            name: "Pong",
            description: "wa7d l game nadia bjehd"
        },
        {
            name: "Pong",
            description: "wa7d l game nadia bjehd"
        }

    ]

    const updateSliderPosition = (index) => {
        setCurrentIndex(index);
        const gameCardWidth = sliderRef.current.offsetWidth;
        // calculate offset using the card's width + gap (in this case 16px)
        const offset = index * (16 + gameCardWidth)
        sliderRef.current.style.transform = `translateX(-${offset}px)`;
    };

    const autoSlide = () => {
        setCurrentIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % games.length;
            updateSliderPosition(nextIndex);
            return nextIndex;
        })
    }

    // useEffect(() => {
    //     intervalRef.current = setInterval(autoSlide, 5000);
    //
    //     return () => clearInterval(intervalRef.current);
    // }, []);

    return (
        <div className="flex flex-col grow">
            <Header link="games" />
            <div className="backdrop-blur-sm w-full h-full absolute top-0 right-0"></div>
            <div className="container md:px-16 px-0">
                <div className="primary-glass p-32 flex flex-col gap-16 grow">

                    {/* Games Slider */}
                    <div className="h-full rounded-lg overflow-hidden">
                        <div
                            className="h-full p-0 rounded-lg flex gap-16 transition-transform duration-1000 ease-in-out"
                            ref={sliderRef}
                        >
                            {
                                games.map((game, index) => (
                                    <GameCard key={index} {...game} />
                                ))
                            }
                        </div>
                    </div>

                    {/* Slider buttons */}
                    <div className="p-8 flex gap-8 justify-center items-center">
                        {
                            games.map((_, index) => (

                                <button
                                    key={index}
                                    onClick={() => {
                                        if (index !== currentIndex) {
                                            updateSliderPosition(index)
                                            clearInterval(intervalRef.current)
                                            intervalRef.current = setInterval(autoSlide, 5000)
                                        }
                                    }}
                                    className={`rounded-full ${index === currentIndex ? "w-[30px] bg-green" : "w-12 bg-[#288A58]"}
                                                h-12 transition-all duration-1000 ease-in-out`}
                                >
                                </button>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
        // <GameManager />
        // <Match />
    );
};

export default Games;
