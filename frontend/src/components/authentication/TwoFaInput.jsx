import { useContext, useEffect, useRef, useState } from "react";
import AuthContext from "../../context/AuthContext";
import { useParams } from "react-router-dom";

const TwoFaInput = ({ type, saveValues }) => {
  const { authorization2FA, resent2FACode } = useContext(AuthContext);

  const { uid } = useParams();
  const [timer, setTimer] = useState(5);
  const [isActive, setIsActive] = useState(false);
  const [values2FA, setValues2FA] = useState(Array(6).fill(""));
  const inputs = useRef([]);

  const handleChange2FA = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value)) {
      const newValues = [...values2FA];
      newValues[index] = value;
      setValues2FA(newValues);
      if (saveValues) saveValues(newValues);
      if (index < 5 && value) {
        inputs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown2FA = (e, index) => {
    if (e.key === "Backspace") {
      const newValues = [...values2FA];
      if (newValues[index]) {
        newValues[index] = "";
        setValues2FA(newValues);
        if (saveValues) saveValues(newValues);
      } else if (index > 0) {
        inputs.current[index - 1].focus();
        const prevValues = [...values2FA];
        prevValues[index - 1] = "";
        setValues2FA(prevValues);
        if (saveValues) saveValues(prevValues);
      }
    }
  };

  const handlePaste = (e) => {
    const pastedData = e.clipboardData.getData("Text");
    pastedData.split("");
    if (pastedData.length === 6) {
      const newValues = [...pastedData];
      setValues2FA(newValues);
      if (saveValues) saveValues(newValues);
      inputs.current[5].focus();
    }
  };

  const resetTimer = (type) => {
    resent2FACode(uid, type);
    setTimer(5);
    setIsActive(false);
  };

  useEffect(() => {
    let interval = null;
    if (!isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
      setIsActive(true);
    }

    return () => clearInterval(interval);
  }, [isActive, timer]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `0${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  return (
    <>
      {type === "twoFa" && (
        <>
          <form
            onSubmit={(e) => authorization2FA(e, uid, values2FA)}
            className="md:py-32 py-16 flex flex-col gap-48"
          >
            <div className="flex justify-between">
              {values2FA.map((value, index) => (
                <input
                  autoFocus={!index ? true : false}
                  key={index}
                  type="text"
                  maxLength={1}
                  value={value}
                  placeholder={index + 1}
                  onChange={(e) => handleChange2FA(e, index)}
                  onKeyDown={(e) => handleKeyDown2FA(e, index)}
                  onPaste={handlePaste}
                  ref={(el) => (inputs.current[index] = el)}
                  className="
										bg-transparent outline-none text-center rounded-sm border
										border-stroke-sc max-w-40 focus:border-green py-8
									"
                />
              ))}
            </div>
            <button
              type="submit"
              className="bg-green text-black text-h-sm-lg font-bold py-8 rounded"
            >
              Verify
            </button>
          </form>
          <div className="flex flex-col gap-8">
            <div className="flex gap-8 justify-center md:text-txt-md text-txt-sm">
              <p className="text-gray font-light text-txt-sm">
                It may take a minute to receive your code.
              </p>
            </div>
            <div className="flex flex-col gap-8 justify-center md:text-txt-md text-txt-sm items-center">
              <p className="text-gray font-light text-txt-sm flex gap-8">
                Haven't received it?
                <button
                  onClick={() => resetTimer("towfa")}
                  disabled={!isActive}
                  className={`text-white underline ${isActive ? "cursor-pointer font-bold opacity-100" : "cursor-not-allowed opacity-50"}`}
                >
                  Resend a new code.
                </button>
              </p>
              <span>{formatTime(timer)}</span>
            </div>
          </div>
        </>
      )}
      {type === "reset" && (
        <div className="flex flex-col gap-16">
          <p className="text-gray">enter the code </p>
          <div className="flex justify-between">
            {values2FA.map((value, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={value}
                placeholder={index + 1}
                onChange={(e) => handleChange2FA(e, index)}
                onKeyDown={(e) => handleKeyDown2FA(e, index)}
                onPaste={handlePaste}
                ref={(el) => (inputs.current[index] = el)}
                className="
									bg-transparent outline-none text-center rounded-sm border
									border-stroke-sc max-w-40 focus:border-green py-8
								"
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};
export default TwoFaInput;
