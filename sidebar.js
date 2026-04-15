// sidebar.js

let captions = []; // كنخزنو هنا كل الcaptions

// كنسمعو على الرسائل الجاية من content_script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "NEW_CAPTION") {
    addCaption(message.text, message.timestamp);
  }
});

function addCaption(text, timestamp) {
  // نضيفو للarray
  captions.push({ text, timestamp });

  // نحيبو الplaceholder إلا كان موجود
  const placeholder = document.querySelector("#captions-list p");
  if (placeholder) placeholder.remove();

  // نضيفو element جديد فالقائمة
  const list = document.getElementById("captions-list");
  const item = document.createElement("div");
  item.className = "caption-item";
  item.innerHTML = `
    <div class="time">${timestamp}</div>
    <div>${text}</div>
  `;
  list.appendChild(item);

  // نسكرولو للآخر تلقائياً
  list.scrollTop = list.scrollHeight;

  // نحدثو عداد الكلمات
  updateWordCount();
}

function updateWordCount() {
  const total = captions
    .map(c => c.text.split(" ").length)
    .reduce((a, b) => a + b, 0);
  
  document.getElementById("word-count").textContent = `${total} words captured`;
}

// زر التحميل
document.getElementById("download-btn").addEventListener("click", () => {
  if (captions.length === 0) return;

  // نبنيو نص الملف
  const content = captions
    .map(c => `[${c.timestamp}] ${c.text}`)
    .join("\n");

  // نخلقو رابط تحميل مؤقت
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "captions.txt";
  a.click();
  URL.revokeObjectURL(url);
});

// زر المسح
document.getElementById("clear-btn").addEventListener("click", () => {
  captions = [];
  const list = document.getElementById("captions-list");
  list.innerHTML = `<p style="color:#bbb; text-align:center; margin-top:40px">Captions will appear here...</p>`;
  document.getElementById("word-count").textContent = "0 words captured";
});