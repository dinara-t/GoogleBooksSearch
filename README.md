# Google Book Finder

A responsive React application that allows users to search for books using the Google Books API and view detailed information in a modal interface.
The project demonstrates client-side data fetching, component-based UI architecture, and clean state management using modern React practices.

## Live Demo

https://dinara-t.github.io/GoogleBooksSearch/

## Features

- Search books by title, author, or keyword
- Real-time results fetched from the Google Books API
- Book detail modal with extended metadata
- Keyboard accessibility (ESC to close modal)
- Click-outside-to-close modal behaviour
- Responsive layout for desktop and mobile
- Graceful handling of missing book data
- Clean, readable UI with SCSS modules

## Built With

- React
- JavaScript
- SCSS Modules
- Google Books API

## Pagination Bug & Fix

### Issue

A pagination issue was found when searching for some books (for example, _“The Lord of the Rings”_).

- The first search showed the correct number of results and pages.
- After moving to the next page, the total result count suddenly increased.
- This allowed users to keep clicking “Next” past the real results.
- Eventually, this led to a confusing **“No results found”** message.

### Cause

The app was using two different totals at different times:

- the total number reported by the Google Books API
- the total after client-side filtering

During pagination, the UI accidentally switched back to the API total, causing page counts to become incorrect.

### Fix

- The filtered total is now used consistently once it is calculated.
- Pagination no longer switches back to the API total.
- The “Next” button stops correctly at the last valid page.

### Result

Pagination is now stable and accurate, and users can no longer navigate past the available results.
