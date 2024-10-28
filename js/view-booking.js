// js/view-booking.js

document.addEventListener("DOMContentLoaded", async function () {
  const bookingDetailsContainer = document.getElementById("booking-details");
  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get("id");

  const bookings = await getAllBookings();
  const booking = bookings[bookingId];

  if (!booking) {
    bookingDetailsContainer.innerHTML = "<p>Booking not found.</p>";
    return;
  }

  const bookingItem = document.createElement("div");
  bookingItem.classList.add("booking-item");

  const name = booking.name || 'Not provided';
  const place = booking.place || 'Not provided';
  const mobile = booking.mobile || 'Not provided';
  const advance = booking.advance || 'Not provided';
  const remaining = booking.remaining || 'Not provided';
  const djType = booking.djType || 'Not provided';
  const systemOperator = booking.systemOperator || 'None';


  let bookingDetails = `
    <h2>Booking Details</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Place:</strong> ${place}</p>
    <p><strong>Mobile Number:</strong> ${mobile}</p>
    <p><strong>Advance Paid:</strong> ${advance}</p>
    <p><strong>Remaining Amount:</strong> ${remaining}</p>
    <p><strong>DJ Type:</strong> ${djType}</p>
    <p><strong>System Operator:</strong> ${systemOperator}</p>
    <h3>Programs:</h3>
    <ul class="program-list">
  `;

  if (Array.isArray(booking.entries) && booking.entries.length > 0) {
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

  bookingDetails += "</ul>";
  bookingItem.innerHTML = bookingDetails;
  bookingDetailsContainer.appendChild(bookingItem);
});