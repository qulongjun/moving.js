# -JavaScript-
小白学习路上的第一个框架

这是我的第一个版本的运动框架，随着版本的更新，我还会添加更多的内容，修复已有的bug，希望大家多多指出框架里面的漏洞，共同进步！

使用方法：

在Body底部导入startMove.js,导入方法：

<script src="startMove.js" type="text/javascript" charset="utf-8"></script>

使用方式：

startMove(obj, json, interval, fn)的参数分别为：

（1）.obj:需要操作的元素，若为当前事件的元素，则可直接传递this。

（2）.json：需要操作的元素的属性，即属性最终的形态，例如{'height':500,'width':300}代表移动之后高度变成500px，宽度变成300px。

（3）.interval：每步间隔的时间，时间间隔越短动画越连贯。

（4）.fn:回调函数：动画完成后执行的函数