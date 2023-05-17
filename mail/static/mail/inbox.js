document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox 
  
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#view').style.display = 'none';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
  };

function view_email(id,h){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view').innerHTML='';
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
  
      
  fetch(`/emails/${id}`)
        .then(response => response.json())
        .then(email => {
          // Archive/Unarchive
          fetch(`/req_user`) 
          .then(response => response.json())
          .then(user => {
          x=user[0]
          curr_user=x.fields.email
          })
      if(h != 'sent'){
          const arch= document.createElement('button')
          if (email.archived == true){
            arch.innerHTML = "Unarchive"
            arch.className = "unarc"
          }else{
            arch.innerHTML = "Archive"
            arch.className = "arc"
          }

        arch.addEventListener('click', function(){
          fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: !email.archived
            })
          })
          .then(()=> { load_mailbox('archive')})
        });
        document.querySelector('#view').append(arch);}
      
           const show= document.createElement('div')
              show.innerHTML=` <hr> From:${email.sender} <br> 
              To:${email.recipients} <br> 
              Subject:${email.subject} <br>
              Timestamp: ${email.timestamp} <br>
               <hr>
              ${email.body}`
              document.querySelector('#view').append(show)
              
             // reply button
              const reply= document.createElement('button')
              reply.innerHTML='Reply'
              reply.addEventListener('click', function(){
                compose_email()
                document.querySelector('#compose-recipients').value = email.sender;
                let subject= email.subject
                if (subject.split(" ",1)[0]!="Re:"){
                  subject = "Re: " + email.subject;
                }
                document.querySelector('#compose-subject').value = subject;
                let bodyy = email.body
                const regexPattern = /^(On) [A-Za-z]+ [0-9]+ [0-9]+, [0-9]+:[0-9]+ [A-Z]+ [A-Za-z0-9]+@[A-Za-z0-9]+\.[A-Za-z]+ [A-Za-z]+ : ([\s\S]*) -->([\s\S]*)$/g;
                const match= regexPattern.exec(bodyy)
                c=email.sender
                if (match){
                  text=match[3]
                if (curr_user== c){c="You"}
                
                  bodyy +=`On ${email.timestamp} ${c} Wrote : ${text} -->`;             
                }else{
                  bodyy = `On ${email.timestamp} ${c} Wrote : ${email.body} -->`;
                }

                
                
                document.querySelector('#compose-body').value= bodyy
              
                
              });
              document.querySelector('#view').append(reply)
              
            });
            
  }
function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  console.log()
// for not making appear the archive button appear only in the 'sent' mailbox.   
let h='other'
  if (mailbox=='sent'){
    h='sent';
  }
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`) 
    .then(response => response.json())
    .then(emails => {
          emails.forEach(singleEmail => {
            const NewEmail=document.createElement('div');
            
            if(singleEmail.read == true){
              NewEmail.className='read'
            }else{
              NewEmail.className='unread'
            }
            NewEmail.innerHTML= ` 
            <h6> Recipient:${singleEmail.recipients} <br>Sender:${singleEmail.sender}</h6>
            <h5>Subject:${singleEmail.subject}</h5>
            <p> Timestamp: ${singleEmail.timestamp}</p>`;
            
            NewEmail.addEventListener('click', function(){
              view_email(singleEmail.id,h)
            });
            document.querySelector('#emails-view').append(NewEmail);
          });
          
    })
   
};


function send_email(event){
  event.preventDefault();
  const recipients=document.querySelector('#compose-recipients').value;
  const subject=document.querySelector('#compose-subject').value;
  const body =document.querySelector('#compose-body').value;
  
  if (recipients!='' && subject == '' && body == ''){
  if (confirm("Send this message without a subject or text in the body?") == true) {
    fetch('/emails',{
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
          .then(response => response.json())
          .then(result => { 
            console.log(result)
              load_mailbox('sent');
  });
  } 
}else{
  fetch('/emails',{
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
        .then(response => response.json())
        .then(result => { 
          alert(result["error"])
            load_mailbox('sent');
});
}
}