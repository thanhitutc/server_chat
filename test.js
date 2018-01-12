var arr = [
{"name":"thanh",
 "age": 20},
 {"name":"su",
  "age":17}];
  
  for(j in arr){
	//console.log("ban dau", arr[j]);
	if (arr[j].name == "thanh") {
		arr[j].age = "hihi";
	} 
	console.log("luc sau: " ,arr[j]); 
  }