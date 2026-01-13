// Initial Data
const DEFAULT_RANKS = [
    { id: 'rank_1', name: 'جندي', order: 1 },
    { id: 'rank_2', name: 'جندي أول', order: 2 },
    { id: 'rank_3', name: 'عريف', order: 3 },
    { id: 'rank_4', name: 'وكيل رقيب', order: 4 },
    { id: 'rank_5', name: 'رقيب', order: 5 },
    { id: 'rank_6', name: 'رقيب أول', order: 6 },
    { id: 'rank_7', name: 'رئيس رقباء', order: 7 },
    { id: 'rank_8', name: 'ملازم', order: 8 },
    { id: 'rank_9', name: 'ملازم هل', order: 9 },
    { id: 'rank_10', name: 'ملازم أول', order: 10 },
    { id: 'rank_11', name: 'نقيب', order: 11 },
    { id: 'rank_12', name: 'رائد', order: 12 },
    { id: 'rank_13', name: 'مقدم', order: 13 },
    { id: 'rank_14', name: 'عقيد', order: 14 },
    { id: 'rank_15', name: 'عميد', order: 15 },
    { id: 'rank_16', name: 'لواء', order: 16 },
    { id: 'rank_17', name: 'فريق', order: 17 },
    { id: 'rank_18', name: 'فريق أول', order: 18 }
];

// App State
let appData = {
    ranks: [],
    personnel: [],
    recruitmentOpen: false,
    applications: [],
    rules: "لا توجد قوانين مضافة حالياً.",
    reporting: "للتبليغ يرجى التواصل مع المشرفين.",
    strategies: "لا توجد استراتيجيات عامة حالياً."
};

let isAdmin = false;
let currentDetailPersonId = null;
let currentInfoType = null; // 'rules', 'reporting', 'strategies'

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    // Render hidden app content so it's ready
    renderApp();
    checkRecruitmentVisibility();
});

function loadData() {
    const storedData = localStorage.getItem('militaryAppData');
    if (storedData) {
        appData = JSON.parse(storedData);
        // Defaults for new fields if old data exists
        if (appData.recruitmentOpen === undefined) appData.recruitmentOpen = false;
        if (!appData.applications) appData.applications = [];
        if (!appData.rules) appData.rules = "لا توجد قوانين مضافة حالياً.";
        if (!appData.reporting) appData.reporting = "للتبليغ يرجى التواصل مع المشرفين.";
        if (!appData.strategies) appData.strategies = "لا توجد استراتيجيات عامة حالياً.";
    } else {
        appData.ranks = [...DEFAULT_RANKS];
        saveData();
    }
}

function saveData() {
    localStorage.setItem('militaryAppData', JSON.stringify(appData));
    renderApp();
    updateAppCount();
    checkRecruitmentVisibility();
}

// ----------------------
// LANDING PAGE LOGIC
// ----------------------
function enterSite() {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('mainAppWrapper').style.display = 'block';
}

function openRecruitmentFromLanding() {
    if (!appData.recruitmentOpen) {
        showStatus('التقديم مغلق حالياً من قبل الإدارة', 'error');
        return;
    }
    openRecruitmentModal();
}

// ----------------------
// ADMIN LOGIC
// ----------------------
function toggleAdminPanel() {
    if (isAdmin) return;
    const panel = document.getElementById('adminPanel');
    panel.classList.toggle('hidden');
}

function checkAdminPin() {
    const pin = document.getElementById('adminPin').value;
    if (pin === '19626841') {
        activateAdminMode();
    } else {
        showStatus('الرمز غير صحيح!', 'error');
    }
}

function activateAdminMode() {
    isAdmin = true;
    document.getElementById('adminPanel').classList.add('hidden');
    document.getElementById('adminBtn').classList.add('hidden');

    document.getElementById('adminTools').classList.remove('hidden');
    document.getElementById('addRankContainer').classList.remove('hidden');

    document.body.classList.add('admin-mode');

    document.getElementById('statusContainer').classList.remove('hidden');
    // Warn Controls should be visible for admins
    document.getElementById('warnControls').classList.remove('hidden');

    document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));

    updateRecruitmentBtnText();
    updateAppCount();
    showStatus('تم تفعيل وضع المشرف', 'success');
    renderApp();
}

function logoutAdmin() {
    isAdmin = false;
    document.getElementById('adminBtn').classList.remove('hidden');

    document.getElementById('adminTools').classList.add('hidden');
    document.getElementById('addRankContainer').classList.add('hidden');
    document.body.classList.remove('admin-mode');

    document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));

    document.getElementById('statusContainer').classList.add('hidden');
    document.getElementById('warnControls').classList.add('hidden');

    showStatus('تم تسجيل الخروج', 'info');
    renderApp();
}

// ----------------------
// SEARCH SYSTEM
// ----------------------
function searchPersonnel() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.person-card');

    cards.forEach(card => {
        const name = card.querySelector('.person-name').textContent.toLowerCase();
        if (name.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// ----------------------
// STATUS SYSTEM
// ----------------------
function getStatusColor(status) {
    switch (status) {
        case 'active': return 'status-active';
        case 'inactive': return 'status-inactive';
        case 'vacation': return 'status-vacation';
        case 'mission': return 'status-mission';
        default: return '';
    }
}

function updatePersonStatus() {
    const status = document.getElementById('statusSelect').value;
    const person = appData.personnel.find(p => p.id === currentDetailPersonId);
    if (person) {
        person.status = status;
        saveData();
        showStatus('تم تحديث الحالة', 'success');
    }
}

// ----------------------
// RECRUITMENT SYSTEM
// ----------------------
function checkRecruitmentVisibility() {
    // Normal Recruitment Button (if visible anywhere else)
    const btn = document.getElementById('recruitmentBtn');
    if (btn) {
        if (appData.recruitmentOpen) {
            btn.classList.remove('hidden');
        } else {
            btn.classList.add('hidden');
        }
    }

    // Landing Page Button Logic
    const landingBtn = document.getElementById('landingRecruitBtn');
    const landingStatus = document.getElementById('landingRecruitStatus');

    if (appData.recruitmentOpen) {
        landingBtn.classList.remove('disabled');
        landingStatus.textContent = "التقديم مفتوح الآن";
        landingStatus.style.color = "var(--success)";
    } else {
        landingBtn.classList.add('disabled');
        landingStatus.textContent = "مغلق حالياً";
        landingStatus.style.color = "var(--danger)";
    }
}

function toggleRecruitmentStatus() {
    appData.recruitmentOpen = !appData.recruitmentOpen;
    saveData();
    updateRecruitmentBtnText();
    const msg = appData.recruitmentOpen ? 'تم فتح التقديم' : 'تم إغلاق التقديم';
    showStatus(msg, 'info');
}

function updateRecruitmentBtnText() {
    const btn = document.getElementById('toggleRecruitBtn');
    if (appData.recruitmentOpen) {
        btn.innerHTML = '<i class="fa-solid fa-lock-open"></i> إغلاق التقديم';
        btn.style.background = 'var(--danger)';
    } else {
        btn.innerHTML = '<i class="fa-solid fa-lock"></i> فتح التقديم';
        btn.style.background = 'var(--secondary-color)';
    }
}

function openRecruitmentModal() {
    document.getElementById('recruitmentForm').reset();
    document.getElementById('recruitmentModal').classList.remove('hidden');
}

function submitApplication(e) {
    e.preventDefault();

    const app = {
        id: 'app_' + Date.now(),
        realName: document.getElementById('appRealName').value,
        age: document.getElementById('appAge').value,
        discord: document.getElementById('appDiscord').value,
        reason: document.getElementById('appReason').value,
        benefit: document.getElementById('appBenefit').value,
        tasks: document.getElementById('appTasks').value,
        unique: document.getElementById('appUnique').value,
        intro: document.getElementById('appIntro').value,
        timestamp: new Date().toLocaleString('ar-SA')
    };

    appData.applications.push(app);
    saveData();
    closeModal('recruitmentModal');
    showStatus('تم إرسال طلبك بنجاح وسينظر فيه المشرف قريباً', 'success');
}

function openApplicationsModal() {
    renderApplications();
    document.getElementById('applicationsModal').classList.remove('hidden');
}

function updateAppCount() {
    const count = appData.applications ? appData.applications.length : 0;
    const el = document.getElementById('appCount');
    if (el) el.textContent = count;
}

function renderApplications() {
    const container = document.getElementById('applicationsList');
    container.innerHTML = '';

    if (!appData.applications || appData.applications.length === 0) {
        container.innerHTML = '<p style="text-align:center;">لا توجد طلبات معلقة</p>';
        return;
    }

    appData.applications.forEach((app, index) => {
        const div = document.createElement('div');
        div.className = 'app-card';
        div.innerHTML = `
            <h4>${app.realName} (Discord: ${app.discord})</h4>
            <p><strong>العمر:</strong> ${app.age}</p>
            <p><strong>سبب التقديم:</strong> ${app.reason}</p>
            <p><strong>الفائدة المرجوة:</strong> ${app.benefit}</p>
            <p><strong>مهام الجيش:</strong> ${app.tasks}</p>
            <p><strong>ما يميزه:</strong> ${app.unique}</p>
            <p><strong>تعريف بالنفس:</strong> ${app.intro}</p>
            <p><small>${app.timestamp}</small></p>
            <div class="app-actions">
                <button class="accept-btn" onclick="acceptApp(${index})">قبول مبدئي (حذف)</button>
                <button class="reject-btn" onclick="rejectApp(${index})">رفض (حذف)</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function acceptApp(index) {
    if (confirm('هل تريد قبول هذا الطلب وحذفه من القائمة؟ (يجب عليك إضافة الشخص يدوياً للرتبة المناسبة)')) {
        appData.applications.splice(index, 1);
        saveData();
        renderApplications();
        showStatus('تم حذف الطلب (مقبول)', 'success');
    }
}

function rejectApp(index) {
    if (confirm('هل تريد رفض هذا الطلب وحذفه؟')) {
        appData.applications.splice(index, 1);
        saveData();
        renderApplications();
    }
}

// ----------------------
// INFO SECTIONS (Rules, Reporting, Strategies)
// ----------------------
function openInfoModal(type) {
    currentInfoType = type;
    const modal = document.getElementById('infoModal');
    const titleEl = document.getElementById('infoTitle');
    const viewEl = document.getElementById('infoViewContent');
    const editEl = document.getElementById('infoEditContent');
    const editBtn = document.getElementById('editInfoBtn');
    const saveBtn = document.getElementById('saveInfoBtn');

    let titleText = '';
    let content = '';

    if (type === 'rules') {
        titleText = 'القوانين العسكرية';
        content = appData.rules;
    } else if (type === 'reporting') {
        titleText = 'نظام التبليغ';
        content = appData.reporting;
    } else if (type === 'strategies') {
        titleText = 'الاستراتيجيات';
        content = appData.strategies;
    }

    titleEl.textContent = titleText;
    viewEl.textContent = content;
    editEl.value = content;

    // Reset view mode
    viewEl.classList.remove('hidden');
    editEl.classList.add('hidden');

    if (isAdmin) {
        document.querySelector('#infoModal .admin-only').classList.remove('hidden');
        editBtn.classList.remove('hidden');
        saveBtn.classList.add('hidden');
    } else {
        document.querySelector('#infoModal .admin-only').classList.add('hidden');
    }

    modal.classList.remove('hidden');
}

function toggleEditInfoMode() {
    const viewEl = document.getElementById('infoViewContent');
    const editEl = document.getElementById('infoEditContent');
    const editBtn = document.getElementById('editInfoBtn');
    const saveBtn = document.getElementById('saveInfoBtn');

    if (editEl.classList.contains('hidden')) {
        // Switch to Edit
        viewEl.classList.add('hidden');
        editEl.classList.remove('hidden');
        editBtn.classList.add('hidden');
        saveBtn.classList.remove('hidden');
    } else {
        // Switch to View (Cancel)
        viewEl.classList.remove('hidden');
        editEl.classList.add('hidden');
        editBtn.classList.remove('hidden');
        saveBtn.classList.add('hidden');
    }
}

function saveInfoContent() {
    const newVal = document.getElementById('infoEditContent').value;

    if (currentInfoType === 'rules') appData.rules = newVal;
    else if (currentInfoType === 'reporting') appData.reporting = newVal;
    else if (currentInfoType === 'strategies') appData.strategies = newVal;

    saveData(); // Persist

    // Update view
    document.getElementById('infoViewContent').textContent = newVal;

    // Switch back to view mode
    toggleEditInfoMode();
    showStatus('تم حفظ التعديلات', 'success');
}

// ----------------------
// RENDER & UI
// ----------------------

function showStatus(msg, type) {
    const el = document.getElementById('statusMessage');
    el.textContent = msg;
    el.className = 'status-message';
    el.style.backgroundColor = type === 'error' ? 'var(--danger)' : (type === 'info' ? 'var(--mission)' : 'var(--secondary-color)');
    if (type === 'success') el.style.backgroundColor = 'var(--success)';

    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 3000);
}

function renderApp() {
    const container = document.getElementById('ranksContainer');
    container.innerHTML = '';

    const sortedRanks = [...appData.ranks].sort((a, b) => a.order - b.order);

    sortedRanks.forEach(rank => {
        const rankSection = document.createElement('div');
        rankSection.className = 'rank-section';

        const header = document.createElement('div');
        header.className = 'rank-header';

        let controlBtns = '';
        if (isAdmin) {
            controlBtns = `<button style="background:transparent; color:var(--danger); font-size:1.2rem;" onclick="event.stopPropagation(); deleteRank('${rank.id}')"><i class="fa-solid fa-times"></i></button>`;
        }

        header.innerHTML = `<div class="rank-title">${rank.name}</div> ${controlBtns}`;
        rankSection.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'personnel-grid';

        const rankPersonnel = appData.personnel.filter(p => p.rankId === rank.id);

        rankPersonnel.forEach(p => {
            const card = document.createElement('div');
            card.className = 'person-card';
            card.onclick = () => openDetails(p.id);

            const statusClass = getStatusColor(p.status || '');
            const statusDot = (p.status && p.status !== 'active') ? `<div class="status-dot ${statusClass}"></div>` : (p.status === 'active' ? `<div class="status-dot status-active"></div>` : '');

            const imgWrapper = document.createElement('div');
            imgWrapper.className = 'person-img-wrapper';
            imgWrapper.style.position = 'relative';
            imgWrapper.innerHTML = `
                <img src="${p.image || 'https://via.placeholder.com/100?text=No+Img'}" class="person-img">
                ${statusDot}
            `;

            const name = document.createElement('div');
            name.className = 'person-name';
            name.textContent = p.name;

            // Add Badge for Warns if > 0 (Optional but nice)
            // No, user just asked for display in details. Keep card clean.

            card.appendChild(imgWrapper);
            card.appendChild(name);
            grid.appendChild(card);
        });

        if (isAdmin) {
            const addContainer = document.createElement('div');
            addContainer.style.display = 'flex';
            addContainer.style.alignItems = 'center';
            addContainer.style.justifyContent = 'center';

            const addBtn = document.createElement('div');
            addBtn.className = 'add-btn-circle';
            addBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
            addBtn.onclick = () => openAddPersonModal(rank.id);

            addContainer.appendChild(addBtn);
            grid.appendChild(addContainer);
        }

        rankSection.appendChild(grid);
        container.appendChild(rankSection);
    });
}

function deleteRank(rankId) {
    if (!confirm('هل أنت متأكد من حذف هذه الرتبة؟ سيتم حذف جميع الأشخاص فيها!')) return;
    appData.ranks = appData.ranks.filter(r => r.id !== rankId);
    appData.personnel = appData.personnel.filter(p => p.rankId !== rankId);
    saveData();
}

// ----------------------
// MODALS & FORMS
// ----------------------
function openAddPersonModal(rankId, existingPerson = null) {
    document.getElementById('personForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('personImageFile').removeAttribute('data-base64');

    if (existingPerson) {
        document.getElementById('modalTitle').textContent = 'تعديل بيانات الشخص';
        document.getElementById('personId').value = existingPerson.id;
        document.getElementById('personRankId').value = existingPerson.rankId;
        document.getElementById('personName').value = existingPerson.name;
        document.getElementById('personCode').value = existingPerson.code || ''; // Pre-fill code
        document.getElementById('personImageUrl').value = existingPerson.image && existingPerson.image.startsWith('data:') ? '' : (existingPerson.image || '');

        if (existingPerson.image) {
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = `<img src="${existingPerson.image}" style="max-width: 100px; max-height: 100px; border-radius: 10px;">`;
        }
    } else {
        document.getElementById('modalTitle').textContent = 'إضافة شخص جديد';
        document.getElementById('personId').value = '';
        document.getElementById('personRankId').value = rankId;
        document.getElementById('personCode').value = '';
    }

    document.getElementById('personModal').classList.remove('hidden');
}

function editCurrentPerson() {
    const person = appData.personnel.find(p => p.id === currentDetailPersonId);
    if (person) {
        closeModal('detailsModal');
        openAddPersonModal(person.rankId, person);
    }
}

function handleImageUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100px; max-height: 100px; border-radius: 10px;">`;
            input.setAttribute('data-base64', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function handlePersonSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('personName').value;
    const code = document.getElementById('personCode').value;
    const rankId = document.getElementById('personRankId').value;
    const id = document.getElementById('personId').value;

    const fileInput = document.getElementById('personImageFile');
    const urlInput = document.getElementById('personImageUrl');
    let image = urlInput.value;

    if (fileInput.getAttribute('data-base64')) {
        image = fileInput.getAttribute('data-base64');
    }

    const existingIndex = appData.personnel.findIndex(p => p.id === id);

    if (existingIndex > -1) {
        appData.personnel[existingIndex].name = name;
        appData.personnel[existingIndex].code = code;
        if (image) appData.personnel[existingIndex].image = image;
        showStatus('تم تحديث البيانات', 'success');
    } else {
        const newPerson = {
            id: 'person_' + Date.now(),
            name,
            code,
            rankId,
            image,
            status: 'active',
            warns: 0,
            tasks: [],
            promotions: []
        };
        appData.personnel.push(newPerson);
        showStatus('تمت الإضافة بنجاح', 'success');
    }

    saveData();
    closeModal('personModal');

    if (existingIndex > -1) {
        openDetails(id);
    }
}

function openDetails(personId) {
    currentDetailPersonId = personId;
    const person = appData.personnel.find(p => p.id === personId);
    if (!person) return;

    const rank = appData.ranks.find(r => r.id === person.rankId);

    document.getElementById('detailName').textContent = person.name;
    document.getElementById('detailCode').textContent = person.code ? `Code: ${person.code}` : '';
    document.getElementById('detailRank').textContent = rank ? rank.name : 'Unknown';
    document.getElementById('detailImage').src = person.image || 'https://via.placeholder.com/150';
    document.getElementById('detailWarns').textContent = person.warns || 0;

    if (isAdmin) {
        document.getElementById('statusSelect').value = person.status || 'active';
    }

    renderDetailsLists(person);

    const controls = document.querySelectorAll('.admin-only');
    controls.forEach(el => {
        if (isAdmin) el.classList.remove('hidden');
        else el.classList.add('hidden');
    });

    if (!isAdmin) {
        document.getElementById('warnControls').classList.add('hidden');
    }

    document.getElementById('detailsModal').classList.remove('hidden');
}

function changeWarns(amount) {
    const person = appData.personnel.find(p => p.id === currentDetailPersonId);
    if (!person) return;

    if (!person.warns) person.warns = 0;
    person.warns += amount;
    if (person.warns < 0) person.warns = 0;

    saveData();
    document.getElementById('detailWarns').textContent = person.warns;
}

function renderDetailsLists(person) {
    const taskList = document.getElementById('detailTasks');
    taskList.innerHTML = '';
    (person.tasks || []).forEach((task, index) => {
        const li = document.createElement('li');
        li.textContent = task;
        if (isAdmin) {
            const delBtn = document.createElement('span');
            delBtn.innerHTML = ' <i class="fa-solid fa-trash" style="color:red; cursor:pointer; font-size:0.8rem;"></i>';
            delBtn.onclick = (e) => { e.stopPropagation(); deleteTask(index); };
            li.appendChild(delBtn);
        }
        taskList.appendChild(li);
    });

    const promoList = document.getElementById('detailPromotions');
    promoList.innerHTML = '';
    (person.promotions || []).forEach((promo, index) => {
        const li = document.createElement('li');
        li.textContent = promo;
        if (isAdmin) {
            const delBtn = document.createElement('span');
            delBtn.innerHTML = ' <i class="fa-solid fa-trash" style="color:red; cursor:pointer; font-size:0.8rem;"></i>';
            delBtn.onclick = (e) => { e.stopPropagation(); deletePromo(index); };
            li.appendChild(delBtn);
        }
        promoList.appendChild(li);
    });
}

function addTask() {
    const input = document.getElementById('newTaskInput');
    if (!input.value) return;
    const person = appData.personnel.find(p => p.id === currentDetailPersonId);
    if (!person.tasks) person.tasks = [];
    person.tasks.push(input.value);
    input.value = '';
    saveData();
    renderDetailsLists(person);
}

function deleteTask(index) {
    const person = appData.personnel.find(p => p.id === currentDetailPersonId);
    person.tasks.splice(index, 1);
    saveData();
    renderDetailsLists(person);
}

function addPromo() {
    const input = document.getElementById('newPromoInput');
    if (!input.value) return;
    const person = appData.personnel.find(p => p.id === currentDetailPersonId);
    if (!person.promotions) person.promotions = [];
    person.promotions.push(input.value);
    input.value = '';
    saveData();
    renderDetailsLists(person);
}

function deletePromo(index) {
    const person = appData.personnel.find(p => p.id === currentDetailPersonId);
    person.promotions.splice(index, 1);
    saveData();
    renderDetailsLists(person);
}

function deleteCurrentPerson() {
    if (!confirm('هل أنت متأكد من حذف هذا الشخص؟')) return;
    appData.personnel = appData.personnel.filter(p => p.id !== currentDetailPersonId);
    saveData();
    closeModal('detailsModal');
}

// Rank Management
function openAddRankModal() {
    document.getElementById('rankModal').classList.remove('hidden');
}

function handleRankSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('rankName').value;
    const order = parseInt(document.getElementById('rankOrder').value);

    const newRank = {
        id: 'rank_' + Date.now(),
        name,
        order
    };

    appData.ranks.push(newRank);
    saveData();
    closeModal('rankModal');
}

// Utility
function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.add('hidden');
    }
}
