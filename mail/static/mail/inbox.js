document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'))
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'))
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'))
  document.querySelector('#compose').addEventListener('click', compose_email)

  // By default, load the inbox
  load_mailbox('inbox')
})

function compose_email() {
  
  // Show compose view and hide other views
  document.querySelector('#mailbox-view').style.display = 'none'
  document.querySelector('#email-view').style.display = 'none'
  document.querySelector('#compose-view').style.display = 'block'
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = ''
  document.querySelector('#compose-subject').value = ''
  document.querySelector('#compose-body').value = ''
  
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
    document.querySelector('#sent').click()

    // Add 'return false' to avoid reloading the page when the form is submitted
    return false
  }
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#mailbox-view').style.display = 'block'
  document.querySelector('#email-view').style.display = 'none'
  document.querySelector('#compose-view').style.display = 'none'

  // Show the mailbox name
  document.querySelector('#mailbox-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`

  // Get the emails
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {

      // Display a preview for each email in the mailbox
      emails.forEach((email) => {
        const preview_email = createCustomElement('div','email-preview')
        if (email.read) {
          preview_email.classList.add('read')
        } else {
          preview_email.classList.add('unread')
        }

        // Display email address based on if the user is the sender or receiver
        if (mailbox === 'sent') {
          who = `To: ${email.recipients}`
        } else {
          who = `From: ${email.sender}`
        }

        // Create HTML for the email preview
        const preview_container = createCustomElement('div', 'container')
        const preview_row = createCustomElement('div', 'row')
        
        who = `<div class="col 4">${who}</div>`
        subject = `<div class="col 4">${email.subject}</div>`
        timestamp = `<div class="col 4" style="text-align:right">${email.timestamp}</div>`
        preview_row.innerHTML = `${who}${subject}${timestamp}`
        preview_container.append(preview_row)
        preview_email.append(preview_container)
        
        // If the email is clicked then go to detailed email view
        preview_email.addEventListener('click', () => {
          load_email(email.id, mailbox)
        })
        document.querySelector('#mailbox-view').append(preview_email)
      })
    }) 
}

function load_email(email_id, mailbox) {

  // Show the email and hide other views
  document.querySelector('#mailbox-view').style.display = 'none'
  document.querySelector('#email-view').style.display = 'block'
  document.querySelector('#compose-view').style.display = 'none'

  // Display detailed email view
  fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
      sender = `<b>From:</b> ${email.sender}`
      receivers = `<b>To:</b> ${email.recipients}`
      subject = `<b>Subject:</b> ${email.subject}`
      timestamp = `<b>Timestamp:</b> ${email.timestamp}`
      body = `<p>${email.body}</p>`
      document.querySelector('#email-view').innerHTML = `${sender}<br>${receivers}<br>${subject}<br>${timestamp}<hr>${body}<hr>`
      
      // Create button for archiving/unarchiving the email
      if (mailbox != 'sent') {
        const archive_btn = document.createElement('button')
        document.querySelector('#email-view').append(archive_btn)
        if (email.archived) {
          archive_btn.innerHTML = "Unarchive"
        } else {
          archive_btn.innerHTML = "Archive"
        }
        archive_btn.addEventListener('click', () => {
          fetch(`/emails/${email_id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: !email.archived
            })
          })

          // Reloading the page will return the user to the inbox view
          location.reload()
        })
      }
      
    })
  
  // Update read property upon opening the email
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}

function createCustomElement(tag, classes) {
  classes = [].concat(classes)
  element = document.createElement(tag)
  if (classes) {
    classes.forEach((htmlclass) => {
      element.classList.add(htmlclass)
    })
  }
  return element
}