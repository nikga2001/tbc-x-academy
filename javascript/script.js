const users = [
  {
    name: "Alice",
    borrowed: [], // { bookId, borrowDate, dueDate, returnedDate }
    penaltyPoints: 0,
  },
  {
    name: "Bob",
    borrowed: [],
    penaltyPoints: 0,
  },
  {
    name: "Charlie",
    borrowed: [],
    penaltyPoints: 0,
  },
];

let books = [
  {
    id: 1,
    title: "JavaScript: The Good Parts",
    author: "Douglas Crockford",
    genre: "Programming",
    rating: 4.7,
    year: 2008,
    borrowCount: 0,
    available: true,
  },
  {
    id: 2,
    title: "Clean Code",
    author: "Robert C. Martin",
    genre: "Programming",
    rating: 4.8,
    year: 2009,
    borrowCount: 0,
    available: true,
  },
  {
    id: 3,
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    rating: 4.6,
    year: 1937,
    borrowCount: 0,
    available: true,
  },
  {
    id: 4,
    title: "1984",
    author: "George Orwell",
    genre: "Dystopian",
    rating: 4.5,
    year: 1949,
    borrowCount: 0,
    available: true,
  },
];

/** Finds user by name */
function findUser(userName) {
  return users.find((u) => u.name === userName);
}

/** Finds book by ID */
function findBook(bookId) {
  return books.find((b) => b.id === bookId);
}

/** Adds new book */
function addBook(book) {
  books.push({ ...book, borrowCount: 0, available: true });
}

/** Removes book only if not borrowed */
function removeBook(bookId) {
  const book = findBook(bookId);
  if (!book) return "Book not found.";
  if (!book.available) return "Book is currently borrowed.";
  books = books.filter((b) => b.id !== bookId);
  return "Book removed.";
}

/** Borrows a book if available and not already borrowed by same user */
function borrowBook(userName, bookId) {
  const user = findUser(userName);
  const book = findBook(bookId);
  if (!user || !book) return "User or book not found.";
  if (!book.available) return "Book is not available.";

  const alreadyBorrowed = user.borrowed.some(
    (b) => b.bookId === bookId && !b.returnedDate
  );
  if (alreadyBorrowed) return "You already borrowed this book.";

  const now = new Date();
  const due = new Date(now);
  due.setDate(now.getDate() + 14);
  user.borrowed.push({
    bookId,
    borrowDate: now,
    dueDate: due,
    returnedDate: null,
  });
  book.available = false;
  book.borrowCount++;
  return "Book borrowed.";
}

/** Returns a book and checks for penalty */
function returnBook(userName, bookId) {
  const user = findUser(userName);
  const book = findBook(bookId);
  if (!user || !book) return "User or book not found.";
  const entry = user.borrowed.find(
    (b) => b.bookId === bookId && !b.returnedDate
  );
  if (!entry) return "Book not borrowed by user.";
  const now = new Date();
  entry.returnedDate = now;
  book.available = true;
  if (now > entry.dueDate) {
    user.penaltyPoints += 1;
    return "Returned late. Penalty point added.";
  }
  return "Thank you for returning on time!";
}

/** Filters books by a parameter (author, genre, rating, year) */
function searchBooksBy(param, value) {
  return books.filter((book) => {
    if (param === "rating") return book.rating >= value;
    if (param === "year") return book.year && book.year >= value;
    return (
      book[param] &&
      book[param].toString().toLowerCase() === value.toString().toLowerCase()
    );
  });
}

/** Returns top N books by rating */
function getTopRatedBooks(limit) {
  return books
    .slice()
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

/** Returns top N most borrowed books */
function getMostPopularBooks(limit) {
  return books
    .slice()
    .sort((a, b) => b.borrowCount - a.borrowCount)
    .slice(0, limit);
}

/** Lists users with overdue books and days overdue */
function checkOverdueUsers() {
  const now = new Date();
  return users
    .map((user) => {
      const overdue = user.borrowed.filter(
        (b) => !b.returnedDate && b.dueDate < now
      );
      if (overdue.length === 0) return null;
      return {
        name: user.name,
        overdue: overdue.map((b) => ({
          bookId: b.bookId,
          daysOverdue: Math.ceil((now - b.dueDate) / (1000 * 60 * 60 * 24)),
        })),
      };
    })
    .filter(Boolean);
}

/** Suggests books based on user's borrowed genres */
function recommendBooks(userName) {
  const user = findUser(userName);
  if (!user) return [];
  const borrowedGenres = new Set(
    user.borrowed
      .map((b) => {
        const book = findBook(b.bookId);
        return book ? book.genre : null;
      })
      .filter(Boolean)
  );

  const readBookIds = new Set(user.borrowed.map((b) => b.bookId));

  return books.filter(
    (b) => b.available && borrowedGenres.has(b.genre) && !readBookIds.has(b.id)
  );
}

/** Shows borrowed books, overdue books, and penalty points */
function printUserSummary(userName) {
  const user = findUser(userName);
  if (!user) return "User not found.";
  const now = new Date();
  const borrowedBooks = user.borrowed
    .filter((b) => !b.returnedDate)
    .map((b) => findBook(b.bookId)?.title);
  const overdue = user.borrowed
    .filter((b) => !b.returnedDate && b.dueDate < now)
    .map((b) => findBook(b.bookId)?.title);
  return {
    borrowedBooks,
    overdue,
    penaltyPoints: user.penaltyPoints,
  };
}

// console.log(borrowBook("Alice", 1));
// console.log(returnBook("Alice", 1));
// console.log(searchBooksBy("author", "J.R.R. Tolkien"));
// console.log(getTopRatedBooks(2));
// console.log(getMostPopularBooks(2));
// console.log(checkOverdueUsers());
// console.log(recommendBooks("Alice"));
// console.log(printUserSummary("Alice"));
