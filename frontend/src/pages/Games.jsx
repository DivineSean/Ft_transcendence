import GameManager from "../games/GameManager";
import Match from "../games/Matchmaking";
import Header from "../components/Header"
import { useState, useRef, useEffect } from "react"
import { FaLongArrowAltRight } from "react-icons/fa";

const GameCard = ({ image, name, description }) => {

    useEffect(() => console.log(name, description), [])
    return (
        <div
            className="flex-shrink-0 p-32 w-full h-full rounded-lg bg-green flex flex-col md:flex-row gap-32
            justify-between basis-auto bg-gradient-to-t from-black/[0.8]"
            style={{
                backgroundImage: `linear-gradient(to top, black, transparent), ${image}`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="flex flex-col bg-red ">
                <span className="text-h-lg-3xl font-bold normal-case">{name}</span>
                {/* <p className="min-w-0">{description}</p> */}
                {/* <span className="text-txt-2xl normal-case text-gray line-clamp-2 hover:line-clamp-none overflow-hidden">{description}</span> */}
            </div>
            <div className="bg-red">
                <button className="whitespace-nowrap gap-8 bg-green rounded-md">
                    <span className="text-black">Play Now</span>
                    {/* <FaLongArrowAltRight className="text-black text-h-lg-lg" /> */}
                    {/* <svg className="size-32 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"> */}
                    {/*     <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" /> */}
                    {/* </svg> */}
                </button>
                {/* <button className="whitespace-nowrap gap-8 bg-green rounded-md"> */}
                {/*     <h4>Play Now</h4> */}
                {/*     <FaLongArrowAltRight className="text-black text-h-lg-lg" /> */}
                {/* </button> */}
            </div>

        </div >
    )
}

const Games = () => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const sliderRef = useRef(null)
    const intervalRef = useRef(null)
    const games = [
        {
            name: "Pong",
            description: "Description dyal had l game l wa3ra bzf, hh hh hh hh hhhhhh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh.",
            image: "url('https://mir-s3-cdn-cf.behance.net/project_modules/fs/05daa256209423.59a540cb340e6.jpg')",
        },
        {
            name: "Fleabag vs Mutt",
            description: "Game dyal lklab hhhhh",
            image: "url('https://www.gimori.com/images/cat-vs-dog.jpg')",
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
