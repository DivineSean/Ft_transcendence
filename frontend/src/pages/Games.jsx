import GameManager from "../games/GameManager";
import Match from "../games/Matchmaking";
import Header from "../components/Header"
import { useState, useRef, useEffect } from "react"
import { FaLongArrowAltRight } from "react-icons/fa";
// import "../styles/bmoButtons.css"

// const Buttons = () => {
//     return (
//         <div className="container-3d w-full h-[13.5vmin]">
//             <button id="up"></button>
//             <button id="left"></button>
//             <button id="right"></button>
//             <button id="down"></button>
//             <div className="axis is3d">
//                 <div style={{ "--z": 1 }}></div>
//                 <div style={{ "--z": 2 }}></div>
//                 <div style={{ "--z": 3 }}></div>
//                 <div style={{ "--z": 4 }}></div>
//                 <div style={{ "--z": 5 }}></div>
//                 <div style={{ "--z": 6 }}></div>
//             </div>
//         </div>
//     );
// };
//
// const Select = () => {
//     return (
//         <button id="select" className="container-3d w-full h-full bg-black is3d">
//             <div style={{ "--z": 1 }}></div>
//             <div style={{ "--z": 2 }}></div>
//             <div style={{ "--z": 3 }}></div>
//             <div style={{ "--z": 4 }}></div>
//         </button>
//     )
// }
//
// const CircularButton = ({ color = "red", radius = 6 }) => {
//     return (
//         <button className="container-3d circle is3d"
//             style={{
//                 "--color": color,
//                 "width": `${radius}vmin`
//             }}
//         >
//             <div></div>
//             <div></div>
//             <div></div>
//             <div></div>
//         </button>
//     )
// }

// const TriangleButton = ({ color = "red", radius = 6 }) => {
//     return (
//         <button className="container-3d triangle is3d"
//             style={{
//                 "--color": color,
//                 "width": `${radius}vmin`,
//             }}
//         >
//             <div></div>
//             <div></div>
//             <div></div>
//             <div></div>
//         </button>
//     )
// }

// const CrossButtons = () => {
//     return (
//         <div className="cross-container scale-75 md:scale-100 lg:scale-100">
//             {/* <div className="spike"><div></div></div> */}
//             {/* <div className="spike"><div></div></div> */}
//             {/* <div className="spike"><div></div></div> */}
//             {/* <div className="spike"><div></div></div> */}
//
//             <div className="cross" id="controller_dpad">
//                 <div className="top-down">
//                     <button className="button-top button-key-w" id="controller_up">
//                         <div className="button-stripe"></div>
//                         <div className="button-stripe"></div>
//                         <div className="button-stripe"></div>
//                     </button>
//                     <button className="button-bottom button-key-s" id="controller_down">
//                         <div className="button-stripe"></div>
//                         <div className="button-stripe"></div>
//                         <div className="button-stripe"></div>
//                     </button>
//                 </div>
//
//                 <div className="left-right">
//                     <button className="button-left button-key-a" id="controller_left">
//                         <div className="button-stripe"></div>
//                         <div className="button-stripe"></div>
//                         <div className="button-stripe"></div>
//                     </button>
//                     <button className="button-right button-key-d" id="controller_right">
//                         <div className="button-stripe"></div>
//                         <div className="button-stripe"></div>
//                         <div className="button-stripe"></div>
//                     </button>
//                 </div>
//                 <div className="cross-middle-bumb"></div>
//             </div>
//         </div>
//     )
// }
//
// const SelectButton = () => {
//     return (
//         <div className="start scale-50 md:scale-75">
//             <button></button>
//         </div>
//     )
// }
//
// const CircleButton = ({ className = "" }) => {
//     return (
//         <div className={`buttons-a-b ${className}`} >
//             <div className="buttons-a-b button-a"></div>
//         </div >
//     )
// }
//
// const TriangleButton = ({ className = "" }) => {
//     return (
//         <div className="relative" >
//             <svg className="buttons-triangle" xmlns="http://www.w3.org/2000/svg" fill="#000000" width="800px" height="800px" viewBox="0 0 24 24">
//                 <path d="M21,21H3L12,3Z" />
//             </svg>
//             <div className="absolute"></div>
//         </div >
//     )
// }

const CrossButtons = () => {
    return (
        <div className="grid grid-cols-3 grid-rows-3 max-h-[164px] max-w-[164px] w-[20vmin] h-[20vmin]">
            <button className="bg-[#FFD42A] rounded-t-md md:rounded-t-lg text-white row-start-1 col-start-2">
            </button>

            <button className="bg-[#FFD42A] rounded-l-md md:rounded-l-lg text-white row-start-2 col-start-1">
            </button>

            <div className="bg-[#FFD42A] row-start-2 col-start-2" aria-hidden="true">
            </div>

            <button className="bg-[#FFD42A] rounded-r-md md:rounded-r-lg text-white row-start-2 col-start-3">
            </button>

            <button className="bg-[#FFD42A] rounded-b-md md:rounded-b-lg text-white row-start-3 col-start-2">
            </button>
        </div>
    )
}

const Games = () => {
    const games = [
        {
            name: "Pong",
            description: "Description dyal had l game l wa3ra bzf, hh hhhhhhhhhhhhhhhhhh hh hh hhhhhh hh hh hh hh hh hh hhhhhh hh hh hh hh hh hh hhhhhh hh hh hh hh hh hh hhhhhh hh hh hh hh hh hh hhhhhh hh hh hh hh hh hh hhhhhh hh hh hh hh hh hh hhhhhh hh hh hh hh hh hh hhhhhh hh hh hh hh hh hh hhhhhh hh hh hh hh hh hh hhhhhh hh hh hh hh hh hh hhhhhh hh hh hh hh hh hh hhhhhh hh hh hh hh hh hh hhhhhh hh hh hh hh hh hh hhhhhh hh hh hh hh hh hh hhhhhh hh hh hh hh hh hh hhhhhh hh hh hh hh hh hh hhhhhh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh hh.",
            image: "url('https://mir-s3-cdn-cf.behance.net/project_modules/fs/05daa256209423.59a540cb340e6.jpg')",
        },
        {
            name: "Fleabag vs Mutt",
            description: "Game dyal lklab hhhhh",
            image: "url('https://www.gimori.com/images/cat-vs-dog.jpg')",
        }
    ]


    return (
        <div className="flex flex-col grow">
            <Header link="games" />
            <div className="backdrop-blur-sm w-full h-full absolute top-0 right-0"></div>
            <div className="container md:px-16 px-0">
                <div className="primary-glass p-16 md:p-32 h-full">
                    <div className="bg-[#2CA086] bmo-frame rounded-lg w-full h-full flex lg:flex-row flex-col gap-16 p-16 md:p-32">
                        <div className="grow max-w-[20%] hidden lg:flex flex-col justify-between items-center">
                        </div>
                        <div className="grow flex flex-col gap-64 lg:gap-16">
                            <div className="bmo-screen rounded-xl relative overflow-hidden grow flex flex-col">
                                {/* <span className="bg-[#165044] h-[5%] w-full"></span> */}
                                <span className="grow bg-[#B2F5CE] w-full min-h-[200px]"></span>
                            </div>
                            <div className="flex justify-between items-center max-h-[47px]">
                                <span className="bg-[#165044] rounded-md md:rounded-lg h-full w-[60%]"></span>
                                <button className="bg-[#006680] rounded-full max-h-[47px] max-w-[47px] w-[6vmin] h-[6vmin]"></button>
                            </div>
                        </div>
                        <div className="p-16 md:p-32 justify-between lg:max-w-[20%] flex">
                            <div className="gap-16 md:gap-32 flex flex-col justify-center">
                                <CrossButtons />
                                <span className="flex justify-around">
                                    <button className="bg-[#006680] rounded-lg max-w-[64px] max-h-[22px] w-[7vmin] h-[2.5vmin]"></button>
                                    <button className="bg-[#006680] rounded-lg max-w-[64px] max-h-[22px] w-[7vmin] h-[2.5vmin]"></button>
                                </span>
                            </div>
                            <div className="flex justify-end items-center gap-32">
                                <span className="flex flex-col gap-8">
                                    <span className="flex gap-16 items-end">
                                        <button className="mb-2.5 border-b-[7vmin] border-[#5FBCD3] border-r-[5.2vmin] border-r-transparent border-l-[5.2vmin] border-l-transparent"></button>
                                        <button className="bg-[#71C837] rounded-full w-[6.5vmin] h-[6.5vmin]"></button>
                                    </span>
                                    <span className="flex justify-center">
                                        <button className="bg-[#C83737] rounded-full max-h-[115px] max-w-[115px] w-[13.5vmin] h-[13.5vmin]"></button>
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        // <GameManager />
        // <Match />
    );
};

export default Games;
