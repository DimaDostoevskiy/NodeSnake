const chatApp = document.getElementById('chat_app');
const chatMessages = document.getElementById('chat_messages');
const chatForm = document.getElementById('chat_form');
const chatInput = document.getElementById('chat_input');


socket.on('new_message', (msgObj) => {
    const newMessageEl = document.createElement('p');
    if(msgObj.id === socket.id){
        newMessageEl.classList.add('my_message')
    }

    newMessageEl.textContent = msgObj.msg
    chatMessages.prepend(newMessageEl);
})

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if(chatInput.value && chatInput.value.length < 45){
        socket.emit('chat_message', {id: socket.id, msg: chatInput.value})
        chatInput.value = '';
    }
})

document.addEventListener('keypress', (e) => {
    if(e.key === '\`'){
        chatApp.classList.toggle('hidden')

        if(!chatApp.classList.contains('hidden')){
            setTimeout(() => {
                chatInput.focus();
            })
        }
    }
})