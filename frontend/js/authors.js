const form = document.getElementById('authorForm');
const message = document.getElementById('message');
const body = document.getElementById('authorsBody');
let authors = [];
const cancelEdit = document.getElementById('cancelEdit');

async function loadAuthors() {
    try {
        authors = await apiRequest('/api/authors');
        body.innerHTML = authors.map((author) => `
            <tr><td>${author.id}</td><td>${escapeHtml(author.name)}</td><td>${escapeHtml(author.nationality)}</td><td>
                <div class="actions">
                    <button type="button" onclick="editAuthor(${author.id})">Modifier</button>
                    <button type="button" class="danger" onclick="deleteAuthor(${author.id})">Supprimer</button>
                </div>
            </td></tr>
        `).join('');
    } catch (error) { showMessage(message, error.message, 'error'); }
}

function editAuthor(id) {
    const author = authors.find((item) => item.id === id);
    if (!author) return;
    document.getElementById('authorId').value = author.id;
    document.getElementById('name').value = author.name;
    document.getElementById('nationality').value = author.nationality;
    cancelEdit.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    form.reset();
    document.getElementById('authorId').value = '';
    cancelEdit.classList.add('hidden');
}

cancelEdit.addEventListener('click', resetForm);

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = document.getElementById('authorId').value;
    const data = { name: document.getElementById('name').value, nationality: document.getElementById('nationality').value };
    try {
        if (id) {
            await apiRequest(`/api/authors/${id}`, { method: 'PUT', body: JSON.stringify(data) });
            showMessage(message, 'Auteur modifie.');
        } else {
            await apiRequest('/api/authors', { method: 'POST', body: JSON.stringify(data) });
            showMessage(message, 'Auteur ajoute.');
        }
        resetForm();
        await loadAuthors();
    } catch (error) { showMessage(message, error.message, 'error'); }
});

async function deleteAuthor(id) {
    if (!confirm('Supprimer cet auteur ?')) return;
    try {
        await apiRequest(`/api/authors/${id}`, { method: 'DELETE' });
        showMessage(message, 'Auteur supprime.');
        await loadAuthors();
    } catch (error) { showMessage(message, error.message, 'error'); }
}

loadAuthors();
