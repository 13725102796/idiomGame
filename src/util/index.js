export function throttle(fn){
  let status = true
  return function(){
    if(!status) return 
    status = false
    setTimeout(function() {
      fn.apply(this,arguments)
      status = true
    }, 1000);
  }
}

export function debence(fn){
  let status = null
  return function (){
    clearTimeout(status)
    status = setTimeout(function(){
      fn.apply(this,arguments)
    },1000)
  }
}
export function shuffle(a) {
  var len = a.length;
 for (var i = 0; i < len - 1; i++) {
     var index = parseInt(Math.random() * (len - i));
     var temp = a[index];
     a[index] = a[len - i - 1];
     a[len - i - 1] = temp;
 }
 return a;
}

// export function parseInt() {
//   if (location.search.length <= 0) return false;
//   var info = location.search.slice(1);
//   var result = {};
//   console.log(info)
//   if (info.indexOf('&') > 0) {
//     info.split('&').foreach(item => {
//       result[decodeURIComponent(item.split('=')[0])] = decodeURIComponent(item.split('=')[1]);
//     });
//   } else {
//     result[decodeURIComponent(info.split('=')[0])] = decodeURIComponent(info.split('=')[1]);
//   }

//   console.log(result)
//   return result;
// }