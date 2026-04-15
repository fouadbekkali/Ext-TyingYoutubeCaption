// content_script.js

let lastCaption = "";
let isObserving = false;

function startObserver() {
  // njiboo l container dyal caption li kayn f youtube
  const captionContainer = document.querySelector(".ytp-caption-window-container");

  if (!captionContainer) {
    // hadi baxx ida mal9ax dak l container f youtube, kayn ihtimal ykoun mazal ma tloadach, daba n3awdou n7awlo ba3d chwya
    setTimeout(startObserver, 1000);
    return;
  }

  // ila kan observer kayn deja, ma nbdawch wahed jdid
  if (isObserving) return;
  isObserving = true;

  const observer = new MutationObserver(() => {
    // selector all bax njibo ga3 spans li kaynin f dak l container, li fihom captions
    const spans = document.querySelectorAll(".ytp-caption-segment");
    
    if (spans.length === 0) return; // Removed alert

    // njm3oo gaa3 spans f string w7da 
    const currentCaption = Array.from(spans)
      .map(s => s.textContent.trim())
      .join(" ");

    // ila l caption li kayn daba mkhtalef 3la li kan f l9bl, n3awdou nb3thouh
    if (currentCaption && currentCaption !== lastCaption) {
      lastCaption = currentCaption;

      // nb3thou l caption jdida l background script bach ykhdem biha
      chrome.runtime.sendMessage({
        type: "NEW_CAPTION",
        text: currentCaption,
        timestamp: getCurrentTime()
      });
    }
  });

  // nobserviwou l container bach n3rfou mlli kaytbdl l caption
  observer.observe(captionContainer, {
    childList: true,
    subtree: true,
    characterData: true
  });

  console.log("Caption Capture: Observer started!");
}

function getCurrentTime() {
  // نجبدو الوقت الحالي ديال الفيديو
  const video = document.querySelector("video");
  if (!video) return "0:00";
  
  const secs = Math.floor(video.currentTime);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getVideoTitle() {
  const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer');
  if (titleElement) {
    return titleElement.textContent.trim();
  }
  // Fallback to document.title
  return document.title.replace(' - YouTube', '');
}

function updateExtensionTitle() {
  const title = getVideoTitle();
  chrome.runtime.sendMessage({
    type: "SET_TITLE",
    title: title || "Caption Capture"
  });
}

// نبداو ملي تتحمل الصفحة
startObserver();
updateExtensionTitle();

// يوتيوب SPA — الصفحة مكتتحملش من جديد عند كل فيديو
// خاصنا نسمعو على navigation
window.addEventListener('yt-navigate-finish', () => {
  isObserving = false;
  lastCaption = "";
  setTimeout(() => {
    startObserver();
    updateExtensionTitle();
  }, 2000);
});
