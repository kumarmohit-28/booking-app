// js/storage.js

// URL of the API endpoint
const API_URL = (() => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000/api/bookings';
  } else {
    // For production, use the current origin
    return `${window.location.origin}/api/bookings`;
  }
})();
// Function to get all bookings from the server
async function getAllBookings() {
  try {
    const response = await fetch(API_URL);
    if (response.ok) {
      const bookings = await response.json();
      return bookings;
    } else {
      console.error('Failed to fetch bookings:', response.statusText);
      return [];
    }
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

// Function to save a booking to the server
async function saveBookingToServer(booking) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(booking)
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Failed to save booking: ' + response.statusText);
    }
  } catch (error) {
    console.error('Error saving booking:', error);
    throw error;
  }
}

async function deleteBookingFromServer(bookingId) {
  try {
    const response = await fetch(`${API_URL}/${bookingId}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Failed to delete booking: ' + response.statusText);
    }
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
}

async function updateBookingOnServer(bookingId, updatedBooking) {
  try {
    const response = await fetch(`${API_URL}/${bookingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedBooking)
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Failed to update booking: ' + response.statusText);
    }
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
}
