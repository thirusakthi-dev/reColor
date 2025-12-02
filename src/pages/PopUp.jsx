import { Slider } from "@mui/material";
import Icon from "../assets/logo-96.png";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useEffect, useState } from "react";
import { newCinematicPresets } from "../utils/filterPresets";
import PresetOne from "../assets/preset-icons/svg-one.svg";
import PresetTwo from "../assets/preset-icons/svg-two.svg";
import PresetThree from "../assets/preset-icons/svg-three.svg";
import PresetFour from "../assets/preset-icons/svg-four.svg";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

const DEFAULT_FILTER = [
  { filter: "brightness", range: 100, min: 50, max: 150 },
  { filter: "contrast", range: 100, min: 50, max: 150 },
  { filter: "saturate", range: 100, min: 50, max: 150 },
  { filter: "hue-rotate", range: 0, min: 0, max: 100 },
];

const PopUp = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTER);
  const [isDark, setDark] = useState(true);
  const [slidingFilter, setSlidingFilter] = useState(null);

  const presetImages = [PresetOne, PresetTwo, PresetThree, PresetFour];

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    setDark(media.matches);
    const handler = (e) => setDark(e.matches);
    media.addEventListener("change", handler);

    return () => media.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    chrome.storage.local.get("filters", (result) => {
      if (result.filters) {
        setFilters(result.filters);
        setQueryToActiveTab("SET_FILTERS", { newFilters: result.filters });
      }
    });
  }, []);

  const setQueryToActiveTab = (type, payload) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type, ...payload });
      }
    });
  };

  const handleOnChange = (name, newValue) => {
    let newFilters = filters.map((filter) =>
      filter.filter === name ? { ...filter, range: newValue } : filter
    );
    setFilters(newFilters);
    chrome.storage.local.set({ filters: newFilters });
    setQueryToActiveTab("SET_FILTERS", { newFilters });
  };

  const handleScreenshot = () => {
    setQueryToActiveTab("TAKE_SCREENSHOT");
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTER);
    chrome.storage.local.get("filter", (result) => {
      if (result.filters) {
        {
          console.log("N", result.filters);
        }
      }
    });
    chrome.storage.local.set({ filters: DEFAULT_FILTER });

    setQueryToActiveTab("SET_FILTERS", { newFilters: DEFAULT_FILTER });
  };

  const handlePresetFilter = (filter) => {
    setFilters(filter);
    chrome.storage.local.set({ filters: newFilters });
    setQueryToActiveTab("SET_FILTERS", { newFilters: filter });
  };

  const toggleTheme = () => {
    setDark((prev) => !prev);
  };

  return (
    <main
      className={`w-96 font-sans select-none transition-all duration-300 ${
        isDark ? "bg-slate-800 text-slate-300" : "bg-white text-slate-800"
      }`}
    >
      {/* Header */}
      <header
        className={`flex gap-1 border-b p-4 items-center ${
          isDark ? "border-gray-600" : "border-gray-300"
        }`}
      >
        {/* <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="sharpenFilter">
              <feConvolveMatrix
                in="SourceGraphic"
                order="3 3"
                kernelMatrix="0 -1 0 -1 5 -1 0 -1 0"
                divisor="1"
                bias="0"
              />
            </filter>
          </defs>

          <image
            href={PresetThree} // or xlinkHref={PresetOne}
            x="0"
            y="0"
            width="100%"
            height="100%"
            style={{ filter: "url(#sharpenFilter)" }}
            preserveAspectRatio="xMidYMid slice"
          />
        </svg> */}

        <img src={Icon} className="w-5.5 h-5.5 mt-0.5" />
        <h1 className="tracking-wide title-text ml-1.5 font-semibold text-[1.3rem]">
          reColor
        </h1>
        <button
          onClick={toggleTheme}
          className="ml-auto text-xl cursor-pointer px-2 py-1 rounded transition hover:opacity-70"
        >
          {!isDark ? <DarkModeIcon /> : <LightModeIcon />}
        </button>
      </header>

      {/* Content */}
      <section className="px-9 pt-3 pb-6">
        <section className="flex flex-col gap-5">
          <header className="flex justify-between items-center">
            <p
              className={`font-medium text-sm tracking-wide uppercase ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Adjustments
            </p>

            <button
              className={`hover:opacity-70 cursor-pointer transition ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
              onClick={handleReset}
            >
              <RestartAltIcon />
            </button>
          </header>

          {/* Sliders */}
          <ul className="flex flex-col gap-4">
            {filters.map((filter, index) => (
              <li key={index}>
                <div
                  className={`text-xs tracking-wide font-semibold uppercase flex justify-between ${
                    slidingFilter === filter.filter
                      ? isDark
                        ? "text-slate-50"
                        : "text-slate-600"
                      : isDark
                      ? "text-slate-400 "
                      : "text-slate-500"
                  } `}
                >
                  <span>{filter.filter}</span>
                  <p>{filter.range}</p>
                </div>
                <Slider
                  size="small"
                  value={filter.range}
                  min={filter.min}
                  max={filter.max}
                  onChange={(e, v) => {
                    setSlidingFilter(filter.filter);
                    handleOnChange(filter.filter, v);
                  }}
                  onChangeCommitted={() => {
                    setSlidingFilter(null);
                  }}
                />
              </li>
            ))}
          </ul>

          {/* Presets */}
          <section className="flex justify-between">
            {newCinematicPresets.slice(0, 4).map((preset, index) => (
              <div
                key={index}
                className="rounded w-13 h-13 cursor-pointer overflow-hidden"
                onClick={() => handlePresetFilter(preset.filters)}
              >
                <img
                  src={presetImages[index]}
                  alt="Preset Icon"
                  className={`aspect-square object-cover w-full h-full rounded transition ${
                    isDark
                      ? "hover:scale-105 hover:brightness-75"
                      : "hover:scale-105 hover:brightness-90"
                  }`}
                />
              </div>
            ))}
          </section>

          {/* Screenshot button */}
          <button
            className={`mt-2 px-4 py-2 uppercase font-semibold tracking-wide text-sm rounded cursor-pointer transition
            ${
              isDark
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-blue-500 text-white hover:bg-blue-400"
            }`}
            onClick={handleScreenshot}
          >
            Take Screenshot
          </button>
        </section>
      </section>
    </main>
  );
};

export default PopUp;
