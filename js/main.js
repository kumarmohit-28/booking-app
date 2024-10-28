// AI:
// Certainly! Here's the complete, updated main.js file incorporating all the changes we've discussed:

// js/main.js

async function saveBooking() {
  const name = document.getElementById("name").value || '';
  const place = document.getElementById("place").value || '';
  const mobile = document.getElementById("mobile").value || '';

  // Get all the date-time-program entries
  const entries = [];
  const entryContainers = document.querySelectorAll('.entry-container');

  entryContainers.forEach(container => {
    const date = container.querySelector('.date').value || '';
    const time = container.querySelector('.time').value || '';
    const program = container.querySelector('.program').value || '';

    entries.push({ date, time, program });
  });

  const advance = document.getElementById("advance").value || '';
  const remaining = document.getElementById("remaining").value || '';
  const djType = document.getElementById("dj-type").value;
  const systemOperatorSelect = document.getElementById("system-operator");
  let systemOperator = systemOperatorSelect.value;
 
  if (systemOperator === 'new') {
    const newOperator = document.getElementById("new-operator").value.trim();
    if (newOperator) {
      await addNewOperator(newOperator);
      systemOperator = newOperator;
    } else {
      alert("Please enter a name for the new operator.");
      return;
    }
  }

  const booking = {
    name,
    place,
    mobile,
    entries,
    advance,
    remaining,
    djType,
    systemOperator
  };

  try {
    const result = await saveBookingToServer(booking);
    alert("Booking saved successfully!");

    // Retrieve updated bookings to get the new booking ID
    const bookings = await getAllBookings();
    const bookingId = bookings.length - 1;

    // Generate a link to send to the client
    const bookingLink = `${window.location.origin}/view-booking.html?id=${bookingId}`;
    prompt("Copy this link to send to the client:", bookingLink);

    window.location.href = "calendar.html";
  } catch (error) {
    console.error(error);
    alert("Error saving booking. Please try again.");
  }
}
async function addNewOperator(newOperator) {
  try {
    const response = await fetch(`${API_URL}/operators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operator: newOperator })
    });
    if (!response.ok) throw new Error('Failed to add new operator');
  } catch (error) {
    console.error('Error adding new operator:', error);
    throw error;
  }
}

// Function to add a new entry field
function addEntry() {
  const entriesContainer = document.getElementById('entries-container');

  const entryDiv = document.createElement('div');
  entryDiv.classList.add('entry-container');

  entryDiv.innerHTML = `
    <h3>Entry</h3>
    <label>Date:
      <input type="date" class="date">
    </label>
    <label>Time:
      <input type="time" class="time">
    </label>
    <label>Program Details:
      <textarea class="program"></textarea>
    </label>
    <button type="button" class="remove-entry-button">Remove Entry</button>
  `;

  entriesContainer.appendChild(entryDiv);

  // Add event listener to the remove button
  entryDiv.querySelector('.remove-entry-button').addEventListener('click', function() {
    removeEntry(entryDiv);
  });

  updateRemoveButtons();
}

// Function to remove an entry
function removeEntry(entryDiv) {
  const entriesContainer = document.getElementById('entries-container');
  entriesContainer.removeChild(entryDiv);
  updateRemoveButtons();
}

// Function to update remove buttons visibility
function updateRemoveButtons() {
  const entries = document.querySelectorAll('.entry-container');
  const removeButtons = document.querySelectorAll('.remove-entry-button');

  removeButtons.forEach((button, index) => {
    if (entries.length > 1) {
      button.style.display = 'block';
    } else {
      button.style.display = 'none';
    }
  });
}

// Add event listener for the "Add Date & Program" button
document.addEventListener('DOMContentLoaded', async function() {
  // Add the first entry by default
  addEntry();
 
  document.getElementById('add-entry-button').addEventListener('click', addEntry);
 
  // Populate system operator dropdown
  const systemOperatorSelect = document.getElementById('system-operator');
  const operators = await getOperators();
  operators.forEach(operator => {
    const option = document.createElement('option');
    option.value = operator;
    option.textContent = operator;
    systemOperatorSelect.appendChild(option);
  });
 
  // Add "New Operator" option
  const newOperatorOption = document.createElement('option');
  newOperatorOption.value = 'new';
  newOperatorOption.textContent = 'New Operator';
  systemOperatorSelect.appendChild(newOperatorOption);
 
  // Show/hide new operator input field
  systemOperatorSelect.addEventListener('change', function() {
    const newOperatorInput = document.getElementById('new-operator');
    if (this.value === 'new') {
      newOperatorInput.style.display = 'block';
    } else {
      newOperatorInput.style.display = 'none';
    }
  });
});
 
async function getOperators() {
  const response = await fetch(`${API_URL}/operators`);
  return response.json();
}