import { useRef } from "react";

const InputUpdateProfile = ({ ...props }) => {
  const inputRef = useRef();
  return (
    <div className="relative flex items-center grow w-full">
      <>
        {props.type !== "about" && (
          <>
            <input
              defaultValue={props.value}
              ref={inputRef}
              onChange={props.onChange}
              name={props.name}
              type={props.type}
              className="
								peer outline-none bg-transparent grow border border-stroke-sc
								rounded-sm text-txt-sm font-light p-8 focus:border-gray transition-all
							"
            />
            <label
              className={`
								absolute top-1/2 -translate-y-1/2
								${props.formData ? "top-[-8px] left-0 text-txt-xs" : "left-8 text-txt-sm"} text-gray
								transition-all peer-focus:left-0 peer-focus:text-txt-xs peer-focus:top-[-8px]
							`}
            >
              {" "}
              {props.title}{" "}
            </label>
          </>
        )}
      </>
      {props.type === "about" && (
        <>
          <textarea
            name={props.name}
            defaultValue={props.value}
            onChange={props.onChange}
            className="
							bg-transparent border border-stroke-sc rounded-sm min-w-full outline-none
							h-[100px] custom-scrollbar resize-none p-8 peer grow text-txt-sm font-light
							focus:border-gray transition-all
						"
          ></textarea>
          <label
            className={`
							absolute text-gray -translate-y-1/2 
							${props.formData ? "top-[-8px] left-0 text-txt-xs" : "left-8 top-24 text-txt-sm"}
							transition-all peer-focus:left-0 peer-focus:text-txt-xs peer-focus:top-[-8px]
						`}
          >
            {" "}
            {props.title}{" "}
          </label>
        </>
      )}
    </div>
  );
};

export default InputUpdateProfile;
