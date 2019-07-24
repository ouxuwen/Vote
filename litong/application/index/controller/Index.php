<?php
namespace app\index\controller;
use think\Model;
use think\Request;
use think\Db;
class Index extends Model
{
    public function message($code = 1,$msg="请求成功",$data=[]){
        return [
            "code"=>$code,
            "msg"=>$msg,
            "data"=>$data
        ];
    }

    public function visit(){
        $request = Request::instance();
        Db::table('liu')->insert(['ip'=>$request->ip() ,'time'=>time()]);
        $u_count = Db::table('vote_record')->count('id');
        $v_count = Db::table('voter')->count('id');
        $l_count = Db::table('liu')->count('id');
        // $voters = Db::table('voter')->select();
        return json_encode(
            $this->message(1,"success",[
                "u"=>$u_count,
                "v"=>$v_count,
                "l"=>$l_count,
                // "voters"=>$voters
            ]) 
        );
    }

    public function login()
    {
        $request = Request::instance();
        $param = $request->param();
        $result = Db::table('user')->where('name',$param['name'] )->find();
        $vote_record = Db::table('vote_record')->where('uid',$result['id'] )->select();
        if($result){
            $result['vote_record'] = $vote_record;
            return json_encode(
                $this->message(1,"success",$result) 
            );
        }else{
            return json_encode(
              $this->message(0,"用户不存在") 
            );
        }
    }


    public function vote(){
        $request = Request::instance();
        $param = $request->param();
        $nid = $param['nid'];
        $id = $param['id'];

        $user = Db::table('user')->where('id',$nid )->find();
        if(!$user){
            return json_encode(
                $this->message(2,"您好像不是本公司的员工",$data) 
            );
        }

        $result = Db::table('vote_record')->where('uid',$nid )->where('vid',$id)->find();
        if($result){
                $data = Db::table('vote_record')->where('uid',$nid )->select();
                return json_encode(
                    $this->message(0,"您已经投过{$id}号了",$data) 
                );
        }else{

            $data = Db::table('vote_record')->where('uid',$nid )->select();
            if(count($data)>=5){
                return json_encode(
                    $this->message(2,"您已经没有票数了",$data) 
                );
            }

            $vote_result = Db::table('voter')->where('id',$id  )->setInc('votes');
            $vote = Db::table('voter')->where('id',$id  )->find();
            $update_result =  Db::table('vote_record')->insert(['uid'=>$nid,'vid'=>$id,'name'=>$vote["name"],'time'=>time()]);
            $data = Db::table('vote_record')->where('uid',$nid )->select();

            return json_encode(
                $this->message(1,"投票成功",$data)
            );
        }
    }


    public function voter(){
        $request = Request::instance();
        $param = $request->param();
        // $keyword = $param['keyword'];
        // $from = $param['from']; 
        // $count = $param['count'];
        // ->where('id|name','like',"%$keyword%")->limit($from,$count)
        $result = Db::table('voter')->select();
        
        if($result){
            return json_encode(
                $this->message(1,"success",$result) 
            );
        }else{
            return json_encode(
                $this->message(0,"网络异常，请刷新页面",$result) 
            );
        }
  
         
    }

}
