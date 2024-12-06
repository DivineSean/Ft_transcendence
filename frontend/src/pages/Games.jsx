import GameManager from "../games/GameManager";
import Match from "../games/Matchmaking";
import Header from "../components/Header"
import { useState, useRef, useEffect } from "react"
import { FaLongArrowAltRight } from "react-icons/fa";
import "../styles/bmoButtons.css"

const Buttons = () => {
    return (
        <div className="container-3d w-full h-[13.5vmin]">
            <button id="up"></button>
            <button id="left"></button>
            <button id="right"></button>
            <button id="down"></button>
            <div className="axis is3d">
                <div style={{ "--z": 1 }}></div>
                <div style={{ "--z": 2 }}></div>
                <div style={{ "--z": 3 }}></div>
                <div style={{ "--z": 4 }}></div>
                <div style={{ "--z": 5 }}></div>
                <div style={{ "--z": 6 }}></div>
            </div>
        </div>
    );
};

const Select = () => {
    return (
        <button id="select" className="container-3d is3d">
            Select
            <div style={{ "--z": 1 }}></div>
            <div style={{ "--z": 2 }}></div>
            <div style={{ "--z": 3 }}></div>
            <div style={{ "--z": 4 }}></div>
        </button>
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
                <div className="primary-glass p-32 h-full">
                    <div className="bg-[#2CA086] rounded-lg w-full h-full flex gap-16 p-16">
                        <div className="grow max-w-[20%] flex flex-col justify-between items-center">
                            <Select />
                            <Buttons />
                        </div>
                        <div className="grow flex flex-col gap-16">
                            <div className="rounded-2xl overflow-hidden grow flex flex-col">
                                <span className="bg-[#165044] h-[5%] w-full">header</span>
                                <span className="bg-[#B2F5CE] w-full grow">screen</span>
                            </div>
                            <div className="h-[47px] flex justify-between">
                                <span className="bg-[#165044] rounded-lg h-full w-[60%]"></span>
                                <button className="bg-[#006680] rounded-full w-[47px] h-[47px]"></button>
                            </div>
                        </div>
                        <div className="bg-red grow max-w-[20%]">
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
