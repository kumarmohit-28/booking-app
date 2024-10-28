let bookingToDelete = null;

document.addEventListener("DOMContentLoaded", async function () {
  const bookingsListEl = document.getElementById("bookings-list");
  const deleteModal = document.getElementById("delete-modal");
  const confirmDeleteBtn = document.getElementById("confirm-delete");
  const cancelDeleteBtn = document.getElementById("cancel-delete");
  // let bookingToDelete = null;

  try {
    const bookings = await getAllBookings();

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

      // Booking info template
      let bookingDetails = `
        <h2>Booking #${index + 1}</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Place:</strong> ${place}</p>
        <p><strong>Advance Paid:</strong> ${advance}</p>
        <p><strong>Remaining Amount:</strong> ${remaining}</p>
        <p><strong>DJ Type:</strong> ${djType}</p>
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

    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const bookingId = this.getAttribute('data-id');
        window.location.href = `edit-booking.html?id=${bookingId}`;
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        bookingToDelete = this.getAttribute('data-id');
        deleteModal.style.display = "block";
      });
    });

    confirmDeleteBtn.addEventListener('click', async function() {
      if (bookingToDelete !== null) {
        await confirmDelete();
        deleteModal.style.display = "none";
        location.reload();
      }
    });

    cancelDeleteBtn.addEventListener('click', function() {
      deleteModal.style.display = "none";
      bookingToDelete = null;
    });

  } catch (error) {
    console.error("Error fetching bookings:", error);
    bookingsListEl.innerHTML = "<p>Error loading bookings. Please try again later.</p>";
  }
});

function showDeleteModal(bookingId) {
  bookingToDelete = bookingId;
  const deleteModal = document.getElementById("delete-modal");
  deleteModal.style.display = "block";
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