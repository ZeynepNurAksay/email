document.addEventListener('DOMContentLoaded', function() {

  
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = send_email;

  const divs = document.querySelectorAll("div");
  const divPressed = e => {
    if(e.target.className === 'email_pages'){
      email(e.target.id);
      if (e.target.id == e.target.id){
        e.stopPropagation();
      } 
    }
    
  }
  for (let div of divs) {
    div.addEventListener("click", divPressed);
  }

  

  // By default, load the inbox
  load_mailbox('inbox');
});
var sent_mailbox;
function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email').style.display = 'none';

  // Clear out composition fields
  if(!localStorage.getItem('recipients')){
    recipients = document.querySelector('#compose-recipients').value;
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-recipients').disabled = false;
  }
  else{
    recipients = localStorage.getItem('recipients');
    document.querySelector('#compose-recipients').value = recipients;
    document.querySelector('#compose-recipients').disabled = true;
    localStorage.removeItem('recipients');
  }

  if(!localStorage.getItem('subject')){
    subject = document.querySelector('#compose-subject').value;
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-subject').disabled = false;
  }
  else{
    subject = localStorage.getItem('subject');
    document.querySelector('#compose-subject').value = subject;
    document.querySelector('#compose-subject').disabled = true;
    localStorage.removeItem('subject');
  }
  if(!localStorage.getItem('body')){
    body = document.querySelector('#compose-body').value;
    document.querySelector('#compose-body').value = '';
    document.querySelector('#compose-body').disabled = false;
  }
  else{
    body = localStorage.getItem('body');
    document.querySelector('#compose-body').value = body.replaceAll('<br>', '\n').replaceAll('<br><br>', '\n');
    document.querySelector('#compose-body').disabled = false;
    localStorage.removeItem('body');
  }
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    
    console.log(emails);

    if(mailbox === 'sent'){
      sent_mailbox = emails;
    }
    else{
      sent_mailbox = [];
    }
    emails.forEach(email => {
      const div1 =  document.createElement('div');
      div1.className = 'card h-100';
      div1.style.marginBottom = '1%';
      const div2 =  document.createElement('div');
      const button = document.createElement('button');
      if(email["read"]){
        button.style.backgroundColor = 'gray';
      }
      else{
        button.style.backgroundColor = 'white';
      }
      button.style.border = 'none';
      button.style.outline = 'none';
      button.id = email["id"];
      button.className = 'email_pages';
      const sender = document.createElement('p');
      sender.style.marginLeft = '1%';
      sender.style.marginBottom = '0';
      sender.style.fontWeight = 'bold';
      sender.style.cssFloat = 'left';
      sender.style.color = 'black';
      sender.innerHTML = email["sender"];
      const subject = document.createElement('p');
      subject.style.marginLeft = '1%';
      subject.style.marginBottom = '0';
      subject.style.cssFloat = 'left';
      subject.style.color = 'black';
      subject.innerHTML = email["subject"];
      const date = document.createElement('p');
      date.style.marginRight = '1%';
      date.style.marginBottom = '0';
      date.style.cssFloat = 'right';
      date.style.color = 'black';
      date.innerHTML = email["timestamp"];
      div2.innerHTML += sender.outerHTML + subject.outerHTML + date.outerHTML;
      button.innerHTML += div2.outerHTML;
      div1.innerHTML += button.outerHTML;
      if(email["read"]){
        div1.style.backgroundColor = 'gray';
      }
      else{
        div1.style.backgroundColor = 'white';
      }
      document.querySelector('#emails-view').appendChild(div1);
    
    });
  });
  
}

function send_email(event) {
  event.preventDefault();
  recipients = document.querySelector('#compose-recipients').value;
  subject = document.querySelector('#compose-subject').value;
  body = document.querySelector('#compose-body').value;
  
  fetch('/emails', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body.replace(/(?:\r\n|\r|\n)/g, '<br>')
    })
  })
  .then(response => response.json())
  .then(result => {
    // Print result
    console.log(result);
  });
  load_mailbox('sent');
}

function email(email_id) {
  // Show email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'block';
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);
    document.querySelector('#subject').innerHTML = email["subject"];
    document.querySelector('#from').innerHTML = `From: ${email["sender"]}`;
    document.querySelector('#to').innerHTML = `To: ${email["recipients"]}`;
    document.querySelector('#date').innerHTML = `${email["timestamp"]}`;
    document.querySelector('#body').innerHTML = `${email["body"]}`;
    
    if(sent_mailbox.some(sent_mail => sent_mail["id"] === email['id'])){
      
      document.querySelector('#archive').style.display = 'none';
      document.querySelector('#unarchive').style.display = 'none';
    }
    else{
      

      if(email["archived"]){
        document.querySelector('#unarchive').style.display = 'block';
        document.querySelector('#archive').style.display = 'none';
      }
      else{
        document.querySelector('#archive').style.display = 'block';
        document.querySelector('#unarchive').style.display = 'none';
      }
    }
    
    

    update_read(email["id"]);
    document.querySelector('#archive').onclick = function(){
      is_archived(email["id"]);
      load_mailbox('inbox');
    }
    
    document.querySelector('#unarchive').onclick = function(){
      not_archived(email["id"]);
      load_mailbox('inbox');
    }

    document.querySelector('#reply').onclick = function(){
      if(!localStorage.getItem('recipients')){
        localStorage.setItem('recipients', email["sender"]);
      }
      if(!localStorage.getItem('subject')){
        if(email["subject"].includes('Re: ')){
          localStorage.setItem('subject', email["subject"]);
        }
        else{
          localStorage.setItem('subject', `Re: ${email["subject"]}`);
        }
      }
      let html_body = `\nOn ${email["timestamp"]} ${email["sender"]} wrote:\n${email["body"]}\n`;
      if(!localStorage.getItem('body')){
        
        localStorage.setItem('body', html_body);
      }
      email["body"] = html_body;
      compose_email();
    }
    
  });
}

function update_read(email_id) {
  // Show email view and hide other views
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
        read: true
    })
  })
}

function is_archived(email_id) {
  // Show email view and hide other views
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      archived: true
    })
  })
}

function not_archived(email_id) {
  // Show email view and hide other views
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      archived: false
    })
  })
}