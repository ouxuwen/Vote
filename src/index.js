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
let end = "2019-07-26"

let votePm = {
  loadingComponent: null,
  masonry: null,         // 瀑布流容器
  isLoading: false,     // 是否加载中
  searchInput:null,    // 搜索输入
  searchBtn:null,     // 搜索按钮
  timeEle:null,      // 定时器容器
  endDate:(new Date(end).getTime() - new Date().getTime())/1000, // 时间差
  timer:null,   //定时器
  infoEle:null,  //消息提醒
  searchParam:{
    keyword:"动漫",
    pageNo:1,
    pageSize:20
  },
  /**
   * 初始化
   */
  init() {
    // 注册元素
    this.masonry = $("#masonry");
    this.loadingComponent = $("#loading");
    this.searchBtn=$("#searchBtn");
    this.searchInput=$("#searchInput");
    this.timeEle = $(".c_d_time")[0];
    this.infoEle = $("#info");
    // 注册绑定事件
    this.bindEvent();

    // 第一次加载数据
    this.loadData();

    // 开始倒计时
    this.countDown()
  },
  // 绑定事件
  bindEvent() {
    let that = this;

    // 给滚动条添加滚动监听事件
    $(window).scroll(function() {
      var scrollTop = $(this).scrollTop();
      var scrollHeight = $(document).height();
      var windowHeight = $(this).height();
      if (scrollTop + windowHeight == scrollHeight) {
        console.log(scrollTop, scrollHeight, windowHeight, "已经到最底部了！");
        that.searchParam.pageNo = that.searchParam.pageNo+1;
        that.loadData();
      }
    });

    //搜索事件
    that.searchBtn.on("click",function(){
        that.masonry.html("");
        that.masonry.css({height:0});
        that.searchParam={
            keyword:that.searchInput[0].value,
            pageNo:1,
            pageSize:20
        }
    })

    //投票事件
    $(".btn").live("click",function(){
        let $span = $(this).siblings("p").children("span")
        let num = $span.text();
        $span.text(+num+1);
        let infoEle = document.createElement('div');
        $(infoEle).text('投票成功');
        $(infoEle).addClass("info");
        document.body.appendChild(infoEle);

        
        $(infoEle).addClass("show")
        setTimeout(()=>{
            document.body.removeChild(infoEle);
        },1000)
        

    })
  },
  /**
   * 转换时间
   * @param timeChange 时间戳
   */
  transTime(timeChange){
    let days = Math.floor(timeChange/(60*60*24))
    let hoursC = timeChange%(60*60*24);
    let hours = Math.floor(hoursC/(60*60));
    let minC = hoursC%(60*60);
    let mins = Math.floor(minC/60);
    let senC =  Math.floor(minC%(60));
    return {days,hours,mins,senC}
  },
  // 开始倒计时
  countDown(){
    let that = this;
    this.endDate = this.endDate - 1;
    if(this.endDate<=0){
        clearTimeout(this.timer)
        this.timer = null;
        $(that.timeEle).html(`
        <span>0 </span>天 
        <span>0 </span>时 
        <span>0 </span>分 
        <span>0 </span>秒 
    `)
        return;
    }
    let {days,hours,mins,senC} = this.transTime(this.endDate);
    $(that.timeEle).html(`
        <span>${days} </span>天 
        <span>${hours} </span>时 
        <span>${mins} </span>分 
        <span>${senC} </span>秒 
    `)
    this.timer = setTimeout(function(){
        that.countDown();
    },1000)
  },

  /**
   * 发起请求
   * @param {*} param0 
   */
  loadData() {
    let that = this;
    let {pageNo,pageSize,keyword} = this.searchParam
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
        `/sf/vsearch/image/search/wisesearchresult?tn=wisejsonala&ie=utf-8&fromsf=1&word=${keyword}&pn=${pageNo*pageSize+1}&rn=${pageSize}&gsm=1e&searchtype=0&prefresh=undefined&fromfilter=0`,
      success(res) {
        // that.isLoading = false;
        // that.hideLoading(that);
        let list = res.linkData;
        let str = ``;
        let j = 0;
        for (let i = 0,length=list.length; i <  length; i++) {
            // onload="loadImg(this)" onerror="errorImg(this)"
            let listItem = list[i];
           

          // 所有图片都加载完之后再进行插入
          let img = new Image()
          img.src =  listItem.hoverUrl;
          img.onload = function(){
            j++;
            str += that.assemblyTemplate(listItem);
            that.excuAppend(j,length,that,str)
          }
          img.onerror = function(){
            listItem.hoverUrl="assets/image/shootcut.png";
            str += that.assemblyTemplate(listItem);
            j++;
            that.excuAppend(j,length,that,str)
          }
        }
      },
      error(err) {
        that.isLoading = false;
        that.hideLoading(that);
      }
    });
  },
  /**
   * 组装模板
   * @param {*} listItem 
   */
  assemblyTemplate(listItem){
    return `<div class="item">
        <span class="label">${listItem.id}</span>
        <img class="lazy"  src=${
            listItem.hoverUrl
        } />
        <p class = "name">${listItem.fromUrlHost}</p>
        <p class="txt">${listItem.oriTitle}</p>
        <div class="operation">
            <p><span>100</span> 票</p>
            <button class="btn">投他一票</button>
        </div>
    </div>`;
  },

  /**
   * 显示loading
   * @param {*} that 
   */
  showLoading(that) {
    that.loadingComponent.addClass("show");
  },
  /**
   * 隐藏loading
   * @param {*} that 
   */
  hideLoading(that) {
    that.loadingComponent.removeClass("show");
  },
  /**
   * 处理插入元素，处理瀑布流
   * @param {*} that 
   */
  excuAppend(j,length,that,str){
    if(j === length){
        that.masonry.append(str);
        setTimeout(()=>{
            waterWall()
            that.isLoading = false;
            that.hideLoading(that);
        },500);
    }
  }
};

votePm.init();
