INSERT INTO authors (name, nationality) VALUES
('Victor Hugo', 'Francaise'),
('George Orwell', 'Britannique'),
('Chinua Achebe', 'Nigeriane');

INSERT INTO members (name, contact) VALUES
('AKIANA Arsene', '0600000001'),
('Maestro Glory', '0600000002'),
('Laure Lily', '0600000003');

INSERT INTO books (title, author_id, publication_year) VALUES
('Les Miserables', 1, 1862),
('1984', 2, 1949),
('Things Fall Apart', 3, 1958);

INSERT INTO loans (member_id, book_id, loan_date, due_date) VALUES
(1, 2, CURRENT_DATE - 20, CURRENT_DATE - 6);

UPDATE books SET status = 'borrowed' WHERE id = 2;
