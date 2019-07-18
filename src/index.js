import "./css/index.less";
import waterWall from "./flow";

// // 页面尺寸改变时实时触发
// window.onresize = function() {
//   //重新定义瀑布流
//   waterFall();
// };

// //初始化
// window.onload = function() {
//   //实现瀑布流
//   waterFall();
// };

let votePm = {
  loadingComponent: null,
  masonry: null,
  isLoading: false,
  init() {
    // 注册绑定事件
    this.bindEvent();
    
    // 注册元素
    this.masonry = $("#masonry");
    this.loadingComponent = $("#loading");

    // 第一次加载数据
    this.loadData();
  },
  bindEvent() {
    let that = this;
    // 图片加载成功 重排
    window.loadImg = e => {
      waterWall();
    };

    // 图片加载失败
    window.errorImg = e => {
      console.log(e);
    };

    // 给滚动条添加滚动监听事件
    $(window).scroll(function() {
      var scrollTop = $(this).scrollTop();
      var scrollHeight = $(document).height();
      var windowHeight = $(this).height();
      if (scrollTop + windowHeight == scrollHeight) {
        console.log(scrollTop, scrollHeight, windowHeight, "已经到最底部了！");
        // that.loadData();
      }
    });
  },
  loadData() {
    let that = this;

    // 防止重复执行咯
    if (this.isLoading) {
      return;
    }
    this.isLoading = true;

    // 显示loading咯
    this.showLoading(that);
    $.ajax({
      type: "get",
      dataType: "json",
      url:
        "/sf/vsearch/image/search/wisesearchresult?tn=wisejsonala&ie=utf-8&fromsf=1&word=%E9%A3%8E%E6%99%AF&pn=30&rn=30&gsm=1e&searchtype=0&prefresh=undefined&fromfilter=0",
      success(res) {
        that.isLoading = false;
        that.hideLoading(that);
        let list = res.linkData;
        let str = ``;
        for (let i = 0; i < list.length; i++) {
          str += `<div class="item">
                          <img class="lazy" src=${
                            list[i].hoverUrl
                          } alt="" onload="loadImg(this)" onerror="errorImg(this)"/>
                          <p>${list[i].oriTitle}</p>
                        </div>`;
        }
        that.masonry.append(str);
      },
      error(err) {
        that.isLoading = false;
        that.hideLoading(that);
      }
    });
  },
  showLoading(that) {
    that.loadingComponent.addClass("show");
  },
  hideLoading(that) {
    // that.loadingComponent.removeClass("show");
  }
};

votePm.init();
