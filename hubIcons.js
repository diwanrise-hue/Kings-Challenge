// ملف: hubIcons.js
// يحتوي على أيقونات الشريط السفلي بصيغة SVG لسهولة الاستدعاء وتغيير الألوان

window.HUB_ICONS = {
    // أيقونة "الأحدث" (نجوم/توهج)
    latest: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
             </svg>`,
             
    // أيقونة "الألعاب" (يد تحكم)
    games: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <rect x="2" y="6" width="20" height="12" rx="2"></rect>
               <path d="M6 12h4"></path>
               <path d="M8 10v4"></path>
               <line x1="15" y1="13" x2="15.01" y2="13"></line>
               <line x1="18" y1="11" x2="18.01" y2="11"></line>
            </svg>`,
            
    // أيقونة "المتجر" (حقيبة تسوق)
    store: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
               <line x1="3" y1="6" x2="21" y2="6"></line>
               <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>`
};

// دالة لحقن الأيقونات في الشريط السفلي عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const latestIconContainer = document.getElementById('icon-latest');
    const gamesIconContainer = document.getElementById('icon-games');
    const storeIconContainer = document.getElementById('icon-store');

    if (latestIconContainer) latestIconContainer.innerHTML = window.HUB_ICONS.latest;
    if (gamesIconContainer) gamesIconContainer.innerHTML = window.HUB_ICONS.games;
    if (storeIconContainer) storeIconContainer.innerHTML = window.HUB_ICONS.store;
});
