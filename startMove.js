/*
 * 我的运动框架V2.0
 * (c) Copyright 2015 瞿龙俊. All Rights Reserved.
 */

/*
 * 默认startMove为速度版运动框架
 */
function startMove(obj, json, interval, fn) {
	//将需要运动的多个属性保存成JSON格式，方便在startMove中调用，key-Value键值对，不同的key，不用数组
	clearInterval(obj.iTimer); //使用obj.iTimer，用来控制N个不同元素的运动互不影响，否则会将前一个元素的定时器清空Bug
	var iCur = 0;
	var iSpeed = 0; //速度变量
	obj.iTimer = setInterval(function() {
		var iBtn = true; //定义变量用来判断是否所有元素都已经到达指定位置了，若为true，则表示所有元素到了指定位置，false则为有元素未到达
		//定时器每运行一次，就要把运动的属性都推进一步
		for (var attr in json) {
			//停止计时器时间：所有属性都运动到了目标的时候。
			iTarget = json[attr];
			if (attr == 'opacity') {
				iCur = Math.round(css(obj, 'opacity') * 100); //四舍五入，在某些浏览器中（目前实测Opera）中，Opacity得到的值是一个很长的数，例如：0.29999999998,0.3000000001
			} else {
				iCur = parseInt(css(obj, attr));
			}
			//速度 = (目标点值-当前值)*摩擦系数：BUG：JS计算CSS样式小数时会四舍五入导致运动差几PX，解决方法：若速度为正数，则向上取整，否则向下取整。
			iSpeed = (iTarget - iCur) / 8;
			iSpeed = iSpeed > 0 ? Math.ceil(iSpeed) : Math.floor(iSpeed); //速度取整
			if (iCur != iTarget) { //如果元素未达到指定位置
				iBtn = false; //将标识设置为false
				if (attr == 'opacity') {
					//非IE浏览器
					obj.style.opacity = (iCur + iSpeed) / 100;
					obj.style.filter = 'alpha(opacity=' + (iCur + iSpeesd) + ')' //IE浏览器兼容
				} else {
					obj.style[attr] = iCur + iSpeed + 'px';
				}
			}
		}
		//在这里来判断是否所有属性都已经运行完毕，iBtn为false则表示有元素未达到，true表示都到达了。
		//true的条件：当定时器运行了一次，并扫描了所有attr，发现没有需要移动的属性。
		if (iBtn) {
			clearInterval(obj.iTimer); //关闭定时器
			fn && fn.call(obj); //若此处未使用call，则this会指向window，call的作用是让this指针指向obj
		}
	}, interval);
}

function css(obj, attr) { //获取元素CSS样式
	if (obj.currentStyle) {
		return obj.currentStyle[attr]; //若浏览器支持CurrentStyle，则使用它获取，最精确，IE
	} else {
		return getComputedStyle(obj, false)[attr]; //若不支持，则使用getComputedStyle获取，FF,Chrome等
	}
}

/*
 * startMoveTime为时间版运动框架
 * @param:
 * 1.obj:运动对象,必需
 * 2.json:运动对象的运动目标属性，必需
 * 3.times:运动时间，若不设置，默认值为400ms
 * 4.fx:运动方式：若不设置，默认值为匀速运动,支持的方式有：
 * －－＞linear(匀速)
 * －－＞easeIn(加速曲线)、easeOut(减速曲线)、easeBoth(加速减速曲线)
 * －－＞easeInStrong(加加速曲线)、easeOutStrong(减减速曲线)、easeBothStrong(加加速减减速曲线)
 * －－＞elasticIn(正弦衰减曲线（弹动渐入）)、elasticOut(正弦增强曲线（弹动渐出）)、elasticBoth(正弦曲线(弹性出入))
 * －－＞backIn(回退加速（回退渐入）)、backOut(回退加速（回退渐出）)、backBoth(回退加速（渐入渐出）)
 * －－＞bounceIn(弹球减振(弹球渐入))、bounceOut(弹球减振(弹球渐出))、bounceBoth(弹球减振(渐入渐出))。
 * 5.fn:事件完成之后的回调函数
 */
function startMoveTime(obj, json, times, fx, fn) {
	//如果用户传入的参数中，时间是undefined，说明用户只传入了前两个参数，后面三个参数均未传值，则默认时间为400毫秒且设置默认样式为匀速运动
	if (typeof times == 'undefined') {
		times = 400;
		fx = 'linear';
	}
	//如果时间参数位置传入的是string类型，说明times参数被用户省略了：
	//1.times之后有一个参数：判断fx参数位置是否传入的为一个function,
	//如果传入的是function,则将fx传给fn,因为只有一个参数，fx是function，
	//times不是number类型，则times是fx，将times传给fx，并设置times为默认值。
	if (typeof times == 'string') {
		if (typeof fx == 'function') {
			fn = fx;
		}
		fx = times;
		times = 400;
	} else
	//2.如果当前times是function，则说明times是fn的参数，将times传给fn，并设置fx和times的默认值
	if (typeof times == 'function') {
		fn = times;
		times = 400;
		fx = 'linear';
	} else
	//3.如果times是number，则说明timer传入的是时间，判断fx是否是function，如果是function，则将fx传给fn，并设置fx默认值，
	//如果fx未定义，则设置fx为默认值，否则fx为用户传入的变化方式。
	if (typeof times == 'number') {
		if (typeof fx == 'function') {
			fn = fx;
			fx = 'linear';
		} else if (typeof fx == 'undefined') {
			fx = 'linear';
		}
	}
	//由于有多属性，所以iCur当前样式需要定义key-value类型的JSON，方便保存多种属性
	var iCur = {};
	//遍历用户传过来的JSON的每一个属性attr
	for (var attr in json) {
		iCur[attr] = 0; //初始化
		if (attr == 'opacity') { //判断传入的属性是否为透明度，因为透明度需要另外计算
			iCur[attr] = Math.round(css(obj, 'opacity') * 100); //四舍五入，在某些浏览器中（目前实测Opera）中，Opacity得到的值是一个很长的数，例如：0.29999999998,0.3000000001						} else {}
		} else {
			iCur[attr] = parseInt(css(obj, attr));
		}
	}
	//保存一份开始时间，开始时间是固定时间，计算方式为从当前时间到1970年1月1日的毫秒数。
	var startTime = now();
	//初始化清空计时器，防止连续操作bug
	clearInterval(obj.iTimer);
	obj.iTimer = setInterval(function() {
		var changeTime = now(); //每次运行计时器时，获取当前时间，计算方式为从当前时间到1970年1月1日的毫秒数。
		//startTime - changeTime表示从开始时间到当前时间的变化量。
		//startTime - changeTime + times：表示剩余的运行时间
		//Math.max(0, startTime - changeTime + times)：将剩余的运行时间和0比，判断哪个时间大，原则上剩余时间不能小于0
		//t：开始运行时间
		var t = times - Math.max(0, startTime - changeTime + times); //Math.max(0, startTime - changeTime + times):从times时间开始越来越小,到0
		//每次触发计时器，都会遍历一遍用户传入的json属性
		for (var attr in json) {
			//调用Tween算法计算变换后的样式位置，Tween算法会返回一个计算后的样式位置。
			//t：当前已经运行的时间
			//iCur[attr]：元素的初始状态
			//json[attr] - iCur[attr]:元素变化量
			//times：元素持续时间
			var value = Tween[fx](t, iCur[attr], json[attr] - iCur[attr], times);
			if (attr == 'opacity') {
				obj.style.opacity = value / 100; ////非IE浏览器
				obj.style.filter = 'alpha(opacity=' + value + ')'; //IE浏览器兼容
			} else {
				obj.style[attr] = value + 'px';
			}
		}
		if (t == times) { //如果当前时间已经到达最终运动时间，停止计时器并调用回调函数
			clearInterval(obj.iTimer);
			fn && fn.call(obj); //若此处未使用call，则this会指向window，call的作用是让this指针指向obj
		}
	}, 13);
}

function now() { //获取当前时间，获得的时间为从当前时间到1970年1月1日的毫秒数。
		return (new Date()).getTime();
	}
	/*
	 *Tween算法，用来计算运动的位置
	 * @parem:
	 * 1.t:当前运动的时间，动态
	 * 2.b：元素开始的位置，固定不变
	 * 3.c：元素需要运动的变化量，固定不变
	 * 4.d：持续运动的时间，固定不变
	 */
var Tween = {
	linear: function(t, b, c, d) { //匀速
		return c * t / d + b;
	},
	easeIn: function(t, b, c, d) { //加速曲线
		return c * (t /= d) * t + b;
	},
	easeOut: function(t, b, c, d) { //减速曲线
		return -c * (t /= d) * (t - 2) + b;
	},
	easeBoth: function(t, b, c, d) { //加速减速曲线
		if ((t /= d / 2) < 1) {
			return c / 2 * t * t + b;
		}
		return -c / 2 * ((--t) * (t - 2) - 1) + b;
	},
	easeInStrong: function(t, b, c, d) { //加加速曲线
		return c * (t /= d) * t * t * t + b;
	},
	easeOutStrong: function(t, b, c, d) { //减减速曲线
		return -c * ((t = t / d - 1) * t * t * t - 1) + b;
	},
	easeBothStrong: function(t, b, c, d) { //加加速减减速曲线
		if ((t /= d / 2) < 1) {
			return c / 2 * t * t * t * t + b;
		}
		return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
	},
	elasticIn: function(t, b, c, d, a, p) { //正弦衰减曲线（弹动渐入）
		if (t === 0) {
			return b;
		}
		if ((t /= d) == 1) {
			return b + c;
		}
		if (!p) {
			p = d * 0.3;
		}
		if (!a || a < Math.abs(c)) {
			a = c;
			var s = p / 4;
		} else {
			var s = p / (2 * Math.PI) * Math.asin(c / a);
		}
		return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
	},
	elasticOut: function(t, b, c, d, a, p) { //正弦增强曲线（弹动渐出）
		if (t === 0) {
			return b;
		}
		if ((t /= d) == 1) {
			return b + c;
		}
		if (!p) {
			p = d * 0.3;
		}
		if (!a || a < Math.abs(c)) {
			a = c;
			var s = p / 4;
		} else {
			var s = p / (2 * Math.PI) * Math.asin(c / a);
		}
		return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
	},
	elasticBoth: function(t, b, c, d, a, p) {
		if (t === 0) {
			return b;
		}
		if ((t /= d / 2) == 2) {
			return b + c;
		}
		if (!p) {
			p = d * (0.3 * 1.5);
		}
		if (!a || a < Math.abs(c)) {
			a = c;
			var s = p / 4;
		} else {
			var s = p / (2 * Math.PI) * Math.asin(c / a);
		}
		if (t < 1) {
			return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) *
				Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
		}
		return a * Math.pow(2, -10 * (t -= 1)) *
			Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
	},
	backIn: function(t, b, c, d, s) { //回退加速（回退渐入）
		if (typeof s == 'undefined') {
			s = 1.70158;
		}
		return c * (t /= d) * t * ((s + 1) * t - s) + b;
	},
	backOut: function(t, b, c, d, s) {
		if (typeof s == 'undefined') {
			s = 3.70158; //回缩的距离
		}
		return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
	},
	backBoth: function(t, b, c, d, s) {
		if (typeof s == 'undefined') {
			s = 1.70158;
		}
		if ((t /= d / 2) < 1) {
			return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
		}
		return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
	},
	bounceIn: function(t, b, c, d) { //弹球减振（弹球渐出）
		return c - Tween['bounceOut'](d - t, 0, c, d) + b;
	},
	bounceOut: function(t, b, c, d) {
		if ((t /= d) < (1 / 2.75)) {
			return c * (7.5625 * t * t) + b;
		} else if (t < (2 / 2.75)) {
			return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
		} else if (t < (2.5 / 2.75)) {
			return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
		}
		return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
	},
	bounceBoth: function(t, b, c, d) {
		if (t < d / 2) {
			return Tween['bounceIn'](t * 2, 0, c, d) * 0.5 + b;
		}
		return Tween['bounceOut'](t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
	}
}

/*
 * 扩展JQuery，使JQuery支持多种运动类型，需要先导入JQuery
 * 扩展之后的JQuery支持上述所有的动画效果
 * 使用方法为element.animate({attr:value},times,moveStyle);
 * 使用时拷贝到项目中即可。
 */
$.extend(jQuery.easing, {

	easeIn: function(x, t, b, c, d) { //加速曲线
		return c * (t /= d) * t + b;
	},
	easeOut: function(x, t, b, c, d) { //减速曲线
		return -c * (t /= d) * (t - 2) + b;
	},
	easeBoth: function(x, t, b, c, d) { //加速减速曲线
		if ((t /= d / 2) < 1) {
			return c / 2 * t * t + b;
		}
		return -c / 2 * ((--t) * (t - 2) - 1) + b;
	},
	easeInStrong: function(x, t, b, c, d) { //加加速曲线
		return c * (t /= d) * t * t * t + b;
	},
	easeOutStrong: function(x, t, b, c, d) { //减减速曲线
		return -c * ((t = t / d - 1) * t * t * t - 1) + b;
	},
	easeBothStrong: function(x, t, b, c, d) { //加加速减减速曲线
		if ((t /= d / 2) < 1) {
			return c / 2 * t * t * t * t + b;
		}
		return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
	},
	elasticIn: function(x, t, b, c, d, a, p) { //正弦衰减曲线（弹动渐入）
		if (t === 0) {
			return b;
		}
		if ((t /= d) == 1) {
			return b + c;
		}
		if (!p) {
			p = d * 0.3;
		}
		if (!a || a < Math.abs(c)) {
			a = c;
			var s = p / 4;
		} else {
			var s = p / (2 * Math.PI) * Math.asin(c / a);
		}
		return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
	},
	elasticOut: function(x, t, b, c, d, a, p) { //正弦增强曲线（弹动渐出）
		if (t === 0) {
			return b;
		}
		if ((t /= d) == 1) {
			return b + c;
		}
		if (!p) {
			p = d * 0.3;
		}
		if (!a || a < Math.abs(c)) {
			a = c;
			var s = p / 4;
		} else {
			var s = p / (2 * Math.PI) * Math.asin(c / a);
		}
		return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
	},
	elasticBoth: function(x, t, b, c, d, a, p) {
		if (t === 0) {
			return b;
		}
		if ((t /= d / 2) == 2) {
			return b + c;
		}
		if (!p) {
			p = d * (0.3 * 1.5);
		}
		if (!a || a < Math.abs(c)) {
			a = c;
			var s = p / 4;
		} else {
			var s = p / (2 * Math.PI) * Math.asin(c / a);
		}
		if (t < 1) {
			return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) *
				Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
		}
		return a * Math.pow(2, -10 * (t -= 1)) *
			Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
	},
	backIn: function(x, t, b, c, d, s) { //回退加速（回退渐入）
		if (typeof s == 'undefined') {
			s = 1.70158;
		}
		return c * (t /= d) * t * ((s + 1) * t - s) + b;
	},
	backOut: function(x, t, b, c, d, s) {
		if (typeof s == 'undefined') {
			s = 3.70158; //回缩的距离
		}
		return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
	},
	backBoth: function(x, t, b, c, d, s) {
		if (typeof s == 'undefined') {
			s = 1.70158;
		}
		if ((t /= d / 2) < 1) {
			return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
		}
		return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
	},
	bounceIn: function(x, t, b, c, d) { //弹球减振（弹球渐出）
		return c - this['bounceOut'](x, d - t, 0, c, d) + b;
	},
	bounceOut: function(x, t, b, c, d) {
		if ((t /= d) < (1 / 2.75)) {
			return c * (7.5625 * t * t) + b;
		} else if (t < (2 / 2.75)) {
			return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
		} else if (t < (2.5 / 2.75)) {
			return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
		}
		return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
	},
	bounceBoth: function(x, t, b, c, d) {
		if (t < d / 2) {
			return this['bounceIn'](x, t * 2, 0, c, d) * 0.5 + b;
		}
		return this['bounceOut'](x, t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
	}

});