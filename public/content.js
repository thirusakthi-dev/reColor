console.log("Content script loaded");

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  console.log("Message received in content script:", req);

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
    console.log("OG filters:", video.style.filter);
    const filterString = req.newFilters
      .map((f) => {
        if (f.filter === "hue-rotate") return `${f.filter}(${f.range}deg)`;
        return `${f.filter}(${f.range}%)`;
      })
      .join(" ");

    video.style.filter = filterString;
    console.log("Applied filters:", filterString);
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
    const filename = `yt_${videoId}_${timestamp}.png`;

    // Download
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = filename;
    link.click();

    console.log("Screenshot saved as", filename);
  }
});
