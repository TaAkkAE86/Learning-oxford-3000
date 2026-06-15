let oxfordData = [];
let currentCategoryId = 1;
let favorites = JSON.parse(localStorage.getItem('oxford_favs')) || [];

// 1. ดึงข้อมูลจากไฟล์ data.json (จำลองการต่อ Backend API)
async function fetchData() {
    try {
        const response = await fetch('data.json');
        oxfordData = await response.json();
        initApp();
    } catch (error) {
        console.error("Error loading data:", error);
        document.getElementById('category-list').innerHTML = "<p class='text-red-500 text-sm'>โหลดข้อมูลไม่สำเร็จ</p>";
    }
}

function initApp() {
    updateFavCount();
    renderCategories();
    renderWords(currentCategoryId);
}

function updateFavCount() {
    document.getElementById('fav-count').innerText = favorites.length;
}

// 2. สร้างเมนูหมวดหมู่ด้านซ้าย
function renderCategories() {
    const listEl = document.getElementById('category-list');
    listEl.innerHTML = '';

    oxfordData.forEach(cat => {
        const btn = document.createElement('button');
        const isActive = cat.id === currentCategoryId;
        
        btn.className = `w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex justify-between items-center ${
            isActive ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-50 text-slate-600'
        }`;
        
        btn.innerHTML = `
            <span class="truncate pr-2">${cat.name}</span>
            <span class="text-[10px] px-2 py-1 rounded-lg ${isActive ? 'bg-indigo-500' : 'bg-slate-100 text-slate-400'}">${cat.words.length}</span>
        `;
        
        btn.onclick = () => {
            currentCategoryId = cat.id;
            renderCategories();
            renderWords(cat.id);
        };
        listEl.appendChild(btn);
    });
}

// 3. ระบบอ่านออกเสียง
function speak(text, event) {
    event.stopPropagation(); // ป้องกันไม่ให้การ์ดพลิกเวลากดปุ่มลำโพง
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    }
}

// 4. สร้างการ์ดคำศัพท์ (Flip Card)
function renderWords(categoryId) {
    const gridEl = document.getElementById('word-grid');
    const titleEl = document.getElementById('active-category-title');
    gridEl.innerHTML = '';

    const category = oxfordData.find(c => c.id === categoryId);
    if (!category) return;

    titleEl.innerText = `${category.name} (${category.thName})`;

    category.words.forEach(w => {
        const isFav = favorites.includes(w.id);
        const card = document.createElement('div');
        card.className = "perspective h-48 cursor-pointer group";
        
        // โครงสร้างการ์ด 3D
        card.innerHTML = `
            <div class="relative w-full h-full preserve-3d shadow-sm hover:shadow-md rounded-2xl" onclick="this.classList.toggle('rotate-y-180')">
                
                <!-- ด้านหน้า (อังกฤษ) -->
                <div class="absolute w-full h-full backface-hidden bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between">
                    <div class="flex justify-between">
                        <span class="text-xs font-bold text-slate-300">#${w.id}</span>
                        <span class="text-indigo-100 group-hover:text-indigo-500 transition-colors">พลิก ↺</span>
                    </div>
                    <div class="text-center">
                        <h3 class="text-2xl font-bold text-slate-800">${w.word}</h3>
                        <p class="text-sm text-indigo-500 italic mt-1">${w.pos}</p>
                    </div>
                    <div class="flex justify-center">
                        <button onclick="speak('${w.word}', event)" class="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors">
                            🔊 ฟังเสียง
                        </button>
                    </div>
                </div>

                <!-- ด้านหลัง (คำแปลไทย) -->
                <div class="absolute w-full h-full backface-hidden bg-indigo-600 text-white rounded-2xl p-5 rotate-y-180 flex flex-col items-center justify-center">
                    <p class="text-indigo-200 text-sm mb-2">${w.word}</p>
                    <h3 class="text-2xl font-bold text-center">${w.th}</h3>
                </div>

            </div>
        `;
        gridEl.appendChild(card);
    });
}

// เริ่มต้นแอป
fetchData();
