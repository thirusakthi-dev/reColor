const DEFAULT_FILTER = [
  { filter: "brightness", range: 100, min: 50, max: 150 },
  { filter: "contrast", range: 100, min: 50, max: 150 },
  { filter: "saturate", range: 100, min: 50, max: 150 },
  { filter: "hue-rotate", range: 0, min: 0, max: 100 },
];

function applyFilter(video, filters) {
  const filterString = filters
    .map((filter) => {
      if (filter.filter === "hue-rotate")
        return `${filter.filter}(${filter.range}deg)`;
      return `${filter.filter}(${filter.range}%)`;
    })
    .join(" ");

  video.style.filter = filterString;
}

window.addEventListener("load", () => {
  const video = document.querySelector("video");
  if (video) {
    chrome.storage.local.set({ filters: DEFAULT_FILTER });
    applyFilter(video, DEFAULT_FILTER);
  }
});

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  const video = document.querySelector("video");
  if (!video) {
    console.warn("No video element found.");
    return;
  }
  if (req.type === "SET_BRIGHTNESS") {
    video.style.filter = `brightness(${req.value}%)`;
    console.log(`Brightness applied: ${req.value}%`);
  }
  if (req.type === "SET_FILTERS") {
    applyFilter(video, req.newFilters);
  }

  if (req.type === "TAKE_SCREENSHOT") {
    const video = document.querySelector("video");
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    // Apply CSS filters to canvas
    ctx.filter = video.style.filter || "none";
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Create unique filename
    const videoId =
      new URLSearchParams(window.location.search).get("v") || "video";
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `YT-Screenshot_${videoId}_${timestamp}.png`;

    // Download
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = filename;
    link.click();
  }
});
