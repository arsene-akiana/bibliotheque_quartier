const form = document.getElementById('loanForm');
const message = document.getElementById('message');
const memberSelect = document.getElementById('memberId');
const bookSelect = document.getElementById('bookId');
const loansBody = document.getElementById('loansBody');
let currentStatus = 'all';

function setDefaultDueDate() {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    document.getElementById('dueDate').value = date.toISOString().slice(0, 10);
}

async function loadMembers() {
    const members = await apiRequest('/api/members');
    memberSelect.innerHTML = '<option value="">Choisir un adherent</option>' + members.map((member) =>
        `<option value="${member.id}">${escapeHtml(member.name)}</option>`
    ).join('');
}

async function loadAvailableBooks() {
    const result = await apiRequest('/api/books?limit=50');
    const books = result.data.filter((book) => book.status === 'available');
    bookSelect.innerHTML = '<option value="">Choisir un livre</option>' + books.map((book) =>
        `<option value="${book.id}">${escapeHtml(book.title)} - ${escapeHtml(book.author_name)}</option>`
    ).join('');
}

async function loadLoans() {
    try {
        const loans = await apiRequest(`/api/loans?status=${currentStatus}`);
        loansBody.innerHTML = loans.map((loan) => `
            <tr class="${loan.loan_status === 'overdue' ? 'overdue-row' : ''}">
                <td>${escapeHtml(loan.member_name)}</td>
                <td>${escapeHtml(loan.book_title)}</td>
                <td>${loan.loan_date}</td>
                <td>${loan.due_date}</td>
                <td><span class="badge ${loan.loan_status}">${loan.loan_status}</span></td>
                <td>${loan.returned_at ? '-' : `<button class="success" type="button" onclick="returnBook(${loan.id})">Enregistrer le retour</button>`}</td>
            </tr>
        `).join('') || '<tr><td colspan="6">Aucun emprunt.</td></tr>';
    } catch (error) {
        showMessage(message, error.message, 'error');
    }
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = {
        member_id: Number(memberSelect.value),
        book_id: Number(bookSelect.value),
        due_date: document.getElementById('dueDate').value
    };

    try {
        if (!data.member_id || !data.book_id || !data.due_date) {
            throw new Error('Remplissez tous les champs.');
        }

        await apiRequest('/api/loans', { method: 'POST', body: JSON.stringify(data) });
        showMessage(message, 'Emprunt enregistre.');
        form.reset();
        setDefaultDueDate();
        await loadAvailableBooks();
        await loadLoans();
    } catch (error) {
        showMessage(message, error.message, 'error');
    }
});

async function returnBook(id) {
    if (!confirm('Confirmer le retour de ce livre ?')) return;
    try {
        await apiRequest(`/api/loans/${id}/return`, { method: 'PUT' });
        showMessage(message, 'Retour enregistre.');
        await loadAvailableBooks();
        await loadLoans();
    } catch (error) {
        showMessage(message, error.message, 'error');
    }
}

document.getElementById('showActive').addEventListener('click', async () => {
    currentStatus = 'active';
    await loadLoans();
});

document.getElementById('showOverdue').addEventListener('click', async () => {
    currentStatus = 'overdue';
    await loadLoans();
});

document.getElementById('showAll').addEventListener('click', async () => {
    currentStatus = 'all';
    await loadLoans();
});

async function start() {
    try {
        setDefaultDueDate();
        await loadMembers();
        await loadAvailableBooks();
        await loadLoans();
    } catch (error) {
        showMessage(message, error.message, 'error');
    }
}

start();
