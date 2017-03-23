var list = [{
	u:1,
	d:1,
	s:1
},{
	u:1,
	d:2,
	s:3
},{
	u:1,
	d:3,
	s:2
},{
	u:2,
	d:2,
	s:2
},{
	u:2,
	d:3,
	s:3
},{
	u:2,
	d:3,
	s:1
},{
	u:4,
	d:3,
	s:4
}]

let m = {};
for(let i=0;i<list.length;i++){
let item = list[i];
let array = [0,0,0,0]
if(m[item.d]){
	array = m[item.d]
}
array[item.s-1] = 1;
m[item.d] = array;
}
console.log(m)