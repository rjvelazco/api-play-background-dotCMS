
const controls = document.querySelector('#controls'),
img = document.querySelector('#img'),
editImgContainer = document.querySelector('.edit-img-container');
point = document.querySelector('.focalpoint');

let brightness = 100, hue = 0, saturation = 1, rotate = 0, scale = 1, croppedX = 0, croppedY = 0;


// controls.addEventListener('focusout', (event)=>{

//     console.log(event);
//     console.log(event.target.getAttribute('id'));

// });

img.addEventListener('click',(event)=>{
    if(point.classList.contains('show')){
        setFocalPoint(event);
    }
});

controls.addEventListener('keyup', (event)=>{
    const target = event.target.getAttribute('id');
    const posibleTarget = ['width','height'];

    if(event.keyCode === 13){
        effectsFunction(target, event.target.value);
    }

});

controls.addEventListener('click', (event)=>{
    const target = event.target.getAttribute('id');
    const posibleTarget = ['set','left','right'];

    if(posibleTarget.includes(target)){
        effectsFunction(target, event.target.value);
        controls.children[1].children[1].value = rotate;
    }
})

controls.addEventListener('input', (event)=>{

    const target = event.target.getAttribute('id');
    const posibleTarget = ['rotate', 'hue', 'saturation', 'brightness', 'zoom'];

    if(posibleTarget.includes(target)){
        effectsFunction(target, event.target.value);
    }
});


const effectsFunction = (target, value) =>{
    
    switch(target){
        case 'set':
            point.classList.toggle('show');
            point.style.left = '50%';
            point.style.top = '50%';
        break;
        case 'width':
            croppedX = value;
            cropFuntion(croppedX, croppedY);
        break;
        case 'height':
            croppedY = value;
            cropFuntion(croppedX, croppedY);
        break;
        case 'zoom':
            zoom = value/100;
            transformProperty(rotate, zoom);
        break;
        case 'rotate':
            rotate = value;
            transformProperty(rotate, zoom);
        break;
        case 'left':
            rotate = (rotate===0)? 360: rotate - 90;
            console.log(rotate);
            transformProperty(rotate, zoom);
        break;
        case 'right':
            rotate = (rotate===360)? 0: rotate + 90;
            transformProperty(rotate, zoom);
        break;
        case 'brightness':
            brightness = value;
            hsbFilter();
        break;
        case 'hue':
            hue = value;
            hsbFilter();
        break;
        case 'saturation':
            saturation = value;
            hsbFilter();
        break;
    }

}


const hsbFilter = ()=>{
    img.style.filter = `hue-rotate(${hue}deg) saturate(${saturation}) brightness(${brightness}%)`;
}


const transformProperty = (rotatev, zoomv)=>{
    editImgContainer.style.transform = `rotate(${rotatev}deg)`;
    editImgContainer.style.transform = `scale(${zoomv})  rotate(${rotatev}deg)`;
    
}

const cropFuntion = (x, y)=>{
    console.log('hola');
    img.style.clipPath = `inset(${y}px ${x}px)`;
}

const setFocalPoint = (e)=>{
    console.log(img.getBoundingClientRect(),e.clientX);
    point.style.transform = `rotate(${rotate}deg`;
    point.style.left = `${e.clientX - img.getBoundingClientRect().left - 4}px`;
    point.style.top = `${e.clientY - img.getBoundingClientRect().top - 4}px`;
}
// transformProperty(20,1);