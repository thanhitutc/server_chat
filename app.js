var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var fs = require("fs");
var mysql = require("mysql");
server.listen(process.env.PORT || 3000);

var userArray =[];
var passArray = [];
var phoneNumberArray =[];
var jsonArrayUser=[];
var jsonArrayRoom = [];

const EVENT_CLIENT_SEND_REGISTER = "com.thanhclub.dalochat.eventsendusernameregister";
const EVENT_SERVER_SEND_RESULT_REGISTER= "com.thanhclub.dalochat.eventreceiptresultregister";

const EVENT_CLIENT_SEND_USERNAME_LOGIN = "com.thanhclub.dalochat.eventsendusernamelogin";
const EVENT_SERVER_SEND_RESULT_LOGIN= "com.thanhclub.dalochat.eventreceiptresultlogin";

const EVENT_CLIENT_SEND_REQUEST_UPDATEUSER= "com.thanhclub.dalochat.eventsendrequesupdateuser";
const EVENT_SERVER_SEND_RESULT_UPDATEUSER= "com.thanhclub.dalochat.eventreceiptupdateuser";

const EVENT_CLIENT_SEARCH_USER = "com.thanhclub.dalochat.eventsendsearchuser";
const EVENT_SERVER_SEND_RESULT_SEARCH_USER = "com.thanhclub.dalochat.eventreceiptressultsearchuser";

const EVENT_CLIENT_REQUEST_ADD_FRIEND ="com.thanhclub.dalochat.eventsendrequestaddfriend";
const EVENT_LISTEN_REQUEST_ADD_FRIEND= "com.thanhclub.dalochat.eventlistenrequestaddfriend";

const EVENT_JOIN_ROOM_MYSELF= "com.thanhclub.dalochat.eventjoinroommyself";
//khi login nhan danh sach ng yeu cau ket ban
const EVENT_GET_LIST_REQUEST_ADD_FRIEND= "com.thanhclub.dalochat.eventgetlistrequestaddfriend";
const EVENT_RECEIPT_LIST_REQUEST_ADD_FRIEND= "com.thanhclub.dalochat.eventrecipetlistrequestaddfriend";
//gui xac nhan ket ban
const EVENT_SEND_RESULT_REQUEST_ADD_FRIEND= "com.thanhclub.dalochat.eventsendresultrequestaddfriend";

//gui thong bao xoa yeu cau ket ban
const EVENT_LISTEN_SERVER_DELETE_REQUEST_ADDFRIEND= "com.thanhclub.dalochat.eventlistenserverdeleterequestaddfriend";
const EVENT_RESULT_DELETE_REQUEST_ADDFRIEND= "com.thanhclub.dalochat.eventresultdeleterequestaddfriend";

//gui thong bao chap nhan ket ban thanh cong
const EVENT_RESULT_ACCEPT_ADD_FRIEND="com.thanhclub.dalochat.eventresultacceptaddfriend";
//khoi tao listfriend khi dang nhap
const EVENT_INIT_LIST_FRIEND="com.thanhclub.dalochat.eventinitlistfriend";
// lay danh sach ban be
const EVENT_GET_LIST_FRIEND="com.thanhclub.dalochat.eventgetlistfriend";
const EVENT_RESULT_GET_LIST_FRIEND="com.thanhclub.dalochat.eventresultgetlistfriend";
// thong bao dong y ket ban
const EVENT_LISTEN_ACCEPT_ADD_FRIEND="com.thanhclub.dalochat.eventlistenacceptaddfriend";
//kiem tra da gui loi moi ket ban chua
const EVENT_CHECK_EXIST_REQUEST_FRIEND="com.thanhclub.dalochat.eventcheckexistrequestaddfriend";
const EVENT_RESULT_CHECK_EXIST_REQUEST_FRIEND="com.thanhclub.dalochat.eventresultcheckexistrequestaddfriend";
//huy yeu cau da ket ban
const EVENT_CANCEL_REQUESTED_ADDFRIEND = "com.thanhclub.dalochat.eventcancelrequestaddfriend";

var conn = mysql.createConnection({
    host    : 'localhost',
    user    : 'root',
    password: '',
    database: 'server_chat',
});

conn.connect(function (err){
        console.log('ket noi thanh cong');
        conn.query("select * from usertable",function(err,result, fiels){
                if (err) throw err;
                for(var i=0; i < result.length ; i++){
                    userArray.push(result[i].u_name);
                    passArray.push(result[i].u_pass_word);
                    phoneNumberArray.push(result[i].u_phone_number);
                }
                jsonArrayUser = result;
                console.log('so luong tai khoan: ', jsonArrayUser.length);
console.log(jsonArrayUser);
            });
        });
        
        conn.query("select * from conversationtable", function(err, result, fiels){
            if (err) throw err;
            jsonArrayRoom = result;
            //console.log(jsonArrayRoom);
        });
//tam thoi chua dung`
function addUserArr11(id, name, pass, firstname, lastname, logo, birth, sex, phone, des, status, timeoff){
    jsonArrayUser.push({
        "u_id":id,
        "u_name":name,
        "u_pass_word":pass,
        "u_first_name":firstname,
        "u_last_name":lastname,
        "u_logo":logo,
        "u_birth_day":birth,
        "u_sex":sex,
        "u_phone_number":phone,
        "u_description":des,
        "u_status":status,
        "u_time_off":timeoff
    });
}; 

function addUserArr(id, name, pass){
    jsonArrayUser.push({
        "u_id":id,
        "u_name":name,
        "u_pass_word":pass});
};

function addConversationArr(id,name){
    jsonArrayRoom.push({"c_id": id,
                        "c_name" : name,
                        "c_date_create": ""
    });
}





//===================================================

io.sockets.on('connection', function (socket) {
    console.log("co ng ket noi");
    var isInitListFriendSuccess = false;

    
    // moi ng connnect tao 1 arrlist luu danh sach ban be cua tung ng
    var jsonArrYourFriend = [];
//----FUNCTION them vao danh sach ban be-------------------------

    function addLisfriend(uid, uname, ufirst, ulast, ulogo, ubirth, usex, uphone, udes, ustatus, utimeof, cid){
        // jsonArrYourFriend.push({
        //     "info" : arr,
        //     "c_id" :id_roomz
        // });

        jsonArrYourFriend.push({
            "u_id": uid,
            "u_name": uname,
            "u_first_name": ufirst,
            "u_last_name": ulast,
            "u_logo": ulogo,
            "u_birth_day": ubirth,
            "u_sex": usex,
            "u_phone_number": uphone,
            "u_description": udes,
            "u_status": ustatus,
            "u_time_off": utimeof,
            "c_id": cid
        });
    }
//-----------------event join room listen event request add friend----
        socket.on(EVENT_JOIN_ROOM_MYSELF, function(data){
            socket.join(data);
        });
     
    conn.connect(function (err){

//--------------------- event dang ky tai khoan----------------------------
        socket.on(EVENT_CLIENT_SEND_REGISTER, function(data){
            let checkAvaiable = false;
            let user = data.split("_")[0];
            let pass = data.split("_")[1];
            if(userArray.indexOf(user) > -1 ){
                checkAvaiable = false;
                console.log("da ton tai");
            }
            else{
                checkAvaiable = true;
                var sql = 'insert into usertable(u_name,u_pass_word) values ("'+user+ '", "'+ pass+'") ';
                conn.query(sql,function(err, result){
                    if (err){
                        throw err;
                        checkAvaiable = false;
                    }else{
                        userArray.push(user); 
                        passArray.push(pass);
                        addUserArr(result.insertId,user,pass);

                        // console.log('so luong tai khoan: ', jsonArrayUser.length);
                        // console.log(jsonArrayUser);
                    }
                    
                });

            }  
            socket.emit(EVENT_SERVER_SEND_RESULT_REGISTER, { ketqua: checkAvaiable});
            //dang ki thi tao phong rieng nhan cac su kien cho user do
            if(checkAvaiable){
                let sqlCreatRoom = 'insert into conversationtable(c_name) values ("'+user+'")';
                conn.query(sqlCreatRoom, function(err, result){
                    if(err) throw err;
                    addConversationArr(result.insertId, user);
                });
                
            } 

        });

//------------------event update tai khoan---------------------------------------
        socket.on(EVENT_CLIENT_SEND_REQUEST_UPDATEUSER, function(data){
            let userKey = data.split("_")[0];
            let firstName = data.split("_")[1];
            let lastName = data.split("_")[2];
            let logo = data.split("_")[3];
            let birthday = data.split("_")[4];
            let sex = data.split("_")[5];
            let phoneNumber = data.split("_")[6];
            let description = data.split("_")[7];
            let checkUpdateSuccess = false;
            let sqlUpdate = 
            'UPDATE usertable SET u_first_name = "'+firstName+'", u_last_name = "'+lastName+'", u_logo ="'+logo+'",u_birth_day = "'+birthday+'",u_sex ="'+sex+'",u_phone_number = "'+phoneNumber+'",u_description = "'+description+'" where u_name = "'+userKey+'"';
            conn.query(sqlUpdate, function(err){
                if (err){
                 throw err;  
                 checkUpdateSuccess = false; 
                }else{
                    checkUpdateSuccess = true;  
                    // cap nhat lai jsonArrayUser
                    for(i in jsonArrayUser){
                        if (userKey == jsonArrayUser[i].u_name) {
                            jsonArrayUser[i].u_first_name = firstName; 
                            jsonArrayUser[i].u_last_name = lastName;
                            jsonArrayUser[i].u_logo = logo;
                            jsonArrayUser[i].u_birth_day = birthday;
                            jsonArrayUser[i].u_sex = sex;
                            jsonArrayUser[i].u_phone_number = phoneNumber;
                            jsonArrayUser[i].u_description = description;
                            jsonArrayUser[i].u_status = '';
                            jsonArrayUser[i].u_time_off = '';
                        }
                    }
                } 
                socket.emit(EVENT_SERVER_SEND_RESULT_UPDATEUSER, {ketqua: checkUpdateSuccess});
            });
            

        });

//---------------------event dang nhap---------------------------------------
        socket.on(EVENT_CLIENT_SEND_USERNAME_LOGIN, function(data){          
            let checkLoginSuccess = false;
            var user = data.split("_")[0];
            let pass = data.split("_")[1];
            let idUser;
            if( userArray.indexOf(user) <= -1 || passArray.indexOf(pass) <=-1){
                checkLoginSuccess = false;
                socket.emit(EVENT_SERVER_SEND_RESULT_LOGIN,{ketqua : checkLoginSuccess}); 
                return;
            }
            let index;
            let sql = 'select u_id,u_name, u_pass_word,u_phone_number from usertable';
            conn.query(sql, function(err, result){
                for(var i=0; i < result.length; i++){
                    if(user==(result[i].u_name) && pass==(result[i].u_pass_word)){
                        checkLoginSuccess = true;
                        idUser = result[i].u_id;
                        socket.Ten = user; 
                        break;
                    }
                }
            socket.emit(EVENT_SERVER_SEND_RESULT_LOGIN,{ketqua : checkLoginSuccess+"_"+idUser}); 
            });         
            
        }); 

//----------------event khoi tao list friend-----------------
        socket.on(EVENT_INIT_LIST_FRIEND, function(idMyself){
            // isInitListFriendSuccess = false;
            // var arrFriend = [];
            // arrFriend.length = 0;
            // jsonArrYourFriend.length =0;
            // function addArrFriend(userId, roomId){
            //     arrFriend.push({"userId": userId,
            //                     "roomId": roomId
            //     });
            // }

            // let sqlGetListFriends = 'select u_myself, u_friend, c_id from friendtable where u_myself = "'+idMyself+'" or u_friend= "'+idMyself+'"';
            // conn.query(sqlGetListFriends, function(err, result){
            //     if(err) throw err;
            //     for(i in result){
            //         if(result[i].u_friend == idMyself){
            //             //arrFriend.push(result[i].u_myself);
            //             addArrFriend(result[i].u_myself, result[i].c_id);
            //         }
            //         if(result[i].u_myself == idMyself){
            //             //arrFriend.push(result[i].u_friend);
            //             addArrFriend(result[i].u_friend, result[i].c_id);
            //         }
            //     }
            //     //console.log(arrFriend);
            //     for(i in arrFriend){
            //         jsonArrayUser.filter(function (item) {
            //             if (item.u_id == arrFriend[i].userId) {
            //                 addLisfriend(item.u_id, item.u_name, item.u_first_name, item.u_last_name,item.u_logo, item.u_birth_day, item.u_sex, item.u_phone_number,item.u_description,item.u_status,item.u_time_off,arrFriend[i].roomId);
            //             }
            //         });
            //     }
            //     isInitListFriendSuccess = true;
            //     console.log("init-LIST: " + socket.Ten);            
            //}); 
        });

//------------------------event get list request add friend-----------------------------

        socket.on(EVENT_GET_LIST_REQUEST_ADD_FRIEND, function(userReceive){
            // tim id_room cua user
            for(j in jsonArrayRoom){
                if (jsonArrayRoom[j].c_name == userReceive) {
                    var conversation_id = jsonArrayRoom[j].c_id;
                }
            }
            let sqlsearch = 'select messagetable.m_user_id, messagetable.m_body, usertable.u_logo, usertable.u_name, usertable.u_sex, usertable.u_first_name, usertable.u_last_name,usertable.u_phone_number from messagetable, usertable where usertable.u_id = messagetable.m_user_id && c_id = "'+conversation_id+'" ';
            conn.query(sqlsearch , function(err,result){
                if (err) throw err;
                socket.emit(EVENT_RECEIPT_LIST_REQUEST_ADD_FRIEND, result);
            });

        });
//---------------------event get list user da moi ket ban--------------------
        socket.on(EVENT_CHECK_EXIST_REQUEST_FRIEND, function(data){
            
            var idMyself = data.split("_")[0];
            let userSearch = data.split("_")[1];
            //tim id phong cua ng dc tim kiem
            for(j in jsonArrayRoom){
                if (jsonArrayRoom[j].c_name == userSearch) {
                    var convers_id = jsonArrayRoom[j].c_id;
                    console.log("id",idMyself+" "+ convers_id);
                }
            }
            let sql = 'select m_user_id from messagetable where c_id = "'+convers_id+'"';
            conn.query(sql, function(err, result){
                if (err) throw err;
                    for(r in result){
                        var exist = false;
                        if (result[r].m_user_id == idMyself) {
                            exist = true;
                            break;
                        }
                    }
                   console.log("TON TAI: ", exist);
                   socket.emit(EVENT_RESULT_CHECK_EXIST_REQUEST_FRIEND, { "ketqua": exist }); 
            });

        });

//------------------------event search user--------------------------------------
        socket.on(EVENT_CLIENT_SEARCH_USER, function(data){
            let sqlSearchUser = 'select * from usertable where u_name = "'+data+'" OR u_phone_number = "'+data+'" ';
            conn.query(sqlSearchUser, function(err, result){
                //console.log(result);
                socket.emit(EVENT_SERVER_SEND_RESULT_SEARCH_USER, result);
            });
        });

//----------------------- event gui yeu cau add friend------------------------------
        socket.on(EVENT_CLIENT_REQUEST_ADD_FRIEND, function(data){
            let idUserRequest = data.split("_")[0];
            let userRequest = data.split("_")[1];
            let userReceive = data.split("_")[2];
            //tao phong chat rieng 2 ng
            var nameCreateRoom = userRequest + userReceive;
            let sqlCreatRom = 'insert into conversationtable (c_name) values ("' +nameCreateRoom+ '")';
            conn.query(sqlCreatRom, function(err, result){
                if (err) throw err;
                addConversationArr(result.insertId, nameCreateRoom);
                //console.log(jsonArrayRoom);
            });

            // tim id room de add vao message phong nhan yeu cau
            for(j in jsonArrayRoom){
                if (jsonArrayRoom[j].c_name == userReceive) {
                    var conversation_id = jsonArrayRoom[j].c_id;
                }
            }   
            let sqlSendRequest = 'insert into messagetable(m_body,m_user_id,c_id) values ("'+userRequest+' đã gửi lời mời kết bạn!","'+idUserRequest+'","'+conversation_id+'" )';
            conn.query(sqlSendRequest, function(err, result){
                if (err) throw err;
                //gui thong tin nguoi yeu cau ve client 
                var informationUserRequest = jsonArrayUser.filter(function (item) {
                return item.u_name == userRequest;
                });
           
                socket.join(userReceive);
                socket.broadcast.in(userReceive).emit(EVENT_LISTEN_REQUEST_ADD_FRIEND, informationUserRequest);
            });

            
            
        });

//---------------event xac nhan yeu cau ket ban--------------------
        socket.on(EVENT_SEND_RESULT_REQUEST_ADD_FRIEND, function(data){
            let typeAction = data.split("_")[0];
            let yourUser = data.split("_")[1];
            var userRequest = data.split("_")[2];
             // lay ra c_id de xoa message ket ban   
            for(j in jsonArrayRoom){
                if (jsonArrayRoom[j].c_name == yourUser) {
                    var c_id = jsonArrayRoom[j].c_id;
                }
            }
            //lay id_user yeu cau ket ban de xoa message ket ban
            for(i in jsonArrayUser){
                if (jsonArrayUser[i].u_name == userRequest) {
                    var u_id_request = jsonArrayUser[i].u_id;
                }
            }
        
            let sqlDeleteRequest = 'delete from messagetable where c_id ="'+ c_id +'" and m_user_id ="'+ u_id_request +'"';
            conn.query(sqlDeleteRequest, function(err, result){
                if (err) throw err;
                //todo emit client delete database
                socket.emit(EVENT_LISTEN_SERVER_DELETE_REQUEST_ADDFRIEND, {"userRequest": userRequest});
            });
            var nameRoomCreated = userRequest+yourUser;
            if (typeAction=="CANCEL") {
                //xoa phong da tao luc yeu cau ket ban va xoa trong arr tren server
                for(r in jsonArrayRoom){
                    if (jsonArrayRoom[r].c_name == nameRoomCreated) {
                        jsonArrayRoom.splice(r,1);
                    }
                }
                let sqlDeleteRoomCreated = 'delete from conversationtable where c_name = "'+nameRoomCreated+'"';
                conn.query(sqlDeleteRoomCreated, function(err, result){
                if (err) throw err;
                socket.emit(EVENT_RESULT_DELETE_REQUEST_ADDFRIEND, {"ketqua":"true"});
            });
            }
            if (typeAction == "ACCEPT") {
                //add du lieu vao friendtable

                //lay ra id phong rieng 2 ng
                for(r in jsonArrayRoom){
                    if (jsonArrayRoom[r].c_name == nameRoomCreated) {
                        var c_id_room = jsonArrayRoom[r].c_id;
                    }
                }
                // lay ra id cua minh
                for(i in jsonArrayUser){
                if (jsonArrayUser[i].u_name == yourUser) {
                    var u_id_myself = jsonArrayUser[i].u_id;
                }
            }
                let sqlAccept = 'insert into friendtable(u_myself, u_friend, c_id) values("'+u_id_myself+'","'+u_id_request+'","'+c_id_room+'")';
                conn.query(sqlAccept, function(err, result){
                    if (err) {
                        isAddFriendSuccess = false;
                        throw err;
                    }
                    // socket.emit(EVENT_RESULT_ACCEPT_ADD_FRIEND,{"ketqua":"true"});

                    jsonArrayUser.filter(function (item) {
                        if (item.u_id == u_id_request) {
                            //addLisfriend(item.u_id, item.u_name, item.u_first_name, item.u_last_name,item.u_logo, item.u_birth_day, item.u_sex, item.u_phone_number,item.u_description,item.u_status,item.u_time_off,c_id_room);
                            // gui thong tin de update list. ca 2 ng... ( ng duoc dong y thi thong bao va gui thong tin tai khoan ve)
                            // khi resume contact fragment thi gui listyourfriend ve thoi(ok)
                            // khi dc thang khasc dong y thi phai get list friend
                            socket.join(userRequest);
                            socket.broadcast.in(userRequest).emit(EVENT_LISTEN_ACCEPT_ADD_FRIEND, item);
                            //console.log("LIST_Friend " + socket.Ten, jsonArrYourFriend);
                            //console.log('gui ve' , item);
                        }
                    });
                    socket.emit(EVENT_RESULT_ACCEPT_ADD_FRIEND,{"ketqua":"true"});
                });
                
            }

        });

//---------------event huy yeu cau da ket ban------------------------
socket.on(EVENT_CANCEL_REQUESTED_ADDFRIEND, function(data){
            let yourUser = data.split("_")[1];
            var userRequest = data.split("_")[0];
             // lay ra c_id de xoa message ket ban   
            for(j in jsonArrayRoom){
                if (jsonArrayRoom[j].c_name == yourUser) {
                    var c_id = jsonArrayRoom[j].c_id;
                }
            }
            //lay id_user yeu cau ket ban de xoa message ket ban
            for(i in jsonArrayUser){
                if (jsonArrayUser[i].u_name == userRequest) {
                    var u_id_request = jsonArrayUser[i].u_id;
                }
            }
        
            let sqlDeleteRequest = 'delete from messagetable where c_id ="'+ c_id +'" and m_user_id ="'+ u_id_request +'"';
            conn.query(sqlDeleteRequest, function(err, result){
                if (err) throw err;
                //todo emit client delete database
                socket.join(yourUser);
                socket.broadcast.in(yourUser).emit(EVENT_LISTEN_SERVER_DELETE_REQUEST_ADDFRIEND, {"userRequest": userRequest});
            });
            var nameRoomCreated = userRequest+yourUser;
            
                //xoa phong da tao luc yeu cau ket ban va xoa trong arr tren server
                for(r in jsonArrayRoom){
                    if (jsonArrayRoom[r].c_name == nameRoomCreated) {
                        jsonArrayRoom.splice(r,1);
                    }
                }
                let sqlDeleteRoomCreated = 'delete from conversationtable where c_name = "'+nameRoomCreated+'"';
                conn.query(sqlDeleteRoomCreated, function(err, result){
                    if (err) throw err;
                    socket.emit(EVENT_RESULT_DELETE_REQUEST_ADDFRIEND, {"ketqua":"true"});
                });

            
    }); 

//--------------------event lay danh sach ban be-----------------------------
        socket.on(EVENT_GET_LIST_FRIEND,function(idMyself){
            isInitListFriendSuccess = false;
            var arrFriend = [];
            arrFriend.length = 0;
            jsonArrYourFriend.length =0;
            function addArrFriend(userId, roomId){
                arrFriend.push({"userId": userId,
                                "roomId": roomId
                });
            }

            let sqlGetListFriends = 'select u_myself, u_friend, c_id from friendtable where u_myself = "'+idMyself+'" or u_friend= "'+idMyself+'"';
            conn.query(sqlGetListFriends, function(err, result){
                if(err) throw err;
                for(i in result){
                    if(result[i].u_friend == idMyself){
                        addArrFriend(result[i].u_myself, result[i].c_id);
                    }
                    if(result[i].u_myself == idMyself){
                        addArrFriend(result[i].u_friend, result[i].c_id);
                    }
                }
                //console.log(arrFriend);
                for(i in arrFriend){
                    jsonArrayUser.filter(function (item) {
                        if (item.u_id == arrFriend[i].userId) {
                            addLisfriend(item.u_id, item.u_name, item.u_first_name, item.u_last_name,item.u_logo, item.u_birth_day, item.u_sex, item.u_phone_number,item.u_description,item.u_status,item.u_time_off,arrFriend[i].roomId);
                        }
                    });
                }    
                socket.emit(EVENT_RESULT_GET_LIST_FRIEND, jsonArrYourFriend); 
                console.log("get-LIST: " + socket.Ten); 
                console.log(jsonArrYourFriend);     
            }); 
        });
    
    });  

});
