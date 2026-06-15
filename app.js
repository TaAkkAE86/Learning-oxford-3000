let oxfordData = [];
let currentWords = [];
let currentIndex = 0;
let favorites = JSON.parse(localStorage.getItem('oxford_favs')) || [];

// ดึงข้อมูลจาก data.json
async function fetchData() {
    try {
        const response = await fetch('data.json');
        oxfordData = await response.json();
        initApp();
    } catch (error) {
        console.error("Error loading data:", error);
        document.getElementById('category-list').innerHTML = "<p class='text-center text-red-500'>ไม่สามารถโหลดข้อมูลได้ โปรดตรวจสอบ data.json</p>";
    }
}

function initApp() {
    updateFavCount();
    renderCategories();
}

function updateFavCount() {
    document.getElementById('total-fav-count').innerText = favorites.length;
}

// -----------------------------------------
// ระบบหน้า HOME (หมวดหมู่)
// -----------------------------------------
function renderCategories() {
    const listEl = document.getElementById('category-list');
    listEl.innerHTML = '';

    oxfordData.forEach((cat, index) => {
        // คำนวณความคืบหน้าของแต่ละหมวด
        const learnedInCat = cat.words.filter(w => favorites.includes(w.id)).length;
        const totalInCat = cat.words.length;
        const progressPercent = Math.round((learnedInCat / totalInCat) * 100);
        
        // สลับสีปุ่มให้ดูน่าสนใจ (เขียว, ฟ้า, ม่วง, ส้ม)
        const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500'];
        const colorClass = colors[index % colors.length];
        const borderColor = colorClass.replace('500', '600');

        const btn = document.createElement('button');
        btn.className = `w-full text-left bg-white border-2 border-slate-200 rounded-2xl p-4 flex items-center gap-4 btn-chunky hover:bg-slate-50`;
        
        btn.innerHTML = `
            <div class="w-14 h-14 rounded-full ${colorClass} text-white flex items-center justify-center font-bold text-xl shadow-inner border-b-4 border-${borderColor}">
                ${index + 1}
            </div>
            <div class="flex-1">
                <h3 class="font-bold text-slate-800 text-lg leading-tight line-clamp-1">${cat.name.split('. ')[1] || cat.name}</h3>
                <p class="text-sm text-slate-500">${cat.thName}</p>
                <div class="mt-2 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full ${colorClass}" style="width: ${progressPercent}%"></div>
                </div>
            </div>
        `;
        
        btn.onclick = () => openLearnMode(cat.id);
        listEl.appendChild(btn);
    });
}

// -----------------------------------------
// ระบบหน้า LEARN MODE (การ์ดคำศัพท์)
// -----------------------------------------
function openLearnMode(categoryId) {
    const category = oxfordData.find(c => c.id === categoryId);
    if (!category) return;

    // กรองเอาเฉพาะคำที่ยังไม่ได้กด "จำได้แล้ว" (หรือจะเอามาหมดก็ได้)
    // ในที่นี้เอามาทั้งหมดเพื่อให้ทบทวนได้
    currentWords = category.words;
    currentIndex = 0;

    // เลื่อนหน้าต่าง Learn Mode เข้ามา
    document.getElementById('view-learn').classList.remove('translate-x-full');
    
    updateCardUI();
}

function closeLearnMode() {
    // เลื่อนหน้าต่าง Learn Mode ออกไป
    document.getElementById('view-learn').classList.add('translate-x-full');
    // อัปเดตหน้า Home เผื่อมีคำที่จำได้เพิ่มขึ้น
    updateFavCount();
    renderCategories();
    
    // รีเซ็ตการ์ดให้หงายหน้าเดิม
    const card = document.getElementById('flashcard');
    card.classList.remove('rotate-y-180');
}

function updateCardUI() {
    if (currentIndex >= currentWords.length) {
        // เรียนจบหมวดนี้แล้ว
        alert("🎉 ยินดีด้วย! คุณทบทวนหมวดนี้ครบแล้ว");
        closeLearnMode();
        return;
    }

    const wordObj = currentWords[currentIndex];
    
    // อัปเดตข้อมูลบนการ์ด
    document.getElementById('card-word').innerText = wordObj.word;
    document.getElementById('card-pos').innerText = wordObj.pos;
    document.getElementById('card-th').innerText = wordObj.th;

    // อัปเดต Progress Bar
    const progressPercent = ((currentIndex) / currentWords.length) * 100;
    document.getElementById('progress-bar').style.width = `${progressPercent}%`;
    document.getElementById('progress-text').innerText = `${currentIndex + 1}/${currentWords.length}`;

    // รีเซ็ตการ์ดให้หงายด้านหน้าเสมอเมื่อเปลี่ยนคำ
    const card = document.getElementById('flashcard');
    card.classList.remove('rotate-y-180');
}

function flipCard() {
    const card = document.getElementById('flashcard');
    card.classList.toggle('rotate-y-180');
}

function playAudio(event) {
    event.stopPropagation(); // ไม่ให้การ์ดพลิก
    const wordText = document.getElementById('card-word').innerText;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(wordText);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }
}

// ปุ่มด้านล่าง (ทบทวนอีก / จำได้แล้ว)
function nextWord(isRemembered) {
    const currentWordId = currentWords[currentIndex].id;

    if (isRemembered) {
        // บันทึกลงคลังคำจำได้
        if (!favorites.includes(currentWordId)) {
            favorites.push(currentWordId);
            localStorage.setItem('oxford_favs', JSON.stringify(favorites));
        }
    } else {
        // ถ้ายกเลิกจำได้ (เผื่อเปลี่ยนใจ)
        favorites = favorites.filter(id => id !== currentWordId);
        localStorage.setItem('oxford_favs', JSON.stringify(favorites));
    }

    // เลื่อนไปคำถัดไป
    currentIndex++;
    
    // ใส่ Timeout เล็กน้อยให้รู้สึก Smooth ก่อนเปลี่ยนคำ
    setTimeout(() => {
        updateCardUI();
    }, 150);
}

// เริ่มการทำงาน
fetchData();
