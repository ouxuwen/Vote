//瀑布流效果
//这里有一个坑（已经修复）：
//因为是动态加载远程图片，在未加载完全无法获取图片宽高
//未加载完全就无法设定每一个item(包裹图片)的top。

//item的top值：第一行：top为0
//            其他行：必须算出图片宽度在item宽度的缩小比例，与获取的图片高度相乘，从而获得item的高度
//                   就可以设置每张图片在瀑布流中每块item的top值（每一行中最小的item高度，数组查找）
//item的left值：第一行：按照每块item的宽度值*块数
//             其他行：与自身上面一块的left值相等

/**
 * 防抖
 * @param {*} fn 目标函数
 * @param {*} delay 延迟事件
 */
function debounce(fn, delay) {
  let timer = null;

  return function() {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(fn, delay);
  };
}

// 设置容器的高度。
function calLastHeight() {
  let lastItem = $(".item:last-child");
  let lastHeight = parseInt(lastItem[0].style.top) + lastItem[0].clientHeight;
  $("#masonry").height(lastHeight);
}

let deCal = debounce(calLastHeight, 300);

// 节流参数：
let canEXT = true;

// 执行计数器
let k = 1;

export default function waterFall() {
  //确定列间隔,行间隔
  const C_INTERVAL = 6,
    L_INTERVAL = 15;
  //2列
  const columns = 2;
  // 1- 确定图片的宽度
  // var pageWidth = getClient().width - C_INTERVAL * (columns + 1);
  var pageWidth = $(".container").offset().width - C_INTERVAL * (columns + 1);

  var itemWidth = parseInt(pageWidth / columns); //得到item的宽度
  $(".item").width(itemWidth); //设置到item的宽度

  var arr = [];

  $(".masonry .item").each(function(i) {
    // 求函数执行次数
    // console.log(++k);
    var height = $(this)
      //   .find("img")
      .height();
    var width = $(this)
      // .find("img")
      .width();
    var bi = itemWidth / width; //获取缩小的比值
    var boxheight = parseInt(height * bi) + L_INTERVAL; //图片的高度*比值 = item的高度

    if (i < columns) {
      // 2- 确定第一行
      $(this).css({
        opacity:1,
        top: 0,
        left: itemWidth * i + C_INTERVAL * (i + 1)
      });
     
      arr.push(boxheight);
    } else {
      // 其他行
      // 3- 找到数组中最小高度  和 它的索引
      var minHeight = arr[0];
      var index = 0;
      for (var j = 0; j < arr.length; j++) {
        if (minHeight > arr[j]) {
          minHeight = arr[j];
          index = j;
        }
      }
      // 4- 设置下一行的第一个盒子位置
      // top值就是最小列的高度
      $(this).css({
        opacity:1,
        top: arr[index],
        left: $(".masonry .item")
          .eq(index)
          .css("left")
      });

      // 5- 修改最小列的高度
      // 最小列的高度 = 当前自己的高度 + 拼接过来的高度
      arr[index] = arr[index] + boxheight;
    }
    
  });
  deCal();
}

//clientWidth 处理兼容性
function getClient() {
  return {
    width:
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth,
    height:
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight
  };
}
