let bookingToDelete = null;

document.addEventListener("DOMContentLoaded", async function () {
  const bookingsListEl = document.getElementById("bookings-list");
  const deleteModal = document.getElementById("delete-modal");
  const confirmDeleteBtn = document.getElementById("confirm-delete");
  const cancelDeleteBtn = document.getElementById("cancel-delete");
  // let bookingToDelete = null;
  const filterOperatorSelect = document.getElementById("filter-operator");
  const filterStartDate = document.getElementById("filter-start-date");
  const filterEndDate = document.getElementById("filter-end-date");
  const applyFilterBtn = document.getElementById("apply-filter");
    const clearFilterBtn = document.getElementById("clear-filter");

 
  await populateOperators();

  try {
    const bookings = await getAllBookings();

    if (bookings.length === 0) {
      bookingsListEl.innerHTML = "<p>No bookings available.</p>";
      return;
    }

    renderBookings(bookings);
 
    // Add event listeners for edit and delete buttons
    addBookingEventListeners();
 
    confirmDeleteBtn.addEventListener('click', confirmDelete);
    cancelDeleteBtn.addEventListener('click', cancelDelete);
    applyFilterBtn.addEventListener('click', applyFilter);
        clearFilterBtn.addEventListener('click', clearFilters);

 
  } catch (error) {
    console.error("Error fetching bookings:", error);
    bookingsListEl.innerHTML = "<p>Error loading bookings. Please try again later.</p>";
  }
});
 
async function populateOperators() {
  try {
    const operators = await fetch(`${API_URL}/operators`).then(res => res.json());
    const filterOperatorSelect = document.getElementById("filter-operator");
    operators.forEach(operator => {
      const option = document.createElement("option");
      option.value = operator;
      option.textContent = operator;
      filterOperatorSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching operators:", error);
  }
}
 
function renderBookings(bookings) {
  const bookingsListEl = document.getElementById("bookings-list");
  bookingsListEl.innerHTML = "";
 
  if (bookings.length === 0) {
    bookingsListEl.innerHTML = "<p>No bookings available.</p>";
    return;
  }
 
  const listEl = document.createElement("ul");
  listEl.classList.add("bookings-list");
 
  bookings.forEach((booking, index) => {
    const bookingItem = document.createElement("li");
    bookingItem.classList.add("booking-item");
 
    // Format booking details
    const name = booking.name || "Unknown";
    const place = booking.place || "Unknown";
    const advance = booking.advance || "0";
    const remaining = booking.remaining || "0";
    const djType = booking.djType || "Unknown";
    const systemOperator = booking.systemOperator || "Unknown";
 
    // Booking info template
    let bookingDetails = `
      <h2>Booking #${index + 1}</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Place:</strong> ${place}</p>
      <p><strong>Advance Paid:</strong> ${advance}</p>
      <p><strong>Remaining Amount:</strong> ${remaining}</p>
      <p><strong>DJ Type:</strong> ${djType}</p>
      <p><strong>System Operator:</strong> ${systemOperator}</p>
      <h3>Programs:</h3>
      <ul class="program-list">
    `;
 
    // Add each program entry with date and time
    if (Array.isArray(booking.entries)) {
      booking.entries.forEach(entry => {
        const date = entry.date || "Unknown Date";
        const time = entry.time || "Unknown Time";
        const program = entry.program || "No Program Details";
 
        bookingDetails += `
          <li>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Program:</strong> ${program}</p>
          </li>
        `;
      });
    } else {
      bookingDetails += "<li>No program entries available.</li>";
    }
 
    bookingDetails += `
      </ul>
      <button class="edit-btn" data-id="${index}">Edit</button>
      <button class="delete-btn" data-id="${index}">Delete</button>
    `;
 
    bookingItem.innerHTML = bookingDetails;
    listEl.appendChild(bookingItem);
  });
 
  bookingsListEl.appendChild(listEl);
}
 
function addBookingEventListeners() {
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const bookingId = this.getAttribute('data-id');
      window.location.href = `edit-booking.html?id=${bookingId}`;
    });
  });
 
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      bookingToDelete = this.getAttribute('data-id');
      const deleteModal = document.getElementById("delete-modal");
      deleteModal.style.display = "block";
    });
  });
}
 
async function applyFilter() {
  const operator = document.getElementById("filter-operator").value;
  const startDate = document.getElementById("filter-start-date").value;
  const endDate = document.getElementById("filter-end-date").value;
  // Check if only one date is filled
  if ((startDate && !endDate) || (!startDate && endDate)) {
    alert("Please select both start and end dates, or leave both empty.");
    return;
  }
 
  // Check if start date is after end date
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      alert("Start date must be before or equal to the end date.");
      return;
    }
  }
 
  try {
    let url = `${API_URL}/filter?`;
    if (operator) url += `operator=${encodeURIComponent(operator)}&`;
    if (startDate) url += `startDate=${encodeURIComponent(startDate)}&`;
    if (endDate) url += `endDate=${encodeURIComponent(endDate)}`;
 
    const response = await fetch(url);
    const filteredBookings = await response.json();
    renderBookings(filteredBookings);
    addBookingEventListeners();
  } catch (error) {
    console.error("Error applying filter:", error);
    alert("Error applying filter. Please try again.");
  }
}

async function clearFilters() {
  const filterOperatorSelect = document.getElementById("filter-operator");
  const filterStartDate = document.getElementById("filter-start-date");
  const filterEndDate = document.getElementById("filter-end-date");
 
  filterOperatorSelect.value = "";
  filterStartDate.value = "";
  filterEndDate.value = "";
  // Reset any visual indicators of validation errors
  resetValidationErrors();
 
  try {
    const bookings = await getAllBookings();
    renderBookings(bookings);
    addBookingEventListeners();
  } catch (error) {
    console.error("Error clearing filters:", error);
    alert("Error clearing filters. Please try again.");
  }
}
 
function showDeleteModal(bookingId) {
  bookingToDelete = bookingId;
  const deleteModal = document.getElementById("delete-modal");
  deleteModal.style.display = "block";
}
function resetValidationErrors() {
  // Remove any error classes or messages
  const inputs = [filterOperatorSelect, filterStartDate, filterEndDate];
  inputs.forEach(input => input.classList.remove('error'));
  document.getElementById('filter-error-message').textContent = '';
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
  const deleteModal = document.getElementById("delete-modal");
  deleteModal.style.display = "none";
  bookingToDelete = null;
}
