document.addEventListener('DOMContentLoaded', () => {
  const filmsList = document.getElementById('films');
  const movieTitle = document.getElementById('title');
  const movieRuntime = document.getElementById('runtime');
  const movieDescription = document.getElementById('film-info');
  const movieShowtime = document.getElementById('showtime');
  const availableTickets = document.getElementById('ticket-num');
  const moviePoster = document.getElementById('poster');
  const buyTicketButton = document.getElementById('buy-ticket');

  // Function to fetch movie list from the server and populate the menu
  function fetchAndPopulateMovieList() {
    fetch('http://localhost:3000/films')
      .then(response => response.json())
      .then(films => {
        films.forEach(film => {
          const filmItem = document.createElement('li');
          filmItem.classList.add('film', 'item');
          const filmTitle = document.createElement('span');
          filmTitle.textContent = film.title;
          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Delete';
          deleteButton.classList.add('delete-btn');
          filmItem.appendChild(filmTitle);
          filmItem.appendChild(deleteButton);
          filmsList.appendChild(filmItem);

          // Add click event listener to each film item
          filmTitle.addEventListener('click', () => {
            fetchAndDisplayMovieDetails(film.id);
          });

          // Add event listener to delete button to remove film from the server and list
          deleteButton.addEventListener('click', () => {
            fetch(`http://localhost:3000/films/${film.id}`, {
              method: 'DELETE'
            }).then(() => {
              filmItem.remove();
            }).catch(error => {
              console.error('Error deleting movie:', error);
            });
          });
        });
      })
      .catch(error => {
        console.error('Error fetching movie list:', error);
      });
  }

  // Function to fetch and display movie details based on film ID
  function fetchAndDisplayMovieDetails(movieId) {
    fetch(`http://localhost:3000/films/${movieId}`)
      .then(response => response.json())
      .then(movie => {
        // Update movie details in the DOM
        movieTitle.textContent = movie.title;
        movieRuntime.textContent = `${movie.runtime} minutes`;
        movieDescription.textContent = movie.description;
        movieShowtime.textContent = movie.showtime;
        availableTickets.textContent = movie.capacity - movie.tickets_sold;
        moviePoster.src = movie.poster;

        // Update Buy Ticket button text and disabled state based on availability
        if (movie.capacity - movie.tickets_sold === 0) {
          buyTicketButton.textContent = 'Sold Out';
          buyTicketButton.disabled = true;
        } else {
          buyTicketButton.textContent = 'Buy Ticket';
          buyTicketButton.disabled = false;
        }

        // Add event listener to Buy Ticket button
        buyTicketButton.addEventListener('click', () => {
          buyTicket(movieId);
        });
      })
      .catch(error => {
        console.error('Error fetching movie details:', error);
      });
  }

  // Function to handle buying tickets
  function buyTicket(movieId) {
    fetch(`http://localhost:3000/films/${movieId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tickets_sold: parseInt(availableTickets.textContent) + 1
      })
    })
      .then(response => response.json())
      .then(updatedMovie => {
        // Update available tickets count
        availableTickets.textContent = updatedMovie.capacity - updatedMovie.tickets_sold;

        // Check if the movie is sold out
        if (parseInt(availableTickets.textContent) === 0) {
          buyTicketButton.textContent = 'Sold Out';
          buyTicketButton.disabled = true;
        }
      })
      .catch(error => {
        console.error('Error buying ticket:', error);
      });
  }

  // Call the function to fetch and populate movie list when the page loads
  fetchAndPopulateMovieList();
});