// js/calendar.js

let bookingToDelete = null;

document.addEventListener("DOMContentLoaded", async function () {
  const bookingList = document.getElementById("booking-list");
  const calendarEl = document.getElementById("calendar");
  const deleteModal = document.getElementById("delete-modal");
  const confirmDeleteBtn = document.getElementById("confirm-delete");
  const cancelDeleteBtn = document.getElementById("cancel-delete");

  // Initialize current month and year
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
   // Check if user is logged in
  const isLoggedIn = localStorage.getItem("userPin") !== null;
 


  // Render the initial calendar and show today's bookings
  await renderCalendar(currentMonth, currentYear);
  displayBookings(formatDateToIST(new Date())); // Show today's bookings in IST by default

  // Add event listeners for previous and next buttons
  document.getElementById("prev-month").addEventListener("click", () => {
    changeMonth(-1);
  });

  document.getElementById("next-month").addEventListener("click", () => {
    changeMonth(1);
  });

  function changeMonth(offset) {
    currentMonth += offset;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear += 1;
    } else if (currentMonth < 0) {
      currentMonth = 11;
      currentYear -= 1;
    }
    renderCalendar(currentMonth, currentYear);
  }

  // Helper function to format a date in IST as YYYY-MM-DD
  function formatDateToIST(date) {
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istDate = new Date(date.getTime() + istOffset);
    const year = istDate.getUTCFullYear();
    const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(istDate.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async function renderCalendar(month, year) {
    calendarEl.innerHTML = ""; // Clear previous calendar
    const firstDay = new Date(Date.UTC(year, month, 1));
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    // Display the month and year
    document.getElementById("month-year").textContent = `${firstDay.toLocaleString('default', { month: 'long' })} ${year}`;

    // Fetch all bookings
    const bookings = await getAllBookings();

    // Prepare a set of dates with bookings
    const bookingDates = new Set();
    bookings.forEach(booking => {
      if (Array.isArray(booking.entries)) {
        booking.entries.forEach(entry => {
          if (entry.date) {
            bookingDates.add(entry.date); // Add date with booking in format YYYY-MM-DD
          }
        });
      }
    });

    // Create the grid for the calendar
    const startDay = firstDay.getUTCDay(); // Day of the week (0-6)
    const totalCells = daysInMonth + startDay;

    for (let i = 0; i < totalCells; i++) {
      const dateDiv = document.createElement('div');
      dateDiv.classList.add('calendar-cell');

      if (i >= startDay) {
        const day = i - startDay + 1;
        const date = new Date(Date.UTC(year, month, day));

        // Convert date to IST format YYYY-MM-DD
        const dateStr = formatDateToIST(date);

        dateDiv.classList.add('calendar-date');
        dateDiv.dataset.date = dateStr;
        dateDiv.textContent = day;

        // Highlight dates with bookings
        if (bookingDates.has(dateStr)) {
          dateDiv.classList.add('has-booking');
        }

        // Highlight the current date in IST
        const todayStr = formatDateToIST(new Date());
        if (dateStr === todayStr) {
          dateDiv.classList.add('current-date');
        }

        dateDiv.addEventListener('click', function () {
          displayBookings(dateStr);
        });
      }

      calendarEl.appendChild(dateDiv);
    }
  }

  // Use event delegation for dynamic elements
  bookingList.addEventListener('click', function(event) {
    if (event.target.classList.contains('delete-btn')) {
      bookingToDelete = event.target.getAttribute('data-id');
      deleteModal.style.display = "block";
    } else if (event.target.classList.contains('edit-btn')) {
      const bookingId = event.target.getAttribute('data-id');
      window.location.href = `edit-booking.html?id=${bookingId}`;
    }
  });
 
  confirmDeleteBtn.addEventListener('click', confirmDelete);
  cancelDeleteBtn.addEventListener('click', cancelDelete);
 

  async function displayBookings(date) {
    bookingList.innerHTML = "";
    const bookings = await getAllBookings();

    let bookingsFound = false;

    bookings.forEach((booking) => {
      if (Array.isArray(booking.entries)) {
        booking.entries.forEach(entry => {
          if (entry.date === date) { // Compare with IST-formatted date
            bookingsFound = true;
            const name = booking.name || 'Unknown';
            const place = booking.place || 'Unknown';
            const time = entry.time || 'Unknown';
            const program = entry.program || 'No program details';
            const djType = booking.djType || 'Unknown';
            const systemOprator = booking.systemOperator || 'Unknown';

            const li = document.createElement("li");
            li.classList.add("booking-itema");
            li.innerHTML = `
              <div class="booking-details">
                <strong>${name}</strong> - ${time} - ${program}
                <br><strong>Place:</strong> ${place}
                <br><strong>DJ Type:</strong> ${djType}
                <br><strong>System Operator:</strong>${systemOprator}
                <br><a href="view-booking.html?id=${booking.id}" target="_blank">View Details</a>
              </div>
              ${isLoggedIn ? `
                <div class="booking-actions">
                  <button class="edit-btn" data-id="${booking.id}">Edit</button>
                  <button class="delete-btn" data-id="${booking.id}">Delete</button>
                </div>
              ` : ''}
              `;

            bookingList.appendChild(li);
            // if (isLoggedIn) {
              // // addEditDeleteListeners(li, bookingIndex);
              // document.querySelectorAll('.edit-btn').forEach(btn => {
              //   btn.addEventListener('click', function() {
              //     const bookingId = this.getAttribute('data-id');
              //     window.location.href = `edit-booking.html?id=${bookingId}`;
              //   });
              // });

              // document.querySelectorAll('.delete-btn').forEach(btn => {
              //   btn.addEventListener('click', function() {
              //     bookingToDelete = this.getAttribute('data-id');
              //     deleteModal.style.display = "block";
              //   });
              // });

            //   confirmDeleteBtn.addEventListener('click', async function() {
            //   if (bookingToDelete !== null) {
            //     await confirmDelete();
            //     deleteModal.style.display = "none";
            //     location.reload();
            //   }
            // });

            // cancelDeleteBtn.addEventListener('click', function() {
            //   deleteModal.style.display = "none";
            //   bookingToDelete = null;
            // });

            // }
          }
        });
      }
    });

    if (!bookingsFound) {
      bookingList.innerHTML = "<p>No bookings found for this date.</p>";
    }
  }
  async function confirmDelete() {
    if (bookingToDelete !== null) {
      try {
        await deleteBookingFromServer(bookingToDelete);
        alert("Booking deleted successfully!");
        location.reload(); // Refresh the page to show updated list
      } catch (error) {
        console.error("Error deleting booking:", error);
        alert("Error deleting booking. Please try again.");
      } finally {
        cancelDelete(); // Hide the modal and reset bookingToDelete
      }
    }
  }
 
  function cancelDelete() {
    deleteModal.style.display = "none";
    bookingToDelete = null;
  }
    });

