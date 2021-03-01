
// CONST
const controls = document.querySelector('#controls'),
img = document.querySelector('#img'),
imgContainer = document.querySelector('.image-container'),
paramSpan = document.querySelector('.params'),
clip = document.querySelector('#clip'),
spans = document.querySelectorAll('.input-value'),
coordinates = document.querySelectorAll('.coordinate')
undos = document.querySelectorAll('.undo'),
rotateInput = document.querySelectorAll('#rotate'),
alert = document.querySelector('#alert');


const point = document.querySelector('.focal-point');
const url =  'https://demo.dotcms.com/contentAsset/image/17e7dc47-79d0-4525-87a4-40fb3429cbd4/fileAsset';

img.addEventListener('load', ()=>{
    console.log('Imagen Llamada');
    point.style.left = '50%';
    point.style.top = '50%';
    coordinates[0].innerHTML = `50 <small>X</small>`;
    coordinates[1].innerHTML = `50 <small>Y</small>`;
    
});

// VARIABLES
let hue = saturation = brightness = width = height = focalX = focalY = 0, cropX = cropY = 250, flip = HBS = filters = rotate = resize = crop = '',
urlParams = '',
originalWidth = img.getBoundingClientRect().width,
originalHeight = img.getBoundingClientRect().height;


controls.addEventListener('click', (e)=>{
    const podsibleOption = ['crop', 'flip', 'set']
    if(podsibleOption.includes(e.target.getAttribute('id'))){
        params(e.target.getAttribute('id'), e.target.value);
    }
});

controls.addEventListener('input', (e)=>{
    params(e.target.getAttribute('id'), e.target.value);
});


const params = (target, value)=>{
    switch (target) {
        case 'set':
        break;
        case 'quality':
            spans[0].innerHTML = value+'%';
        break;
        case 'zoom':
            width = ( originalWidth * value).toFixed(2),
            hieght = ( originalHeight * value).toFixed(2);
            img.style.width = `${width}px`;
            img.style.height = `${hieght}px`;
            // paramResize();
            if(width >=  imgContainer.getBoundingClientRect().width && hieght >=  imgContainer.getBoundingClientRect().height){
                imgContainer.style.justifyContent = 'flex-start';
                imgContainer.style.alignItems = 'flex-start';
            } else{
                imgContainer.style.justifyContent = 'center';
                imgContainer.style.alignItems = 'center';
            }
            spans[1].innerHTML = (value*100).toFixed(0)+'%';

            // console.log(width, imgContainer.getBoundingClientRect().width);
        break;
        case 'crop-x':
            cropX = value;
        break;
        case 'crop-y':
            cropY = value;
        break;
        case 'crop':
            paramCrop();
        break;
        case 'width':
            width = value;
            originalWidth = value;
            paramResize();
        break;
        case 'height':
            originalHeight = value;
        break;
        case 'rotate':
            paramRotate(value);
        break;
        case 'flip':
            paramflip();
        break;
        case 'hue':
            spans[3].innerHTML = value+'%';
            hue = scale(value, -100, 100, -1, 1).toFixed(2);
            paramHSB(hue, saturation, brightness);         
        break;
        case 'saturation':
            spans[4].innerHTML = value+'%';
            saturation = scale(value, -100, 100, -1, 1).toFixed(2);
            paramHSB(hue, saturation, brightness);                     
        break;
        case 'brightness':
            spans[2].innerHTML = value+'%';
            brightness = scale(value, -100, 100, -1, 1).toFixed(2);
            paramHSB(hue, saturation, brightness);         
        break;
    }
    buildURL();
    changeInput(urlParams);
}

const buildURL = ()=>{

    filters = filters.substring(0, filters.length - 1);

    urlParams = `${HBS}${rotate}${crop}${flip}`;

    if(urlParams === '/filter'){
        urlParams = '';
    }

    console.log(url+urlParams);
    img.setAttribute('src', `${url}${urlParams}`);
    filters = '';
}

const changeInput = (params)=>{

    paramSpan.innerHTML = (width > 0)? `/resize_w/${Math.round(width)}${params}`:params;
}

const paramHSB = (h,s,b)=>{ 
    if(h == 0 && s == 0 && b == 0){
        HBS = '';
    } else{
        HBS = `/hsb_h/${h}/hsb_s/${s}/hsb_b/${b}`;
    }
}

const paramflip = ()=>{
    flip = (flip.length > 0)? '': '/flip_flip/1';
}

const paramRotate = (value)=>{
    if(value == 0){
        rotate = '';
    } else {
        rotate = `/rotate_a/${value}`;
    }
}

const paramResize = ()=>{
    resize = `/resize_w/${Math.round(width)}`;
}

const paramCrop = () => {
    crop = `/crop_w/${cropX}/crop_h/${cropY}/fp/${focalX},${focalY}` 
}

const scale = (num, in_min, in_max, out_min, out_max) => {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

const setFocalPoint = (e)=>{
    console.log(img.getBoundingClientRect(),e.clientX, point.getBoundingClientRect());
    point.style.left = `${e.clientX - img.getBoundingClientRect().left - 4}px`;
    point.style.top = `${e.clientY - img.getBoundingClientRect().top - 4}px`;
    x = e.clientX - img.getBoundingClientRect().left;
    y = e.clientY - img.getBoundingClientRect().top;
    focalX = scale(x, 0, img.getBoundingClientRect().width, 0, 1).toFixed(2);
    focalY = scale(y, 0, img.getBoundingClientRect().height, 0, 1).toFixed(2);
    console.log(focalX);
    coordinates[0].innerHTML = `${Math.round(focalX * 100)} <small>X</small>`;
    coordinates[1].innerHTML = `${Math.round(focalY * 100)} <small>Y</small>`;
}

img.addEventListener('click',(event)=>{
    if(point.classList.contains('show')){
        setFocalPoint(event);
    }
});



// Copiar URL

clip.addEventListener('click', ()=>{
    let aux = document.createElement("input");
    aux.setAttribute("value", url+urlParams);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    document.body.removeChild(aux);
    alert.classList.remove('d-none');
    setTimeout(()=>{
        alert.classList.add('d-none');
    }, 2500);
});


undos[0].addEventListener("click", ()=>{
    point.style.left = '50%';
    point.style.top = '50%';
    coordinates[0].innerHTML = `50 <small>X</small>`;
    coordinates[1].innerHTML = `50 <small>Y</small>`;
});

undos[1].addEventListener("click", ()=>{

    cropX = 250;
    cropY = 250;
    changeInput(urlParams);
});


undos[2].addEventListener("click", ()=>{
    console.log('hola');
    flip = '/flip_flip/1';
    rotate = '';
    paramRotate(0);
    rotateInput.value = 0;
    paramflip();
    buildURL();
    changeInput(urlParams);
});
