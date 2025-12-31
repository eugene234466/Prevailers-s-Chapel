function toggleMenu(){
    const menu = document.getElementById('navMenu')
    menu.classList.toggle('active')
}

document.getElementById('navMenu').addEventListener('click',function(e){
    e.stopPropagation()
})

document.addEventListener('click', function(event){
    const nav = document.querySelector('nav')
    const menu = document.getElementById('navMenu')
    const toggle = document.querySelector('.menu-toggle')

    if(!toggle.contains(event.target) && !nav.contains(event.target)){
        menu.classList.toggle('active')
    }
})

document.querySelectorAll('#navMenu').forEach(link => {
    link.addEventListener('click', function(){
        document.getElementById('navMenu').classList.remove('active')
    })
})
