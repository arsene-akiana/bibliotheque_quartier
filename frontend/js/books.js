const form = document.getElementById('bookForm');
const message = document.getElementById('message');
const body = document.getElementById('booksBody');
const authorSelect = document.getElementById('authorId');
const cancelEdit = document.getElementById('cancelEdit');
const search = document.getElementById('search');
let currentPage = 1;
let totalPages = 1;
let currentBooks = [];
let authors = [];

async function loadAuthors() {
    authors = await apiRequest('/api/authors');
    authorSelect.innerHTML = '<option value="">Choisir un auteur</option>' + authors.map((author) =>
        `<option value="${author.id}">${escapeHtml(author.name)}</option>`
    ).join('');
}

async function loadBooks() {
    try {
        const params = new URLSearchParams({ page: currentPage, limit: 8, search: search.value });
        const result = await apiRequest(`/api/books?${params.toString()}`);
        currentBooks = result.data;
        totalPages = result.pagination.totalPages;
        currentPage = result.pagination.page;

        body.innerHTML = currentBooks.map((book) => `
            <tr>
                <td>${book.id}</td>
                <td>${escapeHtml(book.title)}</td>
                <td>${escapeHtml(book.author_name)}</td>
                <td>${book.publication_year}</td>
                <td><span class="badge ${book.status}">${book.status}</span></td>
                <td>
                    <div class="actions">
                        <button type="button" onclick="editBook(${book.id})">Modifier</button>
                        <button type="button" class="danger" onclick="deleteBook(${book.id})">Supprimer</button>
                    </div>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="6">Aucun livre trouve.</td></tr>';

        document.getElementById('pageInfo').textContent = `Page ${currentPage} / ${totalPages}`;
        document.getElementById('previous').disabled = currentPage <= 1;
        document.getElementById('next').disabled = currentPage >= totalPages;
    } catch (error) {
        showMessage(message, error.message, 'error');
    }
}

function editBook(id) {
    const book = currentBooks.find((item) => item.id === id);
    if (!book) return;

    document.getElementById('bookId').value = book.id;
    document.getElementById('title').value = book.title;
    document.getElementById('authorId').value = book.author_id;
    document.getElementById('publicationYear').value = book.publication_year;
    cancelEdit.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    form.reset();
    document.getElementById('bookId').value = '';
    cancelEdit.classList.add('hidden');
}

cancelEdit.addEventListener('click', resetForm);

document.getElementById('searchButton').addEventListener('click', () => {
    currentPage = 1;
    loadBooks();
});

search.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        currentPage = 1;
        loadBooks();
    }
});

document.getElementById('previous').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage -= 1;
        loadBooks();
    }
});

document.getElementById('next').addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage += 1;
        loadBooks();
    }
});

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = document.getElementById('bookId').value;
    const data = {
        title: document.getElementById('title').value,
        author_id: Number(document.getElementById('authorId').value),
        publication_year: Number(document.getElementById('publicationYear').value)
    };

    try {
        if (!data.author_id) throw new Error('Choisissez un auteur.');
        if (id) {
            await apiRequest(`/api/books/${id}`, { method: 'PUT', body: JSON.stringify(data) });
            showMessage(message, 'Livre modifie.');
        } else {
            await apiRequest('/api/books', { method: 'POST', body: JSON.stringify(data) });
            showMessage(message, 'Livre ajoute.');
        }
        resetForm();
        currentPage = 1;
        await loadBooks();
    } catch (error) {
        showMessage(message, error.message, 'error');
    }
});

async function deleteBook(id) {
    if (!confirm('Supprimer ce livre ?')) return;
    try {
        await apiRequest(`/api/books/${id}`, { method: 'DELETE' });
        showMessage(message, 'Livre supprime.');
        await loadBooks();
    } catch (error) {
        showMessage(message, error.message, 'error');
    }
}

async function start() {
    try {
        await loadAuthors();
        await loadBooks();
    } catch (error) {
        showMessage(message, error.message, 'error');
    }
}

start();
