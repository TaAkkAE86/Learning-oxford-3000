let oxfordData = [];
let currentWords = [];
let currentIndex = 0;
let favorites = JSON.parse(localStorage.getItem('oxford_favs')) || [];

// รอให้ HTML โหลดเสร็จก่อนค่อยดึงข้อมูล ป้องกัน Error หา ID ไม่เจอ
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});

// ดึงข้อมูลจาก data.json
async function fetchData() {
    try {
        const response = await fetch('data.json');
        oxfordData = await response.json();
        initApp();
    } catch (error) {
        console.error("Error loading data:", error);
        const listEl = document.getElementById('category-list');
        if (listEl) {
            listEl.innerHTML = "<p class='text-center text-red-500'>ไม่สามารถโหลดข้อมูลได้ โปรดรันผ่าน Live Server หรืออัปโหลดขึ้น GitHub</p>";
        }
    }
}

function initApp() {
    updateFavCount();
    renderCategories();
}

function updateFavCount() {
    // รองรับทั้ง ID ใหม่และ ID เก่า ป้องกันแอปพัง
    const favEl = document.getElementById('total-fav-count') || document.getElementById('fav-count');
    if (favEl) {
        favEl.innerText = favorites.length;
    }
}

// -----------------------------------------
// ระบบหน้า HOME (หมวดหมู่)
// -----------------------------------------
function renderCategories() {
    const listEl = document.getElementById('category-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    oxfordData.forEach((cat, index) => {
        const learnedInCat = cat.words.filter(w => favorites.includes(w.id)).length;
        const totalInCat = cat.words.length;
        const progressPercent = Math.round((learnedInCat / totalInCat) * 100);
        
        const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500'];
        const colorClass = colors[index % colors.length];
        const borderColor = colorClass.replace('500', '600');

        const btn = document.createElement('button');
        btn.className = `w-full text-left bg-white border-2 border-slate-200 rounded-2xl p-4 flex items-center gap-4 btn-chunky hover:bg-slate-50`;
        
        btn.innerHTML = `
            <div class="w-14 h-14 min-w-[56px] rounded-full ${colorClass} text-white flex items-center justify-center font-bold text-xl shadow-inner border-b-4 border-${borderColor}">
                ${index + 1}
            </div>
            <div class="flex-1 overflow-hidden">
                <h3 class="font-bold text-slate-800 text-lg leading-tight truncate">${cat.name.split('. ')[1] || cat.name}</h3>
                <p class="text-sm text-slate-500 truncate">${cat.thName}</p>
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

    currentWords = category.words;
    currentIndex = 0;

    const viewLearn = document.getElementById('view-learn');
    if (viewLearn) viewLearn.classList.remove('translate-x-full');
    
    updateCardUI();
}

function closeLearnMode() {
    const viewLearn = document.getElementById('view-learn');
    if (viewLearn) viewLearn.classList.add('translate-x-full');
    
    updateFavCount();
    renderCategories();
    
    const card = document.getElementById('flashcard');
    if (card) card.classList.remove('rotate-y-180');
}

function updateCardUI() {
    if (currentIndex >= currentWords.length) {
        alert("🎉 ยินดีด้วย! คุณทบทวนหมวดนี้ครบแล้ว");
        closeLearnMode();
        return;
    }

    const wordObj = currentWords[currentIndex];
    
    document.getElementById('card-word').innerText = wordObj.word;
    document.getElementById('card-pos').innerText = wordObj.pos;
    document.getElementById('card-th').innerText = wordObj.th;

    const progressPercent = ((currentIndex) / currentWords.length) * 100;
    document.getElementById('progress-bar').style.width = `${progressPercent}%`;
    document.getElementById('progress-text').innerText = `${currentIndex + 1}/${currentWords.length}`;

    const card = document.getElementById('flashcard');
    if (card) card.classList.remove('rotate-y-180');
}

function flipCard() {
    const card = document.getElementById('flashcard');
    if (card) card.classList.toggle('rotate-y-180');
}

function playAudio(event) {
    event.stopPropagation();
    const wordText = document.getElementById('card-word').innerText;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(wordText);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }
}

function nextWord(isRemembered) {
    const currentWordId = currentWords[currentIndex].id;

    if (isRemembered) {
        if (!favorites.includes(currentWordId)) {
            favorites.push(currentWordId);
            localStorage.setItem('oxford_favs', JSON.stringify(favorites));
        }
    } else {
        favorites = favorites.filter(id => id !== currentWordId);
        localStorage.setItem('oxford_favs', JSON.stringify(favorites));
    }

    currentIndex++;
    
    setTimeout(() => {
        updateCardUI();
    }, 150);
}
