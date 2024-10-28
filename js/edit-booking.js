// js/edit-booking.js

let currentBookingId;

document.addEventListener("DOMContentLoaded", async function () {
  const params = new URLSearchParams(window.location.search);
  currentBookingId = params.get("id");

  if (!currentBookingId) {
    alert("No booking ID provided");
    window.location.href = "all-bookings.html";
    return;
  }

  const bookings = await getAllBookings();
  const booking = bookings.find(b => b.id === currentBookingId);
  // const booking = bookings[currentBookingId];

  if (!booking) {
    alert("Booking not found");
    window.location.href = "all-bookings.html";
    return;
  }

  // Populate form fields
  document.getElementById("name").value = booking.name || '';
  document.getElementById("place").value = booking.place || '';
  document.getElementById("mobile").value = booking.mobile || '';
  document.getElementById("dj-type").value = booking.djType || '407';
  document.getElementById("advance").value = booking.advance || '';
  document.getElementById("remaining").value = booking.remaining || '';


  // Populate entries
  const entriesContainer = document.getElementById('entries-container');
  if (Array.isArray(booking.entries)) {
    booking.entries.forEach(entry => addEntry(entry));
  } else {
    addEntry();
  }

  // Add event listener for the "Add Date & Program" button
  document.getElementById('add-entry-button').addEventListener('click', () => addEntry());


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
    document.getElementById("system-operator").value = booking.systemOperator || 'none';

});

function addEntry(entry = null) {
  const entriesContainer = document.getElementById('entries-container');

  const entryDiv = document.createElement('div');
  entryDiv.classList.add('entry-container');

  entryDiv.innerHTML = `
    <h3>Entry</h3>
    <label>Date:
      <input type="date" class="date" value="${entry ? entry.date : ''}">
    </label>
    <label>Time:
      <input type="time" class="time" value="${entry ? entry.time : ''}">
    </label>
    <label>Program Details:
      <textarea class="program">${entry ? entry.program : ''}</textarea>
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

function removeEntry(entryDiv) {
  const entriesContainer = document.getElementById('entries-container');
  entriesContainer.removeChild(entryDiv);
  updateRemoveButtons();
}

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

async function getOperators() {

  const response = await fetch(`${API_URL}/operators`);

  return response.json();

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

async function updateBooking() {
  const name = document.getElementById("name").value || '';
  const place = document.getElementById("place").value || '';
  const mobile = document.getElementById("mobile").value || '';

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
    } else if (systemOperator === 'new') {
      alert("Please enter a name for the new operator.");
      return;
    }
  }

  const updatedBooking = {
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
    await updateBookingOnServer(currentBookingId, updatedBooking);
    alert("Booking updated successfully!");
    window.location.href = "all-bookings.html";
  } catch (error) {
    console.error(error);
    alert("Error updating booking. Please try again.");
  }
}