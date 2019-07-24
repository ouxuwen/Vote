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
let end = "2019-07-26 16:51:00"

let votePm = {
  loadingComponent: null,
  masonry: null,         // 瀑布流容器
  isLoading: false,     // 是否加载中
  searchInput:null,    // 搜索输入
  searchBtn:null,     // 搜索按钮
  timeEle:null,      // 定时器容器
  endDate:(new Date(end).getTime() - new Date().getTime())/1000, // 时间差
  timer:null,   //定时器
  infoEle:null,   //消息提醒
  loginBox:null,    //登录box
  loadingBox:null,   //加载box
  userInfo:false,          //登录人信息
  isNodata:false,         //是否已经没数据
  voteCountBox:null,         //票数容器
  searchParam:{
    keyword:"动漫",
    from:0,
    count:15
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
    this.loginBox = $("#loginBox");
    this.loadingBox = $("#loadingBox");
    this.voteCountBox = $("#voteCount");

    //检测
    this.visit();

    // 检测是否登录
    this.checkLogin();

    // 注册绑定事件
    this.bindEvent();

    // 第一次加载数据
    this.loadData();

    // 开始倒计时
    this.countDown();
  },
  // 绑定事件
  bindEvent() {
    let that = this;

    // 给滚动条添加滚动监听事件
    // $(window).scroll(function() {
    //   var scrollTop = $(this).scrollTop();
    //   var scrollHeight = $(document).height();
    //   var windowHeight = $(this).height();
    //   if (scrollTop + windowHeight == scrollHeight) {
    //     console.log(scrollTop, scrollHeight, windowHeight, "已经到最底部了！");
    //     if(that.isNodata){return;}
    //     that.searchParam.from = that.searchParam.from+that.searchParam.count;
    //     that.testData();
    //   }
    // });

    //搜索事件
    that.searchBtn.on("click",function(){
        that.masonry.html("");
        that.masonry.css({height:0});
        that.searchParam={
            keyword:that.searchInput[0].value,
            from:1,
            count:20
        }
        that.testData();
    })

    //投票事件
    $(".btn").live("click",function(){
        let $this = $(this);
        if(that.endDate<=0){
          that.showMessage("info","投票已过期",1400)
          return
        }
        if($this.hasClass('inactive')){
            that.showMessage("info","不能重复投票哦",1400)
            return
        }
        if(that.userInfo.vote_record.length === 5){
            that.showMessage("info","您已经没有票数啦",1400)
            return
        }
        let $span = $this.siblings("p").children("span")
        let num = $span.text();
        $span.text(+num+1);
        $this.addClass('inactive');
        $this.text('已投票');
        that.showMessage("","投票成功",1400);
        that.voteCountBox.text(+that.voteCountBox.text()-1);
        that.vote(that.userInfo.id,$this.attr('item'),$span,$this)


    })

    //登录事件
    $("#loginBox button").on("click",function(){
        let val = $.trim($("#loginBox input")[0].value);
        if(!val) {
          that.showMessage("error","请输入姓名",1500);
          return;
        }
        that.login(val)
    })

    //手机enter
    $("#loginBox input").on("keyup",function(e){
        if(e.keyCode !== 13)return;
        let val = $.trim($("#loginBox input")[0].value);
        if(!val) {
          that.showMessage("error","请输入姓名",1500);
          return;
        }
        that.login(val)
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
    console.log(this.endDate)
    if(this.endDate<=0){
        clearTimeout(this.timer)
        this.timer = null;
        this.endDate = 0;
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
   * 测试发起请求
   * @param {*} param0 
   */
  loadData(){
    let that = this;
    // 防止重复执行咯
    if (this.isLoading) {
      return;
    }
    this.isLoading = true;
    this.hideNoData();
    // 显示loading咯
    this.showLoading(that);
    $.ajax({
        type: "get",
        dataType: "json",
        url:
          `/litong/public/index.php/index/index/voter`,
        success(result) {
          let res = JSON.parse(result);
          let list = res.data;
          let str = ``;
          let j = 0;
          for (let i = 0,length=list.length; i <  length; i++) {
              let listItem = list[i];
              
            // 所有图片都加载完之后再进行插入
            let img = new Image()
            img.src =  listItem.image;
            img.onload = function(){
              j++;
              str += that.assemblyTemplate(listItem);
              that.excuAppend(j,length,that,str)
            }
            // img.onerror = function(){
            //   listItem.hoverUrl="assets/image/shootcut.png";
            //   str += that.assemblyTemplate(listItem);
            //   j++;
            //   that.excuAppend(j,length,that,str)
            // }
          }
        },
        error(err) {
          that.isLoading = false;
          that.hideLoading(that);
          that.showNoData()
        }
      });
  },
  /**
   * 测试发起请求
   * @param {*} param0 
   */
  testData() {
    let that = this;
    let {from,count,keyword} = this.searchParam
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
        `/sf/vsearch/image/search/wisesearchresult?tn=wisejsonala&ie=utf-8&fromsf=1&word=${keyword}&pn=${from}&rn=${count}&gsm=1e&searchtype=0&prefresh=undefined&fromfilter=0`,
      success(res) {
        // that.isLoading = false;
        // that.hideLoading(that);

        let list = res.linkData;
        let str = ``;
        let j = 0;
        for (let i = 0,length=list.length; i <  length; i++) {
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
            console.log(img.src)
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
            listItem.image
        } />
        <p class = "name">${listItem.name}</p>
        <p class="txt">${listItem.des}</p>
        <div class="operation">
            <p><span>${listItem.votes}</span> 票</p>
            <button item=${listItem.id} class="btn">投他一票</button>
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
            if(that.userInfo){
              that.changeStatus(that);
            }
          
        },1000);
    }
  },
  /**
   * 消息提示
   * @param {*} type 消息类型 info , success, error
   * @param {*} text 显示文字
   * @param {*} delay 显示持久事件
   */
  showMessage(type,text,delay){
    let infoEle = document.createElement('div');
    $(infoEle).text(text);
    $(infoEle).addClass(`info ${type}`);
    document.body.appendChild(infoEle);
    $(infoEle).addClass("show")
    setTimeout(()=>{
        document.body.removeChild(infoEle);
    },delay)
  },
  checkLogin(){
    let userInfo = localStorage['userInfo'] ? JSON.parse(localStorage['userInfo']):null;
    let that = this;
    if(!userInfo && !this.loginBox.hasClass("show")){
        this.loginBox.addClass("show")
    }
    if(userInfo){
        this.userInfo = userInfo;
        this.login(this.userInfo.name);
        // that.voteCountBox.text(5-that.userInfo.vote_record.length);
        // that.changeStatus(that);
    }

  },
  showLoadingBox(){
      if(!this.loadingBox.hasClass("show")){
        this.loadingBox.addClass("show")
      }
  },
  hideLoadingBox(){
    if(this.loadingBox.hasClass("show")){
        this.loadingBox.removeClass("show")
    }
  },
  /**
   * 输入姓名登录
   * @param {*} name 
   */
  login(name){
    let that = this;
    if(!localStorage['userInfo']){that.showLoadingBox();} 
    localStorage.removeItem("userInfo");
    this.userInfo = null;
    $.ajax({
        type: "post",
        dataType: "json",
        url:
          `/litong/public/index.php/index/index/login?name=${name}`,
        success(result) {
            that.hideLoadingBox();
            let res = JSON.parse(result)
            if(res['code'] == 1){
                localStorage['userInfo'] = JSON.stringify( res.data)
                that.userInfo = res.data;
                that.loginBox.hasClass("show")&&that.loginBox.removeClass('show');
                that.showMessage("success","登录成功",2000)
                that.voteCountBox.text(5-that.userInfo.vote_record.length);
                that.changeStatus(that)
            }else{
                that.showMessage("error",res['msg'],2000)
            }
        },
        error(err) {
           that.hideLoadingBox()
           that.showMessage("error","网络链接失败，请稍后重试",4000)
        }
    });
  },
  /**
   * 投票
   * @param {*} nid 
   * @param {*} id 
   */
  vote(nid,id,$span,$btn){
    let that = this; 
    $.ajax({
        type: "post",
        dataType: "json",
        url:
          `/litong/public/index.php/index/index/vote?nid=${nid}&id=${id}`,
        success(result) {
          
            let res = JSON.parse(result)
            if(res['code'] == 1){
              that.userInfo.vote_record = res.data; 
              localStorage['userInfo'] = JSON.stringify(that.userInfo);
              that.visit();
            }else{
                that.showMessage("error",res['msg'],2000);
                if(res['code'] == 0){
                  // $btn.addClass('inactive');
                  // $btn.text('投他一票');
                }else if (res['code']  ==2){
                  $btn.removeClass('inactive');
                  $btn.text('投他一票');
                }
               
                that.userInfo.vote_record = res.data;
                localStorage['userInfo'] = JSON.stringify(that.userInfo);

                $span.text(+$span.text() - 1)
                that.voteCountBox.text(+that.voteCountBox.text()+1);
            }
        },
        error(err) {
           $span.text(+$span.text() - 1);
           that.showMessage("error","投票失败，请再投一次",2000);
           $btn.removeClass('inactive');
           $btn.text('投他一票');
           that.voteCountBox.text(+that.voteCountBox.text()+1);
        }
    });
  },
  visit(){
    let that = this; 
    $.ajax({
        type: "get",
        dataType: "json",
        url:
          `/litong/public/index.php/index/index/visit`,
        success(result) {
          
            let res = JSON.parse(result)
            if(res['code'] == 1){
                $("#v_count").text(res.data.u)
                $("#u_count").text(res.data.v)
                $("#l_count").text(res.data.l)

            }
        },
        error(err) {
            that.showMessage("error","网络链接失败，请刷新页面",2000);
        }
    });
  },
  showNoData(){
    !$("#noData").hasClass("show") && $("#noData").addClass('show');
    this.isNodata = true;
  },
  hideNoData(){
    $("#noData").hasClass("show") && $("#noData").removeClass('show');
    this.isNodata = false;
  },
  /**
   * 计算按钮样式
   * @param {*} that 
   */
  changeStatus(that){
    
    $(".btn").forEach(el=>{
      let $el = $(el)
      that.userInfo.vote_record.forEach(vr =>{
        if(vr.vid ==  $el.attr('item')){
          if( !$el.hasClass("inactive")){  $el.addClass("inactive") ,$el.text("已投票")}
        }
      })
    })
  }


};

votePm.init();
