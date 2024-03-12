document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  
  // Show compose view and hide other views
  document.querySelector('#mailbox-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
  // Send email
  document.querySelector('form').onsubmit = () => {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value,
      })
    })

    // Navigate to 'Sent' mailbox
    document.querySelector('#sent').click();

    // Add 'return false' to avoid reloading the page when the form is submitted
    return false;
  }
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#mailbox-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#mailbox-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get the emails
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {

      // Display a preview for each email in the mailbox
      emails.forEach((email) => {
        const preview_email = document.createElement('div');
        preview_email.classList.add('email-preview');
        if (email.read) {
          preview_email.classList.add('read');
        }

        // Display email address based on if the user is the sender or receiver
        if (mailbox === 'sent') {
          who = `To: ${email.recipients}`;
        } else {
          who = `From: ${email.sender}`;
        }
        preview_email.innerHTML = `<h4>${email.subject}</h4><p>${who}</p><p>${email.timestamp}</p>`;
        preview_email.addEventListener('click', () => {
          load_email(email.id)
        });
        document.querySelector('#mailbox-view').append(preview_email);
      });
    }); 
}

function load_email(email_id) {

  // Show the email and hide other views
  document.querySelector('#mailbox-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Display detailed email view
  fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
        document.querySelector('#email-view').innerHTML = `<b>From:</b> ${email.sender}<br><b>To:</b> ${email.recipients}<br><b>Subject:</b> ${email.subject}<br><b>Timestamp:</b> ${email.timestamp}<hr><p>${email.body}</p>`
    });
  
  // Update read property upon opening the email
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
  return false;
}