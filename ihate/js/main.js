;(function(){

    'use strict';

    var
    // canvas && context
    cvs = document.getElementById('canvas'),
    ctx = cvs.getContext('2d'),

    // decive
    device_width = document.documentElement.clientWidth,
    device_height = document.documentElement.clientHeight,

    // center
    center_x = device_width / 2,
    center_y = device_height / 2,

    // psd
    PSD_WIDTH = 6901,
    PSD_HEIGHT = 750,

    ratio = device_height/PSD_HEIGHT,
    bg_width = PSD_WIDTH * ratio,
    bg_height = PSD_HEIGHT * ratio,


    backgroundImage = new Image(),

    // status
    paused = true,
	lastTime = 0,
	fps = 0,
	backgroundOffset = 0,
	backgroundVelocity = 120, // 30px/s

    // 画布独立对象
    sakura_tree = {
        dom: new Image(),
        src: 'images/sakura_tree.png',
        left: 1374,
        top: 0,
        width: 2413,
        height: 750,
    },
    normal_tree = {
        dom: new Image(),
        src: 'images/normal_tree.png',
        left: 4080,
        top: 0,
        width: 818,
        height: 750,
    },

    parts = [sakura_tree, normal_tree],
    sprite_cloud;
// Functions.............................................................

    // window-resize
    function windowResizeFn(){
        device_width = document.documentElement.clientWidth;
        device_height = document.documentElement.clientHeight;
        center_x = device_width / 2;
        center_y = device_height / 2;
        bg_width = PSD_WIDTH * ratio;
        bg_height = PSD_HEIGHT * ratio;
        cvs.width = device_width;
        cvs.height = device_height;

        erase();
        draw();
    }

    // 首页元素
    var home_bg,
        home_cloudLB,
        home_cloudLT,
        home_cloudRT,
        home_cloudRB,
        home_birds,
        home_desc,
        home_tip,
        home_title;

    // 画首页
    function drawHome(){
        // 背景
        home_bg = new Image();
        home_bg.src = 'images/home/bg.jpg';
        home_bg.onload = function(e){
            ctx.drawImage(home_bg, 0, 0, device_width, device_height);
        };

        // 云-左下
        home_cloudLB = new Image();
        home_cloudLB.src = 'images/home/cloud_left_bottom.png';
        home_cloudLB.onload = function(e){
            ctx.drawImage(home_cloudLB, 0, 180 * ratio, 223 * ratio, 423 * ratio);
        };

        // 云-左上
        home_cloudLT = new Image();
        home_cloudLT.src = 'images/home/cloud_left_top.png';
        home_cloudLT.onload = function(e){
            ctx.drawImage(home_cloudLT, 73 * ratio, 0, 509 * ratio, 768 * ratio);
        };

        // 云-右下
        home_cloudRB = new Image();
        home_cloudRB.src = 'images/home/cloud_right_bottom.png';
        home_cloudRB.onload = function(e){
            ctx.drawImage(home_cloudRB, center_x + (400 * ratio), 223 * ratio, 289 * ratio, 345 * ratio);
        };

        // 云-右上
        home_cloudRT = new Image();
        home_cloudRT.src = 'images/home/cloud_right_top.png';
        home_cloudRT.onload = function(e){
            ctx.drawImage(home_cloudRT, center_x + (200 * ratio), 0, 441 * ratio, 768 * ratio);
        };

        // 鸟
        home_birds = new Image();
        home_birds.src = 'images/home/birds.png';
        home_birds.onload = function(e){
            ctx.drawImage(home_birds, 160 * ratio, 50 * ratio, 363 * ratio, 425 * ratio);
        };

        // 标题
        home_title = new Image();
        home_title.src = 'images/home/title.png';
        home_title.onload = function(e){
            ctx.drawImage(home_title, center_x - (663 * ratio / 2), center_y - (304 * ratio / 2), 663 * ratio, 304 * ratio);
        };

        // 描述
        home_desc = new Image();
        home_desc.src = 'images/home/desc.png';
        home_desc.onload = function(e){
            ctx.save();
            ctx.translate(device_width, 0);
            ctx.drawImage(home_desc, -180 * ratio, 370 * ratio, 101 * ratio, 240 * ratio);
            ctx.restore();
        };

        // 提示
        home_tip = new Image();
        home_tip.src = 'images/home/tip.png';
        home_tip.onload = function(e){
            ctx.save();
            ctx.translate(device_width, 0);
            ctx.drawImage(home_tip, -185 * ratio, 630 * ratio, 123 * ratio, 80 * ratio);
            ctx.restore();
        };

    }

    // 更新精灵数组
    function updateParts(){
        parts.forEach(function(item){
            item.left *= ratio;
            item.top *= ratio;
            item.width *= ratio;
            item.height *= ratio;
        });
    }

    // 加载图片
    function loadParts(){
        parts.forEach(function(item){
            !function(item){
                item.dom.src = item.src;
                item.dom.onload = function(e){
                    ctx.drawImage(item.dom, item.left, item.top, item.width, item.height);
            	};
            }(item);
        });
    }

    // 清除画布
	function erase(){
		ctx.clearRect(0, 0, cvs.width, cvs.height);
	}

    // 绘制全部
	function draw(){
		backgroundOffset = backgroundOffset < (bg_width) ? backgroundOffset + backgroundVelocity / fps : 0;

        // 绘制背景
		ctx.save();
		ctx.translate(-backgroundOffset, 0);
		ctx.drawImage(backgroundImage, 0, 0, bg_width, bg_height);
		ctx.restore();

        // 绘制中心
        drawCenter();

        // 绘制上层遮挡物
        ctx.save();
        ctx.translate(-backgroundOffset, 0);
        parts.forEach(function(item){
            ctx.drawImage(item.dom, item.left, item.top, item.width, item.height);
        });
		ctx.restore();
	}

    // 绘制中间的船
    function drawCenter(){
        ctx.fillColor = '#000';
        ctx.fillRect(center_x - 25, center_y - 25, 50, 50);
    }


    // 计算FPS
	function calculateFps(now){
		var fps = 1000 / (now - lastTime);

		lastTime = now;

		return fps;
	}

    // 动画函数
	function animate(now){
		if(now === undefined){
			now = +new Date;
		}

		fps = calculateFps(now);

		if(!paused){
			erase();
			draw();
            // ctx.drawImage(home_bg, 0, 0, device_width, device_height);
            // home_cloudLB.update(ctx, now);
            // home_cloudLB.paint(ctx);
		}

		requestAnimationFrame(animate);
	}

    // touchstart事件
    function touchstartFn(){
        paused = false;
    }

    // touchend事件
    function touchendFn(){
        paused = true;
    }

// Event handlers..........................................................

    window.addEventListener('resize', windowResizeFn);
    window.addEventListener('orientationchange', windowResizeFn);
    cvs.addEventListener('touchstart', touchstartFn);
    cvs.addEventListener('touchend', touchendFn);

// Initialization..........................................................

    var imgs = [
        'images/home/bg.jpg',
        'images/home/birds.png',
        'images/home/cloud_left_bottom.png',
        'images/home/cloud_left_top.png',
        'images/home/cloud_right_bottom.png',
        'images/home/cloud_right_top.png',
        'images/home/desc.png',
        'images/home/tip.png',
        'images/bg.jpg',
        'images/sakura_tree.png',
        'images/normal_tree.png',
    ];

    cvs.width = device_width;
    cvs.height = device_height;

	backgroundImage.src = 'images/bg.jpg';
	backgroundImage.onload = function(e){
        ctx.drawImage(backgroundImage, 0, 0, bg_width, bg_height);
        animate();
	};

    $.preload(imgs, {
        all: function(){
            updateParts();
            loadParts();
            drawHome();
        }
    });


})();
