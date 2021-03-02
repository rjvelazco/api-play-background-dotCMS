
// DOM ELEMENTS 

const controls  = document.querySelector('#controls'),
imgContainer    = document.querySelector('.image-container'),
img             = document.querySelector('#img'),
paramsContainer = document.querySelector('.params'),
focalPoints     = document.querySelector('.focal-point');
rotateInput     = document.querySelector('#rotate'),
cropInputX      = document.querySelector('#crop-x'),
cropInputY      = document.querySelector('#crop-y'),
coordinates     = document.querySelectorAll('.coordinate'),
inputValues     = document.querySelectorAll('.input-value'),
undos           = document.querySelectorAll('.undo'),
clip            = document.querySelector('#clip'),
alert           = document.querySelector('#alert'),
setbtn          = document.querySelector('#set'),
loading         = document.querySelector('#loading');


// BASE URL
const baseURL = 'https://demo.dotcms.com/contentAsset/image/17e7dc47-79d0-4525-87a4-40fb3429cbd4/fileAsset';


// ORIGINAL SIZE
const originalW = img.getBoundingClientRect().width,
originalH       = img.getBoundingClientRect().height;

let imgWidth    = img.getBoundingClientRect().width;
imgHeight       = img.getBoundingClientRect().height;

// IMAGE CONTAINER SIZE
const containerW = imgContainer.getBoundingClientRect().width;
containerH       = imgContainer.getBoundingClientRect().height;


// Variables
let hue = saturation = brightness = 0,
focalX  = focalY = 0.50,
cropX   = cropY  = 250,
width   = height = 0;

// URL PARAMS 
let HBS = filters = rotate = resize = crop = flip = quality = format = paramsURL = '';


// Events
controls.addEventListener('click', (e)=>{
    eventSelector(e.target, e.target.value, false);
});

controls.addEventListener('change', (e)=>{
    // console.log(e.target.getAttribute('id'));
    eventSelector(e.target, e.target.value, false);
});

controls.addEventListener('input', (e)=>{
    eventSelector(e.target, e.target.value, true);
});


const eventSelector = (target, value, updateInputs)=>{
    switch(target.getAttribute('id')){
        case 'format':
            format = (value === 'auto')? '': `/${value}`;
        break;
        case 'quality':
            quality = (value === '100')? '': `/${value}p`;
            if(updateInputs){
                inputValues[0].innerHTML = `${value}%`;
            }
        break;
        case 'zoom':
            width   = (originalW * value).toFixed(0);
            height  = (originalH * value).toFixed(0);

            resize = (value === '100')? '': `/resize_w/${width}`;

            // TODO
            // MOVE THIS TO IMG.ONLOAD();
            if(width >= containerW && height >= containerH){
                imgContainer.style.justifyContent = 'flex-start';
                imgContainer.style.alignItems     = 'flex-start';
            } else {
                imgContainer.style.justifyContent = 'center';
                imgContainer.style.alignItems     = 'center';
            }

            if(updateInputs){
                inputValues[1].innerHTML = `${(value * 100).toFixed(0)}%`;
            }

        break;
        case 'set':
            focalPoints.classList.toggle('show');

            if (focalPoints.classList.contains('show')){
                img.addEventListener('click', setFocalPoint);
                undos[0].classList.add('undo-active');
            } else{
                resetFocalPoint();
            }
        break;
        case 'crop-x':
            value = + value;
            cropX = (value >= imgWidth)? imgWidth: value;

            // Active the undo
            undos[1].classList.add('undo-active');
        break;
        case 'crop-y':
            value = + value;
            cropY = (value >= imgHeight)? imgHeight: value;

            // Active the undo
            undos[1].classList.add('undo-active');
        break;
        case 'crop':
            paramsCrop()
            resetFocalPoint();
        break;
        case 'rotate':
            paramsRotate(value);

            // Active the undo
            undos[2].classList.add('undo-active');
        break;
        case 'flip':
            paramsFlip();
        break;
        case 'flip-y':
            rotateInput.value = (rotateInput.value == 180)? 0: 180;
            paramsRotate(rotateInput.value);
        break;
        case 'brightness':
            if(updateInputs){
                inputValues[2].innerHTML = `${value}%`;
            }

            brightness = scale(value, -100, 100, -1, 1).toFixed(2);
            paramsHSB(hue, saturation, brightness);
        break;
        case 'hue':
            if(updateInputs){
                inputValues[3].innerHTML = `${value}%`;
            }

            hue = scale(value, -100, 100, -1, 1).toFixed(2);
            paramsHSB(hue, saturation, brightness);
        break;
        case 'saturation':
            if(updateInputs){
                inputValues[4].innerHTML = `${value}%`;
            }

            saturation = scale(value, -100, 100, -1, 1).toFixed(2);
            paramsHSB(hue, saturation, brightness);
        break;
        case 'undo-set':
            if(undos[0].classList.contains('undo-active')){
                resetFocalPoint();
                // focalPoints.classList.add('show');
                // undos[0].classList.remove('undo-active');
            }
        break;
        case 'undo-crop':
            if(undos[1].classList.contains('undo-active')){
                cropInputX.value = 250;
                cropInputY.value = 250;
                paramsCrop(true);

                undos[1].classList.remove('undo-active')
            }
        break;
        case 'undo-rotate':
            if(undos[2].classList.contains('undo-active')){
                paramsRotate(0);
                rotateInput.value = 0;
                undos[2].classList.remove('undo-active');
            }
        break;
    }

    if(!updateInputs){
        urlBuilder();
        setNewUrl(paramsURL);
        setParamsInput(paramsURL);
        loading.classList.remove('d-none');
    }
}

const urlBuilder = ()=>{
    paramsURL = `${resize}${HBS}${crop}${rotate}${flip}${quality}${format}`;
}

const setNewUrl = (params)=>{
    img.setAttribute('src', `${baseURL}${params}`)
}

const setParamsInput = (params)=>{
    paramsContainer.innerHTML = params;
}

const paramsHSB = (h,s,b)=>{
    HBS = (h == 0 && s == 0 && b ==0)
            ? ''
            : `/hsb_h/${h}/hsb_s/${s}/hsb_b/${b}`;
}

const paramsCrop = (undo = false)=>{
    crop = (undo)? '': `/crop_w/${cropX}/crop_h/${cropY}/fp/${focalX},${focalY}`;
}

const paramsRotate = (value)=>{
    rotate = (value == 0)? '': `/rotate_a/${value}`;
}

const paramsFlip = ()=>{
    flip = (flip.length > 0)? '': '/flip_flip/1';
}


// IMG EVENT FOCAL POINT

const setFocalPoint = (e)=>{

    const imgLeft = img.getBoundingClientRect().left,
    imgTop        = img.getBoundingClientRect().top,
    imgWidth      = img.getBoundingClientRect().width,
    imgHeight     = img.getBoundingClientRect().height,
    x             = e.clientX - imgLeft,
    y             = e.clientY - imgTop;

    // - 5 -> Because the width and height of the point is '10px', half of 10 is '5'
    focalPoints.style.left = `${x - 5 }px`;
    focalPoints.style.top  = `${y - 5}px`;

    focalX = scale(x, 0, imgWidth, 0, 1).toFixed(2);
    focalY = scale(y, 0, imgHeight, 0, 1).toFixed(2);

    setCoordinate(Math.round(focalX * 100), Math.round(focalY * 100));
}

// MAP SCALE
const scale = (num, in_min, in_max, out_min, out_max)=>{
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}


// RESET FOCAL POITN
const resetFocalPoint = ()=>{
    focalPoints.style.left = '50%';
    focalPoints.style.top  = '50%';
    focalX = 0.50;
    focalX = 0.50;
    setCoordinate(50,50);
    img.removeEventListener('click', setFocalPoint);
    focalPoints.classList.remove('show');
    undos[0].classList.remove('undo-active');
}

// Copy url
clip.addEventListener('click', ()=>{

    let clipInput = document.createElement('input');
    
    clipInput.setAttribute('value', baseURL+paramsURL);
    document.body.appendChild(clipInput);
    clipInput.select();

    document.execCommand('copy');
    document.body.removeChild(clipInput);

    alert.classList.remove('d-none');

    setTimeout(()=>{
        alert.classList.add('d-none');
    }, 2500);

});

// Set Coordinates
const setCoordinate = (x,y)=>{
    coordinates[0].innerHTML = `${x}<small>X</small>`;
    coordinates[1].innerHTML = `${y}<small>Y</small>`;
}

// On Load Image
img.addEventListener('load', ()=>{

    loading.classList.add('d-none');

});