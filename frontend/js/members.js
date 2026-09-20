const form = document.getElementById('memberForm');
const message = document.getElementById('message');
const body = document.getElementById('membersBody');
const cancelEdit = document.getElementById('cancelEdit');
const historyMember = document.getElementById('historyMember');
const historyBody = document.getElementById('historyBody');
let members = [];

async function loadMembers() {
    try {
        members = await apiRequest('/api/members');
        body.innerHTML = members.map((member) => `
            <tr><td>${member.id}</td><td>${escapeHtml(member.name)}</td><td>${escapeHtml(member.contact)}</td><td>
                <div class="actions">
                    <button type="button" onclick="editMember(${member.id})">Modifier</button>
                    <button type="button" class="danger" onclick="deleteMember(${member.id})">Supprimer</button>
                </div>
            </td></tr>
        `).join('');
        historyMember.innerHTML = '<option value="">Choisir un adherent</option>' + members.map((member) =>
            `<option value="${member.id}">${escapeHtml(member.name)}</option>`
        ).join('');
    } catch (error) { showMessage(message, error.message, 'error'); }
}

function editMember(id) {
    const member = members.find((item) => item.id === id);
    if (!member) return;
    document.getElementById('memberId').value = member.id;
    document.getElementById('name').value = member.name;
    document.getElementById('contact').value = member.contact;
    cancelEdit.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    form.reset();
    document.getElementById('memberId').value = '';
    cancelEdit.classList.add('hidden');
}

cancelEdit.addEventListener('click', resetForm);

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = document.getElementById('memberId').value;
    const data = { name: document.getElementById('name').value, contact: document.getElementById('contact').value };
    try {
        if (id) {
            await apiRequest(`/api/members/${id}`, { method: 'PUT', body: JSON.stringify(data) });
            showMessage(message, 'Adherent modifie.');
        } else {
            await apiRequest('/api/members', { method: 'POST', body: JSON.stringify(data) });
            showMessage(message, 'Adherent ajoute.');
        }
        resetForm();
        await loadMembers();
    } catch (error) { showMessage(message, error.message, 'error'); }
});

async function deleteMember(id) {
    if (!confirm('Supprimer cet adherent ?')) return;
    try {
        await apiRequest(`/api/members/${id}`, { method: 'DELETE' });
        showMessage(message, 'Adherent supprime.');
        await loadMembers();
    } catch (error) { showMessage(message, error.message, 'error'); }
}

document.getElementById('loadHistory').addEventListener('click', async () => {
    const id = historyMember.value;
    if (!id) {
        showMessage(message, 'Choisissez un adherent.', 'error');
        return;
    }
    try {
        const loans = await apiRequest(`/api/members/${id}/loans`);
        historyBody.innerHTML = loans.map((loan) => `
            <tr><td>${escapeHtml(loan.title)}</td><td>${loan.loan_date}</td><td>${loan.due_date}</td><td>${loan.returned_at || '-'}</td><td><span class="badge ${loan.loan_status}">${loan.loan_status}</span></td></tr>
        `).join('') || '<tr><td colspan="5">Aucun emprunt.</td></tr>';
    } catch (error) { showMessage(message, error.message, 'error'); }
});

loadMembers();
