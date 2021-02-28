const controls = document.querySelector('#controls'),
img = document.querySelector('#img'),
imgC = document.querySelector('.img-continer'),
paramSpan = document.querySelector('.params');

const point = document.querySelector('.focalpoint');

img.addEventListener('load', ()=>{
    console.log('img');
    point.style.left = '50%';
    point.style.top = '50%';
});

let hue = saturation = brightness = width = height = cropX = cropY = focalX = focalY = 0, flip = HBS = filters = rotate = resize = crop = '';
let urlParams = '';
const url =  'https://demo.dotcms.com/contentAsset/image/17e7dc47-79d0-4525-87a4-40fb3429cbd4/fileAsset';
let originalWidth = img.getBoundingClientRect().width;
let originalHeight = img.getBoundingClientRect().height;
/*

*/
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
        case 'zoom':
            img.style.width = `${( originalWidth * value).toFixed(2)}px`;
            img.style.height = `${( originalHeight * value).toFixed(2)}px`;
        break;
        case 'crop-x':
            cropX = value;
        break;
        case 'crop-y':
            cropY = value;
        break;
        case 'crop':
            console.log('hola');
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
            hue = scale(value, -100, 100, -1, 1).toFixed(2);
            paramHSB(hue, saturation, brightness);         
        break;
        case 'saturation':
            saturation = scale(value, -100, 100, -1, 1).toFixed(2);
            paramHSB(hue, saturation, brightness);                     
        break;
        case 'brightness':
            brightness = scale(value, -100, 100, -1, 1).toFixed(2);
            paramHSB(hue, saturation, brightness);         
        break;
    }
    buildURL();
    changeInput(urlParams);
}

const buildURL = ()=>{
    // filters += (HBS.length > 0)? 'Hbs,': '';
    // filters += (flip.length > 0)? 'Flip,': '';
    // filters += (rotate.length > 0)? 'Rotate,': '';
    // filters += (resize.length > 0)? 'Resize,': '';

    filters = filters.substring(0, filters.length - 1);

    // urlParams = `/filter${HBS}${flip}${rotate}${resize}`;

    urlParams = `${HBS}${flip}${rotate}${resize}${crop}`;

    if(urlParams === '/filter'){
        urlParams = '';
    }

    img.setAttribute('src', `${url}${urlParams}`);
    filters = '';
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
    resize = `/resize_w/${width}`;
}

const paramCrop = () => {
    crop = `/crop_w/${cropX}/crop_h/${cropY}/fp/${focalX},${focalY}` 
}

const scale = (num, in_min, in_max, out_min, out_max) => {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

const changeInput = (params)=>{
    paramSpan.innerHTML = params;
}

const setFocalPoint = (e)=>{
    console.log(img.getBoundingClientRect(),e.clientX);
    point.style.left = `${e.clientX - img.getBoundingClientRect().left - 4}px`;
    point.style.top = `${e.clientY - img.getBoundingClientRect().top - 4}px`;
    x = e.clientX - img.getBoundingClientRect().left;
    y = e.clientY - img.getBoundingClientRect().top;
    focalX = scale(x, 0, img.getBoundingClientRect().width, 0, 1).toFixed(2);
    focalY = scale(y, 0, img.getBoundingClientRect().height, 0, 1).toFixed(2);
}

img.addEventListener('click',(event)=>{
    if(point.classList.contains('show')){
        setFocalPoint(event);
    }
});
