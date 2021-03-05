const controls  = document.querySelector('#controls'),
imgContainer    = document.querySelector('#image-container'),
img             = document.querySelector('#img'),
paramsContainer = document.querySelector('#params'),
focalPoints     = document.querySelector('#focal-point');
qualityRange    = document.querySelector('#quality'),
rotateInput     = document.querySelector('#rotate'),
zoomInput       = document.querySelector('#zoom'),
cropInputX      = document.querySelector('#crop-x'),
cropInputY      = document.querySelector('#crop-y'),
coordinates     = document.querySelectorAll('.coordinate'),
inputValues     = document.querySelectorAll('.input-value'),
undos           = document.querySelectorAll('.undo'),
clip            = document.querySelector('#clip'),
alert           = document.querySelector('#alert'),
setbtn          = document.querySelector('#set'),
loading         = document.querySelector('#loading'),
btnCrop         = document.querySelector('#crop'),
btnSet          = document.querySelector('#set');

// BASE URL
const baseURL = 'https://demo.dotcms.com/contentAsset/image/f67e0a14-b16b-47fc-ae5c-f711333b04c1/image';

const containerW = imgContainer.getBoundingClientRect().width;
containerH      = imgContainer.getBoundingClientRect().height;

const imageRect = img.getBoundingClientRect();

// Image Size
const initialW = imageRect.width,
initialH      = imageRect.height;

let originalW = imageRect.width,
originalH     = imageRect.height,
imgWidth      = imageRect.width;
imgHeight     = imageRect.height;

// Variables
let focalX  = focalY = 0.50,
cropX   = cropY  = 250,
width   = height = 0,
qualityV = 100;

let HSB = {
    h: 0,
    s: 0, 
    b: 0 
}

// URL PARAMS 
let params ={
    HBS     : '',
    filters : '',
    rotate  : '',
    fp      : '',
    resize  : '',
    crop    : '',
    flip    : '',
    quality : '_q/100',
    format  : '/quality',
    cropFlipRotate: ''
}

let paramsURL = '';
let cropFlipRotate = '';
let pastRotate = '';

let state = {action: '', input : '', value : '', update: false}

// EVENTLISTENERS
controls.addEventListener('click', (e)=>{
   const actions = ['flip','flip-y', 'crop', 'undo-crop', 'undo-rotate'];
   callEvent(actions, e);
});

controls.addEventListener('change', (e)=>{
    const actions = ['crop-x','crop-y', 'quality', 'zoom', 'brightness', 'hue', 'saturation', 'format'];
    callEvent(actions, e); 
});

controls.addEventListener('input', (e)=>{
    const actions = ['rotate'];
    callEvent(actions, e);
});

const callEvent = (actions, e)=>{
    state.action  = e.target.getAttribute('id');
    state.input   = e.target;
    state.value   = e.target.value;
 
    state.update  = (actions.includes(state.action))? false: true;
    
    eventSelector(state, params);
}

// p -> params [Object]
const eventSelector = ({action, input, value, update}, p)=>{

    switch(action){
        case 'format':
            paramsFormat(p, value, update);
        break;
        case 'quality':
            if(!p.format.includes('Png')){
                qualityV = value;
                paramsQuality(p, value);
                updateInputValue(update, 0, value);
            }
        break;
        case 'zoom':
            zoomEvent(p, value);
        break;
        case 'set':
            setEvent(input);
        break;
        case 'crop-x':
            cropX = cropValueEvent(input, value, imgWidth);
        break;
        case 'crop-y':
            cropY = cropValueEvent(input, value, imgHeight);
        break;
        case 'crop':
            cropEvent(p);
        break;
        case 'rotate':
            rotateEvent(p,value);
        break;
        case 'flip':
            p.flip = (p.flip.length > 0)? '': '/flip_flip/1';
            p.cropFlipRotate = p.cropFlipRotate.replace('/flip_flip/1', '');
            p.cropFlipRotate += p.flip;
            // console.log(cropFlipRotate);
            toggleActiveUndos(true, 2);
        break;
        case 'flip-y':
            flipYEvent(p, value);
        break;
        case 'brightness':
            brightnessEvent(p, update, value);
        break;
        case 'hue':
            hueEvent(p, update, value);
        break;
        case 'saturation':
            saturationEvent(p, update, value);
        break;
        case 'undo-set':
            undoSetEvent();
        break;
        case 'undo-crop':
            undoCropEvent(p);
        break;
        case 'undo-rotate':
            undoRotateEvent(p);
        break;
    }
    
    urlBuilder(p);
    updateParamsInput(p, paramsURL,);
    if(!update){
        loading.classList.remove('d-none');
        setURL(baseURL, paramsURL);
    } else if(action === 'zoom'){
        updateParamsInput(p, paramsURL,);
    }
}

// SET URLS
const urlBuilder = ({HBS, crop, rotate, flip, quality, format, cropFlipRotate})=>{
    paramsURL = HBS + cropFlipRotate + format + quality;
}

const setURL = (baseUrl, params)=>{
    img.setAttribute('src', baseUrl+params);
}

const updateParamsInput = (p, params)=>{
    params = params.replace(p.crop, p.crop + p.resize);
    paramsContainer.innerHTML = params ;
}

// EVENTS
const zoomEvent = (p, value)=>{
    const width = (originalW * value).toFixed(0),
    height      = (originalH * value).toFixed(0),
    inputValue  = (value*100).toFixed(0)

    img.style.width  = `${width}px`;
    img.style.height = `${height}px`;
    
    p.resize = (value === '100')? '': `/resize_w/${width}`;
    
    imagePosition(width, height);
    
    updateInputValue(true, 1, inputValue);
}

const setEvent = (input)=>{
    focalPoints.classList.toggle('show');
    const containsShow = focalPoints.classList.contains('show');
    if(containsShow){
        img.addEventListener('click', setFocalPoint);
        input.innerHTML = 'Unset';
    } else{
        input.innerHTML = 'Set';
        resetFocalPoint();
    }
    toggleActiveUndos(containsShow, 0);
}

const cropValueEvent = (input, value, maxValue)=>{
    let cropValue = (value >= maxValue)? maxValue : value;
    input.value = Math.round(cropValue);
    toggleActiveUndos(true, 1);
    return cropValue;
}

const cropEvent = (p)=>{
    toggleActiveUndos(true, 1);
    toggleActiveUndos(false, 0);
    
    resetFocalPoint();
    
    originalW = cropX;
    originalH = cropY;
    
    btnSet.disabled  = true;
    btnCrop.disabled = true;
    btnSet.innerHTML = 'set';
    
    focalPoints.classList.remove('show');
    paramsCrop(p, false);
    resetZoom();
    imageDimensionsAuto();
    imgContainer.style.justifyContent = 'center';
    imgContainer.style.alignItems     = 'center';
}

const rotateEvent = (p, value)=>{
    paramsRotate(p, value);
    toggleActiveUndos(true, 2);
}

const flipYEvent = (p, value)=>{
    value = (rotateInput.value == 180)? 0: 180;
    rotateInput.value = value;
    paramsRotate(p, value);
    toggleActiveUndos(true, 2);
}

const brightnessEvent = (p, update, value)=>{
    HSB.b = scale(value, -100, 100, -1, 1).toFixed(2);
    updateInputValue(update, 2, value);
    paramsHSB(p, HSB);
}

const hueEvent = (p, update, value)=>{
    HSB.h = scale(value, -100, 100, -1, 1).toFixed(2);
    updateInputValue(update, 3, value);
    paramsHSB(p, HSB);
}

const saturationEvent = (p, update, value)=>{
    HSB.s = scale(value, -100, 100, -1, 1).toFixed(2);
    updateInputValue(update, 4, value);
    paramsHSB(p, HSB);
}

const undoSetEvent = ()=>{
    resetFocalPoint();
    focalX = 0.50;
    focalY = 0.50;
    btnSet.disabled = false;
}

const undoCropEvent = (p)=>{
    cropInputX.value = 250;
    cropInputY.value = 250;

    originalW = initialW;
    originalH = initialH;

    p.cropFlipRotate = p.cropFlipRotate.replace(p.crop, '');

    paramsCrop(p, true);
    toggleActiveUndos(false, 1);

    btnCrop.disabled = false;
    btnSet.disabled = false;
    imageDimensionsAuto();
    resetZoom();
}

const undoRotateEvent = (p)=>{
    paramsRotate(p, 0);
    rotateInput.value = 0;
    p.cropFlipRotate = p.cropFlipRotate.replace('/flip_flip/1', '');
    p.flip = '';
    toggleActiveUndos(false, 2);
}

// SET PARAMETERS
const paramsFormat = (p, value, update)=>{
    p.format = (value === 'auto')? '/quality': `/${value}`;
    if(p.format.includes('Png')){
        p.quality = '';
        qualityV = 100;
        qualityRange.classList.add('lock');
        qualityRange.disabled = true;
        qualityRange.value = 100;
        updateInputValue(update, 0, 100);
    } else{
        qualityRange.classList.remove('lock');
        qualityRange.disabled = false;
        paramsQuality(p, qualityV);
    }
}

const paramsQuality = (p, value)=>{
    if(p.format == '' || p.format =='auto'){
        p.format  = '/quality';
        p.quality = `_q/${value}`;
    } else{
        p.quality = `_q/${value}`;
    }

    // if(value == '100'  && p.format.includes('quality')) {
    //     p.format  = '';
    //     p.quality = '';
    // } 
    
}

const paramsCrop = (p, reset)=>{
    p.crop = (reset)? '': `/crop_w/${cropX}/crop_h/${cropY}/fp/${focalX},${focalY}`;
    p.cropFlipRotate += p.crop;
}

const paramsRotate = (p, value)=>{
    p.cropFlipRotate = p.cropFlipRotate.replace(p.rotate, '');
    p.rotate   = (value===0 || value=='')? '': `/rotate_a/${value}`;
    p.cropFlipRotate += (value===0 || value=='')? '': p.rotate;
}

const paramsHSB = (p, {h,s,b})=>{
    const HBS = `/hsb_h/${h}/hsb_s/${s}/hsb_b/${b}`;
    p.HBS = (h == 0 && s == 0 && b ==0)? '': HBS;
}


// UPDATE INPUT VALUES
const updateInputValue = (update, index, value)=>{
    if(update){
        inputValues[index].innerHTML = `${value}%`;
    }
}

const toggleActiveUndos = (active, index)=>{
    (active)? undos[index].classList.add('undo-active')
            : undos[index].classList.remove('undo-active');

}

// IMAGE POSITION
const imagePosition = (width, height)=>{
    if(width >= containerW && height >= containerH){
        imgContainer.style.justifyContent = 'flex-start';
        imgContainer.style.alignItems     = 'flex-start';
    } else if(height >= containerH){
        imgContainer.style.alignItems     = 'flex-start';
    }else {
        imgContainer.style.justifyContent = 'center';
        imgContainer.style.alignItems     = 'center';
    }
}

const imageDimensionsAuto = ()=>{
    img.style.width = 'auto';
    img.style.height = 'auto';
}

const resetFocalPoint = ()=>{
    focalPoints.style.left = '50%';
    focalPoints.style.top  = '50%';
    setCoordinates(50,50);
}

const setCoordinates = (x,y)=>{
    coordinates[0].innerHTML = `${x} <small>X</small>`;
    coordinates[1].innerHTML = `${y} <small>Y</small>`;
}

const resetZoom = ()=>{
    zoomInput.value = 1;
    inputValues[1].innerHTML = '100%;';
    params.resize = '';
}

// MAP SCALE
const scale = (num, in_min, in_max, out_min, out_max)=>{
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

const setFocalPoint = (e)=>{
    const imgBounding = img.getBoundingClientRect();
    imgLeft       = imgBounding.left,
    imgTop        = imgBounding.top,
    imgWidth      = imgBounding.width,
    imgHeight     = imgBounding.height,
    x             = e.clientX - imgLeft,
    y             = e.clientY - imgTop;

    // - 5 -> Because the width and height of the point is '10px', half of 10 is '5'
    focalPoints.style.left = `${x - 5 }px`;
    focalPoints.style.top  = `${y - 5}px`;

    focalX = scale(x, 0, imgWidth, 0, 1).toFixed(2);
    focalY = scale(y, 0, imgHeight, 0, 1).toFixed(2);
    console.log(focalX, focalY);
    setCoordinates(Math.round(focalX * 100), Math.round(focalY * 100));
}

img.addEventListener('load', ()=>{
    loading.classList.add('d-none');
    imgWidth  = img.getBoundingClientRect().width,
    imgHeight = img.getBoundingClientRect().height;

    imagePosition(imgWidth, imgHeight);
});

clip.addEventListener('click', ()=>{

    let clipInput = document.createElement('input');
    
    clipInput.setAttribute('value', baseURL+paramsContainer.innerHTML);
    document.body.appendChild(clipInput);
    clipInput.select();

    document.execCommand('copy');
    document.body.removeChild(clipInput);

    alert.classList.remove('d-none');

    setTimeout(()=>{
        alert.classList.add('d-none');
    }, 2500);

});


rotateInput.addEventListener('focusout',(e)=>{
    if(e.target.value == '' || isNaN(e.target.value)){
        e.target.value = 0;
    }
});
urlBuilder(params);
updateParamsInput(params, paramsURL,);
console.log('Start');