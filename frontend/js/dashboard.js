async function loadStats() {
    const message = document.getElementById('message');
    try {
        const stats = await apiRequest('/api/loans/stats');
        document.getElementById('totalBooks').textContent = stats.totalBooks;
        document.getElementById('totalMembers').textContent = stats.totalMembers;
        document.getElementById('activeLoans').textContent = stats.activeLoans;
        document.getElementById('overdueLoans').textContent = stats.overdueLoans;
        document.getElementById('mostBorrowedBook').textContent = stats.mostBorrowedBook
            ? `${stats.mostBorrowedBook.title} (${stats.mostBorrowedBook.loan_count} emprunt(s))`
            : 'Aucun emprunt';
        document.getElementById('mostActiveMember').textContent = stats.mostActiveMember
            ? `${stats.mostActiveMember.name} (${stats.mostActiveMember.loan_count} emprunt(s))`
            : 'Aucun emprunt';
    } catch (error) {
        showMessage(message, error.message, 'error');
    }
}
loadStats();
